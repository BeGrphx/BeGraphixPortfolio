import { ImageLightbox, type LightboxImage } from "./ImageLightbox";
import { urlFor } from "@/lib/sanity/image";
import type { SanityGalleryImage } from "@/lib/sanity/queries";

interface PhotoGalleryProps {
  images: SanityGalleryImage[];
}

export function PhotoGallery({ images }: PhotoGalleryProps) {
  if (!images.length) return null;

  const lightboxImages: LightboxImage[] = images.map((image) => ({
    src: urlFor(image).width(1920).fit("max").url(),
    alt: image.alt ?? "",
    caption: image.caption,
  }));

  return <ImageLightbox images={lightboxImages} />;
}
