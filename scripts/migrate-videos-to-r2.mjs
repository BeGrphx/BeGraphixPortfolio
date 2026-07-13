import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { spawn } from "node:child_process";
import nextEnv from "@next/env";
import {
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const required = [
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_ENDPOINT",
  "R2_PUBLIC_BASE_URL",
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing environment variables: ${missing.join(", ")}`);
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01";

if (!projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required");
}

const workDir = join(tmpdir(), "begraphix-media-migration");
const originalsDir = join(workDir, "originals");
const optimizedDir = join(workDir, "optimized");
const manifestPath = join(workDir, "manifest.json");

await mkdir(originalsDir, { recursive: true });
await mkdir(optimizedDir, { recursive: true });

const ffmpegBin =
  process.env.FFMPEG_PATH ??
  join(
    homedir(),
    "AppData",
    "Local",
    "Microsoft",
    "WinGet",
    "Packages",
    "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
    "ffmpeg-8.1.2-full_build",
    "bin",
    "ffmpeg.exe",
  );

const ffprobeBin =
  process.env.FFPROBE_PATH ??
  join(
    homedir(),
    "AppData",
    "Local",
    "Microsoft",
    "WinGet",
    "Packages",
    "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
    "ffmpeg-8.1.2-full_build",
    "bin",
    "ffprobe.exe",
  );

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const query =
  '*[_type == "sanity.fileAsset" && mimeType match "video/*"]{_id,url,size,originalFilename,mimeType} | order(size desc)';
const queryUrl = new URL(
  `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`,
);
queryUrl.searchParams.set("query", query);

const response = await fetch(queryUrl);
if (!response.ok) {
  throw new Error(`Sanity asset query failed with ${response.status}`);
}

const payload = await response.json();
const assets = payload.result;
const previousManifest = await readJsonIfPresent(manifestPath);
const entries = new Map(
  (previousManifest?.assets ?? []).map((asset) => [asset.sanityId, asset]),
);

console.log(`Found ${assets.length} Sanity videos`);
console.log(`Work directory: ${workDir}`);

for (const [index, asset] of assets.entries()) {
  const hash = asset._id.replace(/^file-/, "").replace(/-[^-]+$/, "");
  const extension = normalizeExtension(extname(asset.originalFilename), asset.mimeType);
  const originalPath = join(originalsDir, `${hash}${extension}`);
  const optimizedPath = join(optimizedDir, `${hash}.mp4`);
  const originalKey = `originals/${hash}${extension}`;
  const deliveryKey = `media/${hash}.mp4`;

  console.log(
    `[${index + 1}/${assets.length}] ${asset.originalFilename} (${formatMb(asset.size)})`,
  );

  await downloadIfMissing(asset.url, originalPath, asset.size);
  const originalFile = await stat(originalPath);

  await uploadFile({
    key: originalKey,
    path: originalPath,
    size: originalFile.size,
    contentType: asset.mimeType,
  });

  const probe = await probeVideo(originalPath);
  const shouldOptimize = originalFile.size > 20 * 1024 * 1024;
  let deliveryPath = originalPath;
  let optimized = false;

  if (shouldOptimize) {
    await transcodeIfMissing(originalPath, optimizedPath);
    const optimizedFile = await stat(optimizedPath);

    if (optimizedFile.size < originalFile.size) {
      deliveryPath = optimizedPath;
      optimized = true;
    }
  }

  const deliveryFile = await stat(deliveryPath);
  await uploadFile({
    key: deliveryKey,
    path: deliveryPath,
    size: deliveryFile.size,
    contentType: "video/mp4",
  });

  const publicUrl = `${trimTrailingSlash(process.env.R2_PUBLIC_BASE_URL)}/${deliveryKey}`;
  const publicResponse = await fetch(publicUrl, {
    headers: { Range: "bytes=0-1023" },
  });
  if (!publicResponse.ok && publicResponse.status !== 206) {
    throw new Error(
      `Public verification failed for ${deliveryKey}: ${publicResponse.status}`,
    );
  }

  entries.set(asset._id, {
    sanityId: asset._id,
    filename: asset.originalFilename,
    mimeType: asset.mimeType,
    sanityUrl: asset.url,
    originalSize: originalFile.size,
    deliverySize: deliveryFile.size,
    optimized,
    originalR2Key: originalKey,
    deliveryR2Key: deliveryKey,
    publicUrl,
    probe,
  });

  await writeManifest(manifestPath, {
    generatedAt: new Date().toISOString(),
    workDir,
    assets: [...entries.values()],
  });

  console.log(
    `  ready: ${formatMb(originalFile.size)} -> ${formatMb(deliveryFile.size)}${optimized ? " optimized" : " unchanged"}`,
  );
}

const finalManifest = {
  generatedAt: new Date().toISOString(),
  workDir,
  assets: [...entries.values()],
};
await writeManifest(manifestPath, finalManifest);

const originalTotal = finalManifest.assets.reduce(
  (sum, asset) => sum + asset.originalSize,
  0,
);
const deliveryTotal = finalManifest.assets.reduce(
  (sum, asset) => sum + asset.deliverySize,
  0,
);

console.log(`Original total: ${formatMb(originalTotal)}`);
console.log(`Delivery total: ${formatMb(deliveryTotal)}`);
console.log(`Manifest: ${manifestPath}`);
console.log("MIGRATION_COMPLETE");

async function downloadIfMissing(url, path, expectedSize) {
  const existing = await statOrNull(path);
  if (existing?.size === expectedSize) {
    console.log("  download: cached");
    return;
  }

  const download = await fetch(url);
  if (!download.ok || !download.body) {
    throw new Error(`Download failed with ${download.status}: ${url}`);
  }

  const temporaryPath = `${path}.part`;
  await pipeline(
    Readable.fromWeb(download.body),
    createWriteStream(temporaryPath),
  );
  await rename(temporaryPath, path);
  console.log("  download: complete");
}

async function uploadFile({ key, path, size, contentType }) {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: createReadStream(path),
      ContentLength: size,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

async function transcodeIfMissing(input, output) {
  const existing = await statOrNull(output);
  if (existing?.size) {
    console.log("  transcode: cached");
    return;
  }

  const temporaryPath = `${output}.part.mp4`;
  await run(ffmpegBin, [
    "-hide_banner",
    "-loglevel",
    "warning",
    "-y",
    "-i",
    input,
    "-map",
    "0:v:0",
    "-map",
    "0:a?",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "19",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-movflags",
    "+faststart",
    temporaryPath,
  ]);
  await rename(temporaryPath, output);
  console.log("  transcode: complete");
}

async function probeVideo(path) {
  const output = await run(ffprobeBin, [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=codec_name,width,height,r_frame_rate:format=duration,bit_rate",
    "-of",
    "json",
    path,
  ]);
  return JSON.parse(output);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
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

async function writeManifest(path, value) {
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(value, null, 2));
  await rename(temporaryPath, path);
}

async function readJsonIfPresent(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

async function statOrNull(path) {
  try {
    return await stat(path);
  } catch {
    return null;
  }
}

function normalizeExtension(extension, mimeType) {
  if (extension) return extension.toLowerCase();
  if (mimeType === "video/webm") return ".webm";
  return ".mp4";
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function formatMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
