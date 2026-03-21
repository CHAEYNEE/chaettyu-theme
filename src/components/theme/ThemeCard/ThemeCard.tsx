import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { formatPrice } from "@/utils/formatPrice";
import type { ThemeItem } from "@/types/theme";

import styles from "./ThemeCard.module.css";

type ThemeCardProps = {
  theme: ThemeItem;
};

export default function ThemeCard({ theme }: ThemeCardProps) {
  const detailHref = `${ROUTES.HOME}themes/${theme.id}`;
  const hasThumbnail = Boolean(theme.thumbnail);

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
              sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className={styles.thumbnailFallback}>
              <span className={styles.thumbnailText}>{theme.title}</span>
            </div>
          )}

          <span className={styles.badge}>
            {theme.type === "free" ? "FREE" : "SIGNATURE"}
          </span>
        </div>

        <div className={styles.content}>
          <div className={styles.topRow}>
            <strong className={styles.title}>{theme.title}</strong>
            <span className={styles.likes}>♥ {theme.likes}</span>
          </div>

          <p className={styles.description}>{theme.description}</p>

          <div className={styles.metaRow}>
            <span className={styles.price}>{formatPrice(theme.price)}</span>
            <span className={styles.linkButton}>자세히 보기</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
