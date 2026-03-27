import styles from "./AdminThemeList.module.css";

export type AdminThemeRow = {
  id: string;
  title: string;
  type: "free" | "signature";
  purchaseMode: "single" | "set";
  status: "published" | "draft";
};

type AdminThemeListProps = {
  items: AdminThemeRow[];
};

export default function AdminThemeList({ items }: AdminThemeListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className={styles.list}>
      {items.map((theme) => (
        <li key={theme.id} className={styles.card}>
          <div className={styles.topRow}>
            <strong className={styles.title}>{theme.title}</strong>
            <span className={styles.badge}>
              {theme.status === "published" ? "공개" : "준비 중"}
            </span>
          </div>

          <div className={styles.metaRow}>
            <span>{theme.type === "free" ? "무료" : "시그니처"}</span>
            <span>{theme.purchaseMode === "single" ? "single" : "set"}</span>
            <span>{theme.id}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
