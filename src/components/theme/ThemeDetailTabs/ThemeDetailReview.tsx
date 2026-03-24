import type { ThemeReview } from "@/types/theme";

import styles from "./ThemeDetailTabs.module.css";

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
        </li>
      ))}
    </ul>
  );
}
