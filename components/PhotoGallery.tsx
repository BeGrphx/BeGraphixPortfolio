import { ImageLightbox, type LightboxImage } from "./ImageLightbox";
import {
  buildFullImageSrc,
  buildImageSrc,
} from "@/lib/sanity/image-utils";
import type { SanityGalleryImage } from "@/lib/sanity/queries";

interface PhotoGalleryProps {
  images: SanityGalleryImage[];
}

export function PhotoGallery({ images }: PhotoGalleryProps) {
  if (!images.length) return null;

  const lightboxImages: LightboxImage[] = images.map((image) => ({
    src: buildImageSrc(image, 1600),
    fullSrc: buildFullImageSrc(image),
    alt: image.alt ?? "",
    caption: image.caption,
    width: image.width,
    height: image.height,
  }));

  return <ImageLightbox images={lightboxImages} />;
}
