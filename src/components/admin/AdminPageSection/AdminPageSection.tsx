import type { ReactNode } from "react";

import styles from "./AdminPageSection.module.css";

type AdminPageSectionProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function AdminPageSection({
  title,
  description,
  actions,
  children,
}: AdminPageSectionProps) {
  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div className={styles.headingGroup}>
          <h1 className={styles.title}>{title}</h1>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </div>

        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </header>

      <div className={styles.content}>{children}</div>
    </section>
  );
}
