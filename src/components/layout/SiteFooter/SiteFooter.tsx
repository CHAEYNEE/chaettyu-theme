import Image from "next/image";

import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.avatar}>
          <Image
            src="/images/logo.png"
            alt="채뜌 로고"
            fill
            className={styles.avatarImage}
            sizes="40px"
          />
        </div>

        <p className={styles.text}>
          채뜌 테마는 개인 적용 및 감상용으로 제작됩니다. 무단 재배포, 도용, 2차
          공유는 금지됩니다.
        </p>
      </div>
    </footer>
  );
}
