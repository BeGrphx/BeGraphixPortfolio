type VideoField = {
  videoFileRef?: string | null;
  videoUrl?: string | null;
};

export type MediaOptimizationStatus = "none" | "pending" | "optimized";

export function getAssetHashFromRef(assetRef?: string | null) {
  if (!assetRef) return null;
  const match = /^file-([a-f0-9]+)-[^-]+$/i.exec(assetRef);
  return match?.[1] ?? null;
}

export function isVideoDeliveryReady(
  assetRef?: string | null,
  videoUrl?: string | null,
) {
  if (!assetRef) return true;
  if (!videoUrl) return false;

  const hash = getAssetHashFromRef(assetRef);
  if (!hash) return false;

  return videoUrl.includes(hash);
}

export function collectDocumentVideoFields(document: {
  _type?: string;
  showreelVideoFile?: { asset?: { _ref?: string } };
  showreelVideoUrl?: string | null;
  gallery?: Array<{
    videoFile?: { asset?: { _ref?: string } };
    videoUrl?: string | null;
  }>;
  videoGallery?: Array<{
    videoFile?: { asset?: { _ref?: string } };
    videoUrl?: string | null;
  }>;
  media?: Array<{
    videoFile?: { asset?: { _ref?: string } };
    url?: string | null;
  }>;
}): VideoField[] {
  const fields: VideoField[] = [];

  if (document._type === "siteSettings" || document._type === "project") {
    fields.push({
      videoFileRef: document.showreelVideoFile?.asset?._ref,
      videoUrl: document.showreelVideoUrl,
    });
  }

  if (document._type === "project") {
    for (const item of document.gallery ?? []) {
      fields.push({
        videoFileRef: item?.videoFile?.asset?._ref,
        videoUrl: item?.videoUrl,
      });
    }

    for (const item of document.videoGallery ?? []) {
      fields.push({
        videoFileRef: item?.videoFile?.asset?._ref,
        videoUrl: item?.videoUrl,
      });
    }

    for (const item of document.media ?? []) {
      fields.push({
        videoFileRef: item?.videoFile?.asset?._ref,
        videoUrl: item?.url,
      });
    }
  }

  return fields.filter((field) => Boolean(field.videoFileRef));
}

export function getMediaOptimizationStatus(document: {
  _type?: string;
  showreelVideoFile?: { asset?: { _ref?: string } };
  showreelVideoUrl?: string | null;
  gallery?: Array<{
    videoFile?: { asset?: { _ref?: string } };
    videoUrl?: string | null;
  }>;
  videoGallery?: Array<{
    videoFile?: { asset?: { _ref?: string } };
    videoUrl?: string | null;
  }>;
  media?: Array<{
    videoFile?: { asset?: { _ref?: string } };
    url?: string | null;
  }>;
}): MediaOptimizationStatus {
  const videoFields = collectDocumentVideoFields(document);
  if (!videoFields.length) return "none";

  const pendingCount = videoFields.filter(
    (field) => !isVideoDeliveryReady(field.videoFileRef, field.videoUrl),
  ).length;

  return pendingCount === 0 ? "optimized" : "pending";
}
