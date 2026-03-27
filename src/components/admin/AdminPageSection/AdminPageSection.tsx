import type { ReactNode } from "react";

import styles from "./AdminPageSection.module.css";

type AdminPageSectionProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function AdminPageSection({
  title,
  description,
  eyebrow = "ADMIN MENU",
  actions,
  children,
}: AdminPageSectionProps) {
  return (
    <section className={styles.container}>
      <div className={styles.shell}>
        <header className={styles.head}>
          <div className={styles.headingGroup}>
            <span className={styles.eyebrow}>{eyebrow}</span>
            <h1 className={styles.title}>{title}</h1>
            {description ? (
              <p className={styles.description}>{description}</p>
            ) : null}
          </div>

          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </header>

        <div className={styles.body}>{children}</div>
      </div>
    </section>
  );
}
