"use client";

import { useMemo, useState } from "react";

import ThemeCard from "@/components/theme/ThemeCard/ThemeCard";
import type { ThemeItem } from "@/types/theme";

import styles from "./ThemeListSection.module.css";

type ThemeListSectionProps = {
  title: string;
  description: string;
  type: "free" | "signature";
  items: ThemeItem[];
};

type SortOption = "latest" | "popular";

function getLatestTimestamp(item: ThemeItem) {
  return new Date(item.createdAt).getTime();
}

function getPopularityScore(item: ThemeItem) {
  if (item.type === "free") {
    return item.downloadCount ?? 0;
  }

  return item.purchaseCount ?? 0;
}

export default function ThemeListSection({
  title,
  description,
  type,
  items,
}: ThemeListSectionProps) {
  const [sortOption, setSortOption] = useState<SortOption>("latest");

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortOption === "latest") {
        return getLatestTimestamp(b) - getLatestTimestamp(a);
      }

      return getPopularityScore(b) - getPopularityScore(a);
    });
  }, [items, sortOption]);

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          <p className={styles.eyebrow}>
            {type === "free" ? "Free Theme" : "Signature Theme"}
          </p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </div>

        <div className={styles.filterGroup} aria-label="테마 정렬">
          <button
            type="button"
            className={`${styles.filterButton} ${
              sortOption === "latest" ? styles.activeFilter : ""
            }`}
            onClick={() => setSortOption("latest")}
            aria-pressed={sortOption === "latest"}
          >
            최신순
          </button>

          <button
            type="button"
            className={`${styles.filterButton} ${
              sortOption === "popular" ? styles.activeFilter : ""
            }`}
            onClick={() => setSortOption("popular")}
            aria-pressed={sortOption === "popular"}
          >
            인기순
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        {sortedItems.map((item, index) => (
          <ThemeCard key={item.id} theme={item} eager={index === 0} />
        ))}
      </div>
    </section>
  );
}
