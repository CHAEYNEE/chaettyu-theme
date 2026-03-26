import Link from "next/link";

import styles from "./MyPageEmptyState.module.css";

export default function MyPageEmptyState() {
  return (
    <section className={styles.card}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>아직 저장된 테마 기록이 없어요</p>
        <h2 className={styles.title}>첫 테마를 만나러 가볼까요?</h2>
        <p className={styles.description}>
          무료 테마를 다운로드하거나 Signature 테마를 구매하면
          <br />
          여기에서 내 기록을 모아볼 수 있어요.
        </p>

        <div className={styles.actions}>
          <Link href="/themes/free" className={styles.secondaryButton}>
            무료 테마 보러가기
          </Link>
          <Link href="/themes/signature" className={styles.primaryButton}>
            Signature 보러가기
          </Link>
        </div>
      </div>
    </section>
  );
}
