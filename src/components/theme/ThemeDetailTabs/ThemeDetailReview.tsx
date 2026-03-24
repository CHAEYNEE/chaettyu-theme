"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";

import type { ThemeReview } from "@/types/theme";

import styles from "./ThemeDetailReview.module.css";

type ThemeDetailReviewProps = {
  reviews: ThemeReview[];
};

export default function ThemeDetailReview({ reviews }: ThemeDetailReviewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleOpenImage = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  if (reviews.length === 0) {
    return <div className={styles.emptyState}>아직 등록된 리뷰가 없어요.</div>;
  }

  return (
    <>
      <ul className={styles.list}>
        {reviews.map((review) => (
          <li key={review.id} className={styles.card}>
            <div className={styles.cardTop}>
              <strong className={styles.author}>{review.author}</strong>
              <span className={styles.date}>{review.createdAt}</span>
            </div>

            <div className={styles.ratingRow}>
              <span className={styles.rating}>
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </span>
            </div>

            <p className={styles.bodyText}>{review.content}</p>

            {review.images && review.images.length > 0 && (
              <div className={styles.reviewImageGrid}>
                {review.images.map((imageSrc, index) => (
                  <button
                    key={`${review.id}-${imageSrc}-${index}`}
                    type="button"
                    className={styles.reviewImageButton}
                    onClick={() => handleOpenImage(imageSrc)}
                    aria-label={`${review.author} 리뷰 이미지 ${index + 1} 크게 보기`}
                  >
                    <div className={styles.reviewImageItem}>
                      <Image
                        src={imageSrc}
                        alt={`${review.author} 리뷰 이미지 ${index + 1}`}
                        fill
                        className={styles.reviewImage}
                        sizes="(max-width: 640px) 33vw, 120px"
                        unoptimized
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      {selectedImage &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={styles.lightboxOverlay}
            onClick={handleCloseImage}
            role="dialog"
            aria-modal="true"
            aria-label="리뷰 이미지 크게 보기"
          >
            <div
              className={styles.lightboxContent}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className={styles.lightboxClose}
                onClick={handleCloseImage}
                aria-label="리뷰 이미지 닫기"
              >
                <X size={18} />
              </button>

              <div className={styles.lightboxImageWrap}>
                <Image
                  src={selectedImage}
                  alt="선택된 리뷰 이미지"
                  fill
                  className={styles.lightboxImage}
                  sizes="90vw"
                  unoptimized
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
