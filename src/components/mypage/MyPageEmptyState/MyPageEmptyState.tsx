import Link from "next/link";

import styles from "./MyPageEmptyState.module.css";

export default function MyPageEmptyState() {
  return (
    <section className={styles.card}>
      <div className={styles.icon}>♡</div>
      <p className={styles.eyebrow}>MY THEME DRAWER</p>
      <h2 className={styles.title}>
        구매 / 다운로드한 테마가 <br />
        아직 없어요 🫥
      </h2>
      <p className={styles.description}>
        마음에 드는 테마를 구매 / 다운로드 해보세요 🤎
      </p>

      <div className={styles.actions}>
        <Link href="/themes/free" className={styles.secondaryButton}>
          무료 테마 보러가기
        </Link>
        <Link href="/themes/signature" className={styles.primaryButton}>
          유료 테마 보러가기
        </Link>
      </div>
    </section>
  );
}
