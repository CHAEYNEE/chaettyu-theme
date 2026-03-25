import Link from "next/link";

import BoardLayout from "@/components/layout/BoardLayout/BoardLayout";

import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <BoardLayout pillText="Page Not Found">
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.pixelBadge} aria-hidden="true">
            404
          </div>

          <p className={styles.eyebrow}>404 ERROR</p>

          <h1 className={styles.title}>앗, 없는 페이지예요</h1>

          <p className={styles.description}>Oops, Page not Found</p>

          <div className={styles.buttonRow}>
            <Link href="/" className={styles.primaryButton}>
              홈으로 가기
            </Link>

            <Link href="/themes/free" className={styles.secondaryButton}>
              무료 테마 보기
            </Link>
          </div>
        </div>
      </section>
    </BoardLayout>
  );
}
