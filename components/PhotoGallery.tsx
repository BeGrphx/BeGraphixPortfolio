import Image from "next/image";
import { FadeIn } from "./FadeIn";
import { urlFor } from "@/lib/sanity/image";
import type { SanityGalleryImage } from "@/lib/sanity/queries";

interface PhotoGalleryProps {
  images: SanityGalleryImage[];
}

export function PhotoGallery({ images }: PhotoGalleryProps) {
  if (!images.length) return null;

  return (
    <div className="mb-16 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image, index) => {
        const imageUrl = urlFor(image).width(800).height(600).fit("crop").url();

        return (
          <FadeIn key={image.asset._ref} delay={index * 0.05}>
            <figure className="relative aspect-[4/3] overflow-hidden bg-neutral-900">
              <Image
                src={imageUrl}
                alt={image.alt ?? ""}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {image.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs text-neutral-300">
                  {image.caption}
                </figcaption>
              )}
            </figure>
          </FadeIn>
        );
      })}
    </div>
  );
}
