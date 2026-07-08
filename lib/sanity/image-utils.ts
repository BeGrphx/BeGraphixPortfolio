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

export function buildImageSrc(
  image: SanityGalleryImage,
  maxWidth = 1920,
): string {
  return urlFor(image).width(maxWidth).fit("max").auto("format").url();
}

export function buildFullImageSrc(image: SanityGalleryImage): string {
  return urlFor(image).width(3840).fit("max").auto("format").quality(90).url();
}

export function aspectRatioStyle(
  image?: Pick<SanityGalleryImage, "width" | "height">,
): CSSProperties {
  const { width, height } = getImageDimensions(image);
  return { aspectRatio: `${width} / ${height}` };
}
