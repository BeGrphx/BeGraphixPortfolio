import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import nextEnv from "@next/env";
import { spawn } from "node:child_process";
import { basename } from "node:path";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const checks = [];
const warnings = [];

function ok(label) {
  checks.push({ label, status: "ok" });
  console.log(`OK   ${label}`);
}

function warn(label, detail) {
  warnings.push({ label, detail });
  console.log(`WARN ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label, detail) {
  checks.push({ label, status: "fail", detail });
  console.log(`FAIL ${label}${detail ? ` — ${detail}` : ""}`);
}

const requiredForPipeline = [
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "SANITY_API_WRITE_TOKEN",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_ENDPOINT",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_BASE_URL",
];

for (const name of requiredForPipeline) {
  if (process.env[name]) ok(`Variable ${name}`);
  else fail(`Variable ${name}`, "manquante");
}

for (const name of ["REVALIDATE_SECRET", "SITE_URL"]) {
  if (process.env[name]) ok(`Variable ${name}`);
  else warn(`Variable ${name}`, "optionnelle en local, requise en production");
}

try {
  const r2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    },
  });
  await r2.send(
    new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: "media/.keep",
    }),
  ).catch(async (error) => {
    const status = error?.$metadata?.httpStatusCode ?? error?.statusCode;
    if (status === 404 || error?.name === "NotFound") {
      await r2.send(
        new HeadObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: "media/4c51460baeb5355f0ea09fc7dbcd157f61a7f7af.mp4",
        }),
      );
      return;
    }
    throw error;
  });
  ok("Connexion Cloudflare R2");
} catch (error) {
  fail(
    "Connexion Cloudflare R2",
    error instanceof Error ? error.message : "erreur inconnue",
  );
}

try {
  await runCommand(process.env.FFMPEG_PATH ?? "ffmpeg", ["-version"]);
  ok("FFmpeg disponible");
} catch (error) {
  fail(
    "FFmpeg disponible",
    error instanceof Error ? error.message : "ffmpeg introuvable",
  );
}

const failed = checks.filter((check) => check.status === "fail");
console.log("");
console.log(
  failed.length
    ? `Configuration incomplète (${failed.length} blocage${failed.length > 1 ? "s" : ""}).`
    : "Configuration locale prête pour le pipeline automatique.",
);
console.log("");
console.log("Étapes externes restantes :");
console.log("1. GitHub → Settings → Secrets → ajouter SANITY_API_WRITE_TOKEN, R2_*, REVALIDATE_SECRET");
console.log("2. Vercel → Environment Variables → ajouter REVALIDATE_SECRET");
console.log("3. Sanity → API → Webhooks → créer le webhook décrit dans docs/automatic-media-pipeline.md");
console.log("4. Tester : publier un projet avec une vidéo, puis vérifier le workflow GitHub Actions");

process.exit(failed.length ? 1 : 0);

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }
      reject(
        new Error(`${basename(command)} exited with ${code}: ${stderr.trim()}`),
      );
    });
  });
}
