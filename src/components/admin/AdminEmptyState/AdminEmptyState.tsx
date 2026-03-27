import styles from "./AdminEmptyState.module.css";

type AdminEmptyStateProps = {
  title: string;
  description: string;
};

export default function AdminEmptyState({
  title,
  description,
}: AdminEmptyStateProps) {
  return (
    <div className={styles.box}>
      <strong className={styles.title}>{title}</strong>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
