"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { ThemeReview } from "@/types/theme";

import styles from "./ThemeDetailReview.module.css";

type ThemeDetailReviewProps = {
  reviews: ThemeReview[];
};

const LOAD_COUNT = 5;

export default function ThemeDetailReview({ reviews }: ThemeDetailReviewProps) {
  const [selectedImages, setSelectedImages] = useState<string[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(LOAD_COUNT);

  const handleOpenImage = (images: string[], index: number) => {
    setSelectedImages(images);
    setSelectedIndex(index);
  };

  const handleCloseImage = () => {
    setSelectedImages(null);
    setSelectedIndex(0);
  };

  const handlePrevImage = () => {
    if (!selectedImages || selectedImages.length === 0) return;

    setSelectedIndex((prev) =>
      prev === 0 ? selectedImages.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    if (!selectedImages || selectedImages.length === 0) return;

    setSelectedIndex((prev) =>
      prev === selectedImages.length - 1 ? 0 : prev + 1,
    );
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_COUNT);
  };

  if (reviews.length === 0) {
    return <div className={styles.emptyState}>아직 등록된 리뷰가 없어요.</div>;
  }

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMoreReviews = visibleCount < reviews.length;

  return (
    <>
      <div className={styles.reviewWrap}>
        <ul className={styles.list}>
          {visibleReviews.map((review) => (
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
                      onClick={() =>
                        handleOpenImage(review.images ?? [], index)
                      }
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

        {hasMoreReviews && (
          <div className={styles.moreButtonRow}>
            <button
              type="button"
              className={styles.moreButton}
              onClick={handleLoadMore}
            >
              더보기
            </button>
          </div>
        )}
      </div>

      {selectedImages &&
        selectedImages.length > 0 &&
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

              {selectedImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className={`${styles.navButton} ${styles.prevButton}`}
                    onClick={handlePrevImage}
                    aria-label="이전 이미지"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    className={`${styles.navButton} ${styles.nextButton}`}
                    onClick={handleNextImage}
                    aria-label="다음 이미지"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              <div className={styles.lightboxImageWrap}>
                <Image
                  src={selectedImages[selectedIndex]}
                  alt={`리뷰 이미지 ${selectedIndex + 1}`}
                  fill
                  className={styles.lightboxImage}
                  sizes="90vw"
                  unoptimized
                />
              </div>

              {selectedImages.length > 1 && (
                <div className={styles.imageCounter}>
                  {selectedIndex + 1} / {selectedImages.length}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
