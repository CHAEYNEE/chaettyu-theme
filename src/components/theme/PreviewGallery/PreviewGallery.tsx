"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import styles from "./PreviewGallery.module.css";

type PreviewGalleryProps = {
  title: string;
  thumbnail: string;
  previewImages: string[];
};

type GalleryImage = {
  src: string;
  alt: string;
  isMain?: boolean;
};

export default function PreviewGallery({
  title,
  thumbnail,
  previewImages,
}: PreviewGalleryProps) {
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const images = useMemo<GalleryImage[]>(() => {
    const previewItems = previewImages.map((image, index) => ({
      src: image,
      alt: `${title} 미리보기 ${index + 1}`,
    }));

    if (!thumbnail) {
      return previewItems;
    }

    return [
      {
        src: thumbnail,
        alt: `${title} 대표 이미지`,
        isMain: true,
      },
      ...previewItems,
    ];
  }, [thumbnail, previewImages, title]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedImage = images[selectedIndex] ?? images[0];

  const scrollByAmount = (direction: "prev" | "next") => {
    if (!sliderRef.current) return;

    const amount = sliderRef.current.clientWidth * 0.8;

    sliderRef.current.scrollBy({
      left: direction === "prev" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (!selectedImage) {
    return null;
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.mainPreview}>
        <Image
          src={selectedImage.src}
          alt={selectedImage.alt}
          fill
          className={styles.previewImage}
          sizes="(max-width: 900px) 100vw, 520px"
          priority
          unoptimized
        />
      </div>

      <div className={styles.thumbSection}>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => scrollByAmount("prev")}
          aria-label="미리보기 이전으로 이동"
        >
          <ChevronLeft size={30} strokeWidth={2.25} />
        </button>

        <div className={styles.thumbSlider} ref={sliderRef}>
          {images.map((image, index) => {
            const isActive = index === selectedIndex;

            return (
              <button
                key={`${image.src}-${index}`}
                type="button"
                className={`${styles.thumbButton} ${
                  isActive ? styles.activeThumb : ""
                }`}
                onClick={() => setSelectedIndex(index)}
                aria-label={image.alt}
                aria-pressed={isActive}
              >
                <div className={styles.thumbImageWrap}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className={styles.previewImage}
                    sizes="140px"
                    unoptimized
                  />
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={styles.navButton}
          onClick={() => scrollByAmount("next")}
          aria-label="미리보기 다음으로 이동"
        >
          <ChevronRight size={30} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
