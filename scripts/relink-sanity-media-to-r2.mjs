import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sanityCli from "sanity/cli";

const { getCliClient } = sanityCli;

const manifestPath = join(
  tmpdir(),
  "begraphix-media-migration",
  "manifest.json",
);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const client = getCliClient({ apiVersion: "2024-01-01" });
const apply = process.env.APPLY_R2_RELINK === "1";

const byAssetId = new Map(
  manifest.assets.map((asset) => [asset.sanityId, asset.publicUrl]),
);
const bySanityUrl = new Map(
  manifest.assets.map((asset) => [asset.sanityUrl, asset.publicUrl]),
);

const documents = await client.fetch(
  '*[_type in ["project", "siteSettings"]]',
);
const changes = [];

for (const document of documents) {
  const set = {};
  const fields = [];

  if (document._type === "siteSettings") {
    const url = resolveMediaUrl(
      document.showreelVideoUrl,
      document.showreelVideoFile?.asset?._ref,
    );
    if (url && url !== document.showreelVideoUrl) {
      set.showreelVideoUrl = url;
      fields.push("showreelVideoUrl");
    }
  }

  if (document._type === "project") {
    const showreelUrl = resolveMediaUrl(
      document.showreelVideoUrl,
      document.showreelVideoFile?.asset?._ref,
    );
    if (showreelUrl && showreelUrl !== document.showreelVideoUrl) {
      set.showreelVideoUrl = showreelUrl;
      fields.push("showreelVideoUrl");
    }

    const hoverPreviewUrl = bySanityUrl.get(document.hoverPreviewUrl);
    if (hoverPreviewUrl && hoverPreviewUrl !== document.hoverPreviewUrl) {
      set.hoverPreviewUrl = hoverPreviewUrl;
      fields.push("hoverPreviewUrl");
    }

    const gallery = relinkArray(document.gallery, "videoUrl");
    if (gallery.changed) {
      set.gallery = gallery.value;
      fields.push(`gallery (${gallery.count})`);
    }

    const videoGallery = relinkArray(document.videoGallery, "videoUrl");
    if (videoGallery.changed) {
      set.videoGallery = videoGallery.value;
      fields.push(`videoGallery (${videoGallery.count})`);
    }

    const media = relinkArray(document.media, "url");
    if (media.changed) {
      set.media = media.value;
      fields.push(`media (${media.count})`);
    }
  }

  if (fields.length) {
    changes.push({
      id: document._id,
      title:
        document.title?.fr ??
        document.title ??
        document._type,
      fields,
      set,
    });
  }
}

console.log(`${apply ? "APPLY" : "DRY RUN"}: ${changes.length} documents`);
for (const change of changes) {
  console.log(`- ${change.title}: ${change.fields.join(", ")}`);
}

if (!apply) {
  console.log("DRY_RUN_COMPLETE");
  process.exit(0);
}

let transaction = client.transaction();
for (const change of changes) {
  transaction = transaction.patch(change.id, (patch) =>
    patch.set(change.set),
  );
}

const result = await transaction.commit({
  visibility: "sync",
  tag: "begraphix.r2-media-migration",
});

console.log(`Committed transaction ${result.transactionId}`);
console.log("RELINK_COMPLETE");

function resolveMediaUrl(currentUrl, assetRef) {
  return bySanityUrl.get(currentUrl) ?? byAssetId.get(assetRef);
}

function relinkArray(items, urlField) {
  if (!Array.isArray(items)) {
    return { value: items, changed: false, count: 0 };
  }

  let count = 0;
  const value = items.map((item) => {
    const url = resolveMediaUrl(
      item?.[urlField],
      item?.videoFile?.asset?._ref,
    );
    if (!url || url === item?.[urlField]) return item;

    count += 1;
    return { ...item, [urlField]: url };
  });

  return { value, changed: count > 0, count };
}
