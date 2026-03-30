import Link from "next/link";

import AdminDeleteThemeButton from "@/components/admin/AdminDeleteThemeButton/AdminDeleteThemeButton";
import AdminPublishToggleButton from "@/components/admin/AdminPublishToggleButton/AdminPublishToggleButton";

import styles from "./AdminThemeList.module.css";

export type AdminThemeRow = {
  id: string;
  title: string;
  type: "free" | "signature";
  purchaseMode: "single" | "set";
  status: "published" | "draft";
  thumbnail?: string;
};

type AdminThemeListProps = {
  items: AdminThemeRow[];
};

function getTypeLabel(type: AdminThemeRow["type"]) {
  return type === "free" ? "무료" : "유료";
}

function getPurchaseModeLabel(mode: AdminThemeRow["purchaseMode"]) {
  return mode === "single" ? "개별" : "세트";
}

function getStatusLabel(status: AdminThemeRow["status"]) {
  return status === "published" ? "공개" : "비공개";
}

export default function AdminThemeList({ items }: AdminThemeListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className={styles.list}>
      {items.map((theme) => (
        <li key={theme.id} className={styles.card}>
          <div className={styles.cardInner}>
            <div className={styles.thumbnailWrap}>
              {theme.thumbnail ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={theme.thumbnail}
                    alt={`${theme.title} 썸네일`}
                    className={styles.thumbnail}
                  />
                </>
              ) : (
                <div className={styles.thumbnailFallback}>NO IMAGE</div>
              )}
            </div>

            <div className={styles.content}>
              <div className={styles.topRow}>
                <div className={styles.titleWrap}>
                  <strong className={styles.title}>{theme.title}</strong>
                  <span
                    className={`${styles.statusBadge} ${
                      theme.status === "published"
                        ? styles.statusPublished
                        : styles.statusDraft
                    }`}
                  >
                    {getStatusLabel(theme.status)}
                  </span>
                </div>

                <div className={styles.actionGroup}>
                  <Link
                    href={`/admin/themes/${theme.id}/edit`}
                    className={styles.editButton}
                  >
                    수정
                  </Link>

                  <AdminPublishToggleButton
                    themeId={theme.id}
                    status={theme.status}
                  />

                  <AdminDeleteThemeButton
                    themeId={theme.id}
                    themeTitle={theme.title}
                  />
                </div>
              </div>

              <div className={styles.metaRow}>
                <span className={styles.metaChip}>
                  {getTypeLabel(theme.type)}
                </span>
                <span className={styles.metaChip}>
                  {getPurchaseModeLabel(theme.purchaseMode)}
                </span>
                <span className={styles.metaChip}>ID · {theme.id}</span>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
