import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import type { ThemeItem, ThemePlatform } from "@/types/theme";

import styles from "./ThemeCard.module.css";

type ThemeCardProps = {
  theme: ThemeItem;
  eager?: boolean;
};

const platformLabelMap: Record<ThemePlatform, string> = {
  ios: "iOS",
  android: "AND",
};

export default function ThemeCard({ theme, eager = false }: ThemeCardProps) {
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
              loading={eager ? "eager" : "lazy"}
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

            {theme.platforms.map((platform) => (
              <span
                key={platform}
                className={`${styles.chip} ${
                  platform === "ios" ? styles.iosChip : styles.androidChip
                }`}
              >
                {platformLabelMap[platform]}
              </span>
            ))}

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
              <span className={styles.priceValue}>
                {theme.price.toLocaleString()}
              </span>
              <span className={styles.priceUnit}>원</span>
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
