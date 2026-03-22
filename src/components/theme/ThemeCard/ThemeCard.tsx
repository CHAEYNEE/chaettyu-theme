import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import type { ThemeItem } from "@/types/theme";

import styles from "./ThemeCard.module.css";

type ThemeCardProps = {
  theme: ThemeItem;
};

export default function ThemeCard({ theme }: ThemeCardProps) {
  const detailHref = `${ROUTES.HOME}themes/${theme.id}`;
  const hasThumbnail = Boolean(theme.thumbnail);
  const isFree = theme.type === "free";

  return (
    <Link href={detailHref} className={styles.cardLink}>
      <article className={styles.card}>
        <div className={styles.thumbnail}>
          {hasThumbnail ? (
            <Image
              src={theme.thumbnail}
              alt={theme.title}
              fill
              className={styles.thumbnailImage}
              sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 25vw"
              unoptimized
            />
          ) : (
            <div className={styles.thumbnailFallback}>
              <span className={styles.thumbnailText}>{theme.title}</span>
            </div>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.chipRow}>
            <span
              className={`${styles.chip} ${
                isFree ? styles.freeChip : styles.signatureChip
              }`}
            >
              {isFree ? "FREE" : "SIGNATURE"}
            </span>

            <span className={`${styles.chip} ${styles.categoryChip}`}>
              {theme.category}
            </span>

            {!isFree && theme.badge && (
              <span className={`${styles.chip} ${styles.badgeChip}`}>
                {theme.badge}
              </span>
            )}
          </div>

          <strong className={styles.title}>{theme.title}</strong>

          {isFree ? (
            <span className={styles.metaText}>
              다운로드 {theme.downloads ?? 0}
            </span>
          ) : (
            <span className={styles.price}>
              <span className={styles.currency}>₩</span>
              {theme.price.toLocaleString()}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
