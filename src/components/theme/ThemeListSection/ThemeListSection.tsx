"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

const sortLabelMap: Record<SortOption, string> = {
  latest: "최신순",
  popular: "인기순",
};

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortOption === "latest") {
        return getLatestTimestamp(b) - getLatestTimestamp(a);
      }

      return getPopularityScore(b) - getPopularityScore(a);
    });
  }, [items, sortOption]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleSelectSort(option: SortOption) {
    setSortOption(option);
    setIsDropdownOpen(false);
  }

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

        <div
          className={styles.sortDropdownWrap}
          ref={dropdownRef}
          aria-label="테마 정렬"
        >
          <button
            type="button"
            className={styles.sortTrigger}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={isDropdownOpen}
          >
            <span className={styles.sortTriggerText}>
              {sortLabelMap[sortOption]}
            </span>

            <svg
              className={`${styles.chevronIcon} ${
                isDropdownOpen ? styles.chevronOpen : ""
              }`}
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className={styles.sortMenu} role="menu">
              <button
                type="button"
                className={`${styles.sortMenuItem} ${
                  sortOption === "latest" ? styles.activeMenuItem : ""
                }`}
                onClick={() => handleSelectSort("latest")}
                role="menuitem"
              >
                최신순
              </button>

              <button
                type="button"
                className={`${styles.sortMenuItem} ${
                  sortOption === "popular" ? styles.activeMenuItem : ""
                }`}
                onClick={() => handleSelectSort("popular")}
                role="menuitem"
              >
                인기순
              </button>
            </div>
          )}
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
