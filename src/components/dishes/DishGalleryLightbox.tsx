"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { DishImage } from "@/components/dishes/DishImage";

type DishGalleryLightboxProps = {
  dishName: string;
  images: Array<{ image: string }>;
};

export function DishGalleryLightbox({
  dishName,
  images,
}: DishGalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const slides = images.map((item, index) => ({
    src: item.image,
    alt: `${dishName} - ảnh ${index + 1}`,
  }));

  return (
    <>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {slides.map((slide, index) => (
          <button
            key={`${slide.src}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative block overflow-hidden rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            aria-label={`Xem ảnh ${index + 1} của ${dishName}`}
          >
            <DishImage
              src={slide.src}
              alt={slide.alt}
              className="rounded-lg transition duration-200 group-hover:scale-[1.02]"
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/65 via-stone-950/10 to-transparent px-3 py-3 text-sm font-semibold text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              Xem ảnh lớn
            </span>
          </button>
        ))}
      </div>

      <Lightbox
        open={activeIndex >= 0}
        close={() => setActiveIndex(-1)}
        index={activeIndex >= 0 ? activeIndex : 0}
        slides={slides}
      />
    </>
  );
}
