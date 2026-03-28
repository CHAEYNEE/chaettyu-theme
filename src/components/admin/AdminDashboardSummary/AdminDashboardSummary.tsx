import styles from "./AdminDashboardSummary.module.css";

type SummaryItem = {
  label: string;
  value: string;
  tone?: "soft" | "cream" | "accent";
};

type AdminDashboardSummaryProps = {
  items: SummaryItem[];
};

export default function AdminDashboardSummary({
  items,
}: AdminDashboardSummaryProps) {
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <article
          key={item.label}
          className={`${styles.card} ${
            item.tone === "accent"
              ? styles.accent
              : item.tone === "cream"
                ? styles.cream
                : styles.soft
          }`}
        >
          <span className={styles.label}>{item.label}</span>
          <strong className={styles.value}>{item.value}</strong>
        </article>
      ))}
    </div>
  );
}
