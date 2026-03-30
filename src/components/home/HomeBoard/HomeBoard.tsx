import Link from "next/link";

import ThemeCard from "@/components/theme/ThemeCard/ThemeCard";
import { ROUTES } from "@/constants/routes";
import type { ThemeItem } from "@/types/theme";

import styles from "./HomeBoard.module.css";

type HomeBoardProps = {
  freeThemes: ThemeItem[];
  signatureThemes: ThemeItem[];
};

export default function HomeBoard({
  freeThemes,
  signatureThemes,
}: HomeBoardProps) {
  return (
    <>
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>soft theme shop</p>
          <h1 className={styles.title}>
            카카오톡을
            <br />더 말랑하고 귀엽게
          </h1>
          <p className={styles.description}>
            무료 테마는 바로 다운로드하고,
            <br />
            시그니처 테마는 구매 후 마이페이지에서 다시 받아보세요.
          </p>

          <div className={styles.actions}>
            <Link href={ROUTES.THEMES_FREE} className={styles.primaryButton}>
              무료 테마 보기
            </Link>
            <Link
              href={ROUTES.THEMES_SIGNATURE}
              className={styles.secondaryButton}
            >
              시그니처 보기
            </Link>
          </div>
        </div>

        <div className={styles.heroPreview}>
          <div className={styles.previewCard}>
            <span className={styles.previewLabel}>preview</span>
            <div className={styles.previewScreen}>채뜌.theme 메인 보드</div>
          </div>
        </div>
      </div>

      <div className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>무료 테마</h2>
          <Link href={ROUTES.THEMES_FREE} className={styles.moreLink}>
            더보기
          </Link>
        </div>

        <div className={styles.cardGrid}>
          {freeThemes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      </div>

      <div className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>시그니처 테마</h2>
          <Link href={ROUTES.THEMES_SIGNATURE} className={styles.moreLink}>
            더보기
          </Link>
        </div>

        <div className={styles.cardGrid}>
          {signatureThemes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      </div>
    </>
  );
}
