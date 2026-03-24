"use client";

import { useState } from "react";

import type { ThemeQna, ThemeReview } from "@/types/theme";

import ThemeDetailContent from "./ThemeDetailContent";
import ThemeDetailQna from "./ThemeDetailQna";
import ThemeDetailReview from "./ThemeDetailReview";
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

      <div className={styles.panel}>
        {activeTab === "detail" && (
          <ThemeDetailContent detailHtml={detailHtml} />
        )}

        {activeTab === "review" && <ThemeDetailReview reviews={reviews} />}

        {activeTab === "qna" && <ThemeDetailQna qnas={qnas} />}
      </div>
    </section>
  );
}
