import { createReadStream, createWriteStream } from "node:fs";
import {
  mkdir,
  mkdtemp,
  rename,
  rm,
  stat,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { spawn } from "node:child_process";
import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import nextEnv from "@next/env";
import { createClient } from "next-sanity";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const requiredEnvironmentVariables = [
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_ENDPOINT",
  "R2_PUBLIC_BASE_URL",
];
const dryRun = process.env.MEDIA_PIPELINE_DRY_RUN === "1";
if (!dryRun) {
  requiredEnvironmentVariables.push("SANITY_API_WRITE_TOKEN");
}
const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
  (name) => !process.env[name],
);

if (missingEnvironmentVariables.length) {
  throw new Error(
    `Missing environment variables: ${missingEnvironmentVariables.join(", ")}`,
  );
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01";
const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL.replace(/\/+$/, "");
const ffmpegBin = process.env.FFMPEG_PATH ?? "ffmpeg";
const ffprobeBin = process.env.FFPROBE_PATH ?? "ffprobe";

const sanity = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const documents = await sanity.fetch(
  '*[_type in ["project", "siteSettings"] && !(_id in path("drafts.**"))]',
);
const usages = collectVideoUsages(documents);

if (!usages.size) {
  console.log("No referenced Sanity videos found.");
  process.exit(0);
}

const assetIds = [...usages.keys()];
const assets = await sanity.fetch(
  '*[_type == "sanity.fileAsset" && _id in $assetIds]{_id,url,size,originalFilename,mimeType}',
  { assetIds },
);
const assetsById = new Map(assets.map((asset) => [asset._id, asset]));
const deliveryUrls = new Map();
const workDirectory = await mkdtemp(join(tmpdir(), "begraphix-media-"));

console.log(
  `Checking ${assetIds.length} referenced video asset${assetIds.length > 1 ? "s" : ""}.`,
);

try {
  for (const [index, assetId] of assetIds.entries()) {
    const asset = assetsById.get(assetId);
    if (!asset) {
      throw new Error(`Sanity asset not found: ${assetId}`);
    }

    const usage = usages.get(assetId);
    const deliveryUrl = await ensureR2Delivery({
      asset,
      usage,
      workDirectory,
      position: `${index + 1}/${assetIds.length}`,
    });
    deliveryUrls.set(assetId, deliveryUrl);
  }

  const patches = buildDocumentPatches(documents, deliveryUrls);
  for (const patch of patches) {
    if (dryRun) {
      console.log(
        `Would update ${patch.documentId}: ${Object.keys(patch.set).join(", ")}`,
      );
      continue;
    }

    await sanity.patch(patch.documentId).set(patch.set).commit({
      visibility: "sync",
      tag: "begraphix.automatic-media-pipeline",
    });
    console.log(
      `Updated ${patch.documentId}: ${Object.keys(patch.set).join(", ")}`,
    );
  }

  if (!dryRun && patches.length) {
    await revalidateSite({
      documents,
      patchedDocumentIds: patches.map((patch) => patch.documentId),
    });
  }

  console.log(
    `${dryRun ? "MEDIA_PIPELINE_DRY_RUN" : "MEDIA_PIPELINE_COMPLETE"} assets=${assetIds.length} documents=${patches.length}`,
  );
} finally {
  await rm(workDirectory, { recursive: true, force: true });
}

async function ensureR2Delivery({
  asset,
  usage,
  workDirectory,
  position,
}) {
  const hash = getAssetHash(asset._id);
  const extension = normalizeExtension(
    extname(asset.originalFilename ?? ""),
    asset.mimeType,
  );
  const originalKey = `originals/${hash}${extension}`;
  const deliveryKey = `media/${hash}.mp4`;
  const deliveryUrl = `${publicBaseUrl}/${deliveryKey}`;

  process.stdout.write(
    `[${position}] ${asset.originalFilename ?? asset._id} (${formatMb(asset.size)})`,
  );

  if (await objectExists(deliveryKey)) {
    console.log(" — already optimized");
    return deliveryUrl;
  }

  console.log("");
  const assetDirectory = join(workDirectory, hash);
  const originalPath = join(assetDirectory, `original${extension}`);
  const optimizedPath = join(assetDirectory, "delivery.mp4");
  await mkdir(assetDirectory, { recursive: true });
  await download(asset.url, originalPath);

  if (!(await objectExists(originalKey))) {
    await uploadFile({
      key: originalKey,
      path: originalPath,
      contentType: asset.mimeType ?? "application/octet-stream",
    });
    console.log("  original: uploaded");
  }

  const probe = await probeVideo(originalPath);
  const sourceIsBrowserReady =
    extension === ".mp4" &&
    probe.videoCodec === "h264" &&
    probe.pixelFormat === "yuv420p";
  const shouldTranscode =
    !sourceIsBrowserReady || asset.size > 20 * 1024 * 1024;
  let deliveryPath = originalPath;

  if (shouldTranscode) {
    await transcodeVideo({
      input: originalPath,
      output: optimizedPath,
      includeAudio: usage.requiresAudio,
      quality: usage.requiresAudio ? 19 : 21,
    });

    const [originalFile, optimizedFile] = await Promise.all([
      stat(originalPath),
      stat(optimizedPath),
    ]);
    if (!sourceIsBrowserReady || optimizedFile.size < originalFile.size) {
      deliveryPath = optimizedPath;
    }

    console.log(
      `  delivery: ${formatMb(originalFile.size)} → ${formatMb((await stat(deliveryPath)).size)}`,
    );
  } else {
    console.log("  delivery: source already browser-ready");
  }

  await uploadFile({
    key: deliveryKey,
    path: deliveryPath,
    contentType: "video/mp4",
  });
  await verifyPublicVideo(deliveryUrl);
  console.log("  R2: uploaded and verified");
  return deliveryUrl;
}

function collectVideoUsages(documentsToScan) {
  const result = new Map();

  const add = (reference, mode) => {
    if (!reference) return;
    const current = result.get(reference) ?? {
      modes: new Set(),
      requiresAudio: false,
    };
    current.modes.add(mode);
    current.requiresAudio ||= mode === "player" || mode === "showreel";
    result.set(reference, current);
  };

  for (const document of documentsToScan) {
    if (document._type === "siteSettings") {
      add(document.showreelVideoFile?.asset?._ref, "background");
      continue;
    }

    add(document.showreelVideoFile?.asset?._ref, "showreel");
    for (const item of document.gallery ?? []) {
      add(item?.videoFile?.asset?._ref, "loop");
    }
    for (const item of document.videoGallery ?? []) {
      add(item?.videoFile?.asset?._ref, "player");
    }
    for (const item of document.media ?? []) {
      add(item?.videoFile?.asset?._ref, "player");
    }
  }

  return result;
}

function buildDocumentPatches(documentsToPatch, urlsByAssetId) {
  const result = [];

  for (const document of documentsToPatch) {
    const set = {};

    if (document._type === "siteSettings") {
      setIfDifferent({
        set,
        path: "showreelVideoUrl",
        currentUrl: document.showreelVideoUrl,
        assetReference: document.showreelVideoFile?.asset?._ref,
      });
    }

    if (document._type === "project") {
      setIfDifferent({
        set,
        path: "showreelVideoUrl",
        currentUrl: document.showreelVideoUrl,
        assetReference: document.showreelVideoFile?.asset?._ref,
      });
      addArrayPatches({
        set,
        items: document.gallery,
        arrayName: "gallery",
        urlField: "videoUrl",
      });
      addArrayPatches({
        set,
        items: document.videoGallery,
        arrayName: "videoGallery",
        urlField: "videoUrl",
      });
      addArrayPatches({
        set,
        items: document.media,
        arrayName: "media",
        urlField: "url",
      });
    }

    if (Object.keys(set).length) {
      result.push({ documentId: document._id, set });
    }
  }

  return result;

  function addArrayPatches({ set, items, arrayName, urlField }) {
    for (const [index, item] of (items ?? []).entries()) {
      const path = item?._key
        ? `${arrayName}[_key=="${item._key}"].${urlField}`
        : `${arrayName}[${index}].${urlField}`;
      setIfDifferent({
        set,
        path,
        currentUrl: item?.[urlField],
        assetReference: item?.videoFile?.asset?._ref,
      });
    }
  }

  function setIfDifferent({
    set,
    path,
    currentUrl,
    assetReference,
  }) {
    const expectedUrl = urlsByAssetId.get(assetReference);
    if (expectedUrl && expectedUrl !== currentUrl) {
      set[path] = expectedUrl;
    }
  }
}

async function download(url, path) {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Download failed with ${response.status}: ${url}`);
  }

  const temporaryPath = `${path}.part`;
  await pipeline(
    Readable.fromWeb(response.body),
    createWriteStream(temporaryPath),
  );
  await rename(temporaryPath, path);
  console.log("  download: complete");
}

async function objectExists(key) {
  try {
    await r2.send(
      new HeadObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      }),
    );
    return true;
  } catch (error) {
    const status =
      error?.$metadata?.httpStatusCode ?? error?.statusCode;
    if (status === 404 || error?.name === "NotFound") return false;
    throw error;
  }
}

async function uploadFile({ key, path, contentType }) {
  const file = await stat(path);
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: createReadStream(path),
      ContentLength: file.size,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

async function transcodeVideo({
  input,
  output,
  includeAudio,
  quality,
}) {
  const temporaryPath = `${output}.part.mp4`;
  const argumentsList = [
    "-hide_banner",
    "-loglevel",
    "warning",
    "-y",
    "-i",
    input,
    "-map",
    "0:v:0",
    ...(includeAudio ? ["-map", "0:a?"] : ["-an"]),
    "-vf",
    "scale='min(1920,iw)':-2",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    String(quality),
    "-pix_fmt",
    "yuv420p",
    ...(includeAudio
      ? ["-c:a", "aac", "-b:a", "160k"]
      : []),
    "-movflags",
    "+faststart",
    temporaryPath,
  ];

  await run(ffmpegBin, argumentsList);
  await rename(temporaryPath, output);
}

async function probeVideo(path) {
  const output = await run(ffprobeBin, [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=codec_name,pix_fmt",
    "-of",
    "json",
    path,
  ]);
  const stream = JSON.parse(output).streams?.[0] ?? {};
  return {
    videoCodec: stream.codec_name,
    pixelFormat: stream.pix_fmt,
  };
}

async function verifyPublicVideo(url) {
  const response = await fetch(url, {
    headers: { Range: "bytes=0-1023" },
  });
  if (!response.ok && response.status !== 206) {
    throw new Error(
      `Public R2 verification failed with ${response.status}: ${url}`,
    );
  }
}

function run(command, argumentsList) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, argumentsList, {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }
      reject(
        new Error(
          `${basename(command)} exited with ${code}: ${stderr.trim()}`,
        ),
      );
    });
  });
}

function getAssetHash(assetId) {
  const match = /^file-([a-f0-9]+)-[^-]+$/i.exec(assetId);
  if (!match) throw new Error(`Invalid Sanity file asset ID: ${assetId}`);
  return match[1];
}

function normalizeExtension(extension, mimeType) {
  if (extension) return extension.toLowerCase();
  if (mimeType === "video/webm") return ".webm";
  if (mimeType === "video/quicktime") return ".mov";
  return ".mp4";
}

function formatMb(bytes = 0) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function revalidateSite({ documents, patchedDocumentIds }) {
  const secret = process.env.REVALIDATE_SECRET;
  const siteUrl = process.env.SITE_URL ?? process.env.VERCEL_URL;
  if (!secret || !siteUrl) {
    console.log(
      "Skipping cache revalidation: REVALIDATE_SECRET or SITE_URL is not set.",
    );
    return;
  }

  const locales = ["fr", "en", "es"];
  const paths = new Set(locales.map((locale) => `/${locale}`));
  const patchedIds = new Set(patchedDocumentIds);

  for (const document of documents) {
    if (!patchedIds.has(document._id)) continue;
    if (document._type === "project" && document.slug?.current) {
      for (const locale of locales) {
        paths.add(`/${locale}/project/${document.slug.current}`);
      }
    }
  }

  const baseUrl = siteUrl.startsWith("http")
    ? siteUrl
    : `https://${siteUrl.replace(/^\/+/, "")}`;
  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/api/revalidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-revalidate-secret": secret,
    },
    body: JSON.stringify({ paths: [...paths] }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Cache revalidation failed with ${response.status}: ${details}`,
    );
  }

  const payload = await response.json();
  console.log(
    `Revalidated ${payload.paths?.length ?? 0} page${payload.paths?.length === 1 ? "" : "s"}.`,
  );
}
