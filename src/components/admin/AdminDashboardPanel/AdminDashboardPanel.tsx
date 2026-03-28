import type { ReactNode } from "react";

import styles from "./AdminDashboardPanel.module.css";

type AdminDashboardPanelProps = {
  title: string;
  children: ReactNode;
};

export default function AdminDashboardPanel({
  title,
  children,
}: AdminDashboardPanelProps) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
