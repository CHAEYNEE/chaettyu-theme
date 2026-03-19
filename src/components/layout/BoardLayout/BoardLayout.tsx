import type { ReactNode } from "react";

import SideTabs from "@/components/layout/SideTabs/SideTabs";

import styles from "./BoardLayout.module.css";

type BoardLayoutProps = {
  children: ReactNode;
  badgeText?: string;
  pillText?: string;
};

export default function BoardLayout({
  children,
  badgeText = "채뜌",
  pillText = "Signature Theme",
}: BoardLayoutProps) {
  return (
    <section className={styles.section}>
      <div className={styles.boardWrap}>
        <div className={styles.circleBadge}>{badgeText}</div>
        <div className={styles.signaturePill}>{pillText}</div>

        <SideTabs />

        <div className={styles.board}>
          <div className={styles.boardScroll}>{children}</div>
        </div>
      </div>
    </section>
  );
}
