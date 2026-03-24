import ThemeCard from "@/components/theme/ThemeCard/ThemeCard";
import type { ThemeItem } from "@/types/theme";

import styles from "./ThemeListSection.module.css";

type ThemeListSectionProps = {
  title: string;
  description: string;
  type: "free" | "signature";
  items: ThemeItem[];
};

export default function ThemeListSection({
  title,
  description,
  type,
  items,
}: ThemeListSectionProps) {
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

        <div className={styles.filterGroup} aria-label="테마 필터">
          <button
            type="button"
            className={`${styles.filterButton} ${styles.activeFilter}`}
          >
            전체
          </button>
          <button type="button" className={styles.filterButton}>
            최신순
          </button>
          <button type="button" className={styles.filterButton}>
            인기순
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        {items.map((item, index) => (
          <ThemeCard key={item.id} theme={item} eager={index === 0} />
        ))}
      </div>
    </section>
  );
}
