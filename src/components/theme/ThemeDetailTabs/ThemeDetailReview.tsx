import Image from "next/image";

import type { ThemeReview } from "@/types/theme";

import styles from "./ThemeDetailReview.module.css";

type ThemeDetailReviewProps = {
  reviews: ThemeReview[];
};

export default function ThemeDetailReview({ reviews }: ThemeDetailReviewProps) {
  if (reviews.length === 0) {
    return <div className={styles.emptyState}>아직 등록된 리뷰가 없어요.</div>;
  }

  return (
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
                <div
                  key={`${review.id}-${imageSrc}-${index}`}
                  className={styles.reviewImageItem}
                >
                  <Image
                    src={imageSrc}
                    alt={`${review.author} 리뷰 이미지 ${index + 1}`}
                    fill
                    className={styles.reviewImage}
                    sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 240px"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
