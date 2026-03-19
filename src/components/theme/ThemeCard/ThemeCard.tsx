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

  return (
    <article className={styles.card}>
      <div className={styles.thumbnail}>
        <span className={styles.thumbnailText}>{theme.title}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.topRow}>
          <strong className={styles.title}>{theme.title}</strong>
          <span className={styles.badge}>
            {theme.type === "free" ? "FREE" : "SIGNATURE"}
          </span>
        </div>
      </div>

      <p className={styles.description}>{theme.description}</p>

      <div className={styles.metaRow}>
        <span className={styles.price}>{formatPrice(theme.price)}</span>
        <span className={styles.likes}>♥ {theme.likes}</span>
      </div>

      <Link href={detailHref} className={styles.linkButton}>
        자세히 보기
      </Link>
    </article>
  );
}
