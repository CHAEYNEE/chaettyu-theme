"use client";

import { useMemo, useState } from "react";

import type { ThemeQna, ThemeReview } from "@/types/theme";

import styles from "./ThemeDetailTabs.module.css";

type TabKey = "detail" | "review" | "qna";

type ThemeDetailTabsProps = {
  detailHtml: string;
  reviews?: ThemeReview[];
  qnas?: ThemeQna[];
};

const TAB_LABELS: Record<TabKey, string> = {
  detail: "테마 상세정보",
  review: "리뷰",
  qna: "Q&A",
};

export default function ThemeDetailTabs({
  detailHtml,
  reviews = [],
  qnas = [],
}: ThemeDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("detail");

  const reviewCount = reviews.length;
  const qnaCount = qnas.length;

  const activeContent = useMemo(() => {
    if (activeTab === "detail") {
      return (
        <div
          className={styles.detailEditorContent}
          dangerouslySetInnerHTML={{ __html: detailHtml }}
        />
      );
    }

    if (activeTab === "review") {
      if (reviewCount === 0) {
        return (
          <div className={styles.emptyState}>아직 등록된 리뷰가 없어요.</div>
        );
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

    if (qnaCount === 0) {
      return (
        <div className={styles.emptyState}>아직 등록된 문의가 없어요.</div>
      );
    }

    return (
      <ul className={styles.list}>
        {qnas.map((item) => (
          <li key={item.id} className={styles.card}>
            <div className={styles.cardTop}>
              <strong className={styles.author}>{item.author}</strong>
              <span className={styles.date}>{item.createdAt}</span>
            </div>

            <div className={styles.qnaBlock}>
              <span className={styles.qnaLabel}>Q</span>
              <p className={styles.bodyText}>{item.question}</p>
            </div>

            {item.answer && (
              <div className={styles.answerBox}>
                <span className={styles.qnaLabel}>A</span>
                <p className={styles.bodyText}>{item.answer}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }, [activeTab, detailHtml, qnaCount, qnas, reviewCount, reviews]);

  return (
    <section className={styles.section}>
      <div className={styles.tabRow}>
        <button
          type="button"
          className={`${styles.tabButton} ${
            activeTab === "detail" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("detail")}
        >
          {TAB_LABELS.detail}
        </button>

        <button
          type="button"
          className={`${styles.tabButton} ${
            activeTab === "review" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("review")}
        >
          {TAB_LABELS.review}
          {reviewCount > 0 && (
            <span className={styles.countBadge}>{reviewCount}</span>
          )}
        </button>

        <button
          type="button"
          className={`${styles.tabButton} ${
            activeTab === "qna" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("qna")}
        >
          {TAB_LABELS.qna}
          {qnaCount > 0 && (
            <span className={styles.countBadge}>{qnaCount}</span>
          )}
        </button>
      </div>

      <div className={styles.panel}>{activeContent}</div>
    </section>
  );
}
