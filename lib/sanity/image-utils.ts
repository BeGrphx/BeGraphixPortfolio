import type { CSSProperties } from "react";
import type { SanityGalleryImage } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

export function getImageDimensions(image?: Pick<SanityGalleryImage, "width" | "height">) {
  const width = image?.width && image.width > 0 ? image.width : 16;
  const height = image?.height && image.height > 0 ? image.height : 9;
  return { width, height };
}

export function isPortrait(
  image?: Pick<SanityGalleryImage, "width" | "height">,
): boolean {
  const { width, height } = getImageDimensions(image);
  return height > width;
}

export function isUltrawide(
  image?: Pick<SanityGalleryImage, "width" | "height">,
  threshold = 1.85,
): boolean {
  const { width, height } = getImageDimensions(image);
  return width / height >= threshold;
}

/** Portrait or ultrawide — keep native ratio instead of the 16:10 gallery tile. */
export function shouldPreserveGalleryAspect(
  image?: Pick<SanityGalleryImage, "width" | "height">,
): boolean {
  return isUltrawide(image) || isPortrait(image);
}

export function buildImageSrc(
  image: SanityGalleryImage,
  maxWidth = 1920,
): string {
  return urlFor(image).width(maxWidth).fit("max").auto("format").url();
}

export const LIGHTBOX_MAX_WIDTH = 2560;

export function buildLightboxSrc(image: SanityGalleryImage): string {
  return urlFor(image)
    .width(LIGHTBOX_MAX_WIDTH)
    .fit("max")
    .auto("format")
    .quality(85)
    .url();
}

/** @deprecated Use buildLightboxSrc */
export function buildFullImageSrc(image: SanityGalleryImage): string {
  return buildLightboxSrc(image);
}

export function aspectRatioStyle(
  image?: Pick<SanityGalleryImage, "width" | "height">,
): CSSProperties {
  const { width, height } = getImageDimensions(image);
  return { aspectRatio: `${width} / ${height}` };
}
