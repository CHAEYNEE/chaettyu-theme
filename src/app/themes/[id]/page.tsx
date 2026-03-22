import { notFound } from "next/navigation";

import PreviewGallery from "@/components/theme/PreviewGallery/PreviewGallery";
import BoardLayout from "@/components/layout/BoardLayout/BoardLayout";
import { themes } from "@/data/themes";
import type { ThemePlatform } from "@/types/theme";

import styles from "./page.module.css";

type ThemeDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const platformLabelMap: Record<ThemePlatform, string> = {
  ios: "iOS",
  android: "AND",
};

export function generateStaticParams() {
  return themes.map((theme) => ({
    id: theme.id,
  }));
}

export default async function ThemeDetailPage({
  params,
}: ThemeDetailPageProps) {
  const { id } = await params;
  const theme = themes.find((item) => item.id === id);

  if (!theme) {
    notFound();
  }

  const isFree = theme.type === "free";

  return (
    <BoardLayout pillText={isFree ? "Free Theme" : "Signature Theme"}>
      <section className={styles.section}>
        <div className={styles.top}>
          <div className={styles.previewArea}>
            <PreviewGallery
              title={theme.title}
              thumbnail={theme.thumbnail}
              previewImages={theme.previewImages}
            />
          </div>

          <div className={styles.infoArea}>
            <div className={styles.metaTop}>
              <span
                className={`${styles.chip} ${
                  isFree ? styles.freeChip : styles.signatureChip
                }`}
              >
                {isFree ? "FREE" : "SIGNATURE"}
              </span>

              {theme.platforms.map((platform) => (
                <span
                  key={platform}
                  className={`${styles.chip} ${
                    platform === "ios" ? styles.iosChip : styles.androidChip
                  }`}
                >
                  {platformLabelMap[platform]}
                </span>
              ))}

              {!isFree && theme.badge && (
                <span className={`${styles.chip} ${styles.badgeChip}`}>
                  {theme.badge}
                </span>
              )}
            </div>

            <h1 className={styles.title}>{theme.title}</h1>

            <div className={styles.priceBox}>
              {isFree ? (
                <strong className={styles.freeText}>무료 다운로드</strong>
              ) : (
                <strong className={styles.price}>
                  <span className={styles.currency}>₩</span>
                  {theme.price.toLocaleString()}
                </strong>
              )}
            </div>

            <p className={styles.description}>{theme.description}</p>

            <dl className={styles.metaList}>
              <div className={styles.metaItem}>
                <dt>지원 기종</dt>
                <dd>
                  {theme.platforms
                    .map((platform) => platformLabelMap[platform])
                    .join(" · ")}
                </dd>
              </div>

              <div className={styles.metaItem}>
                <dt>이용 방식</dt>
                <dd>{isFree ? "무료 다운로드" : "구매 후 다운로드"}</dd>
              </div>

              {typeof theme.downloads === "number" && (
                <div className={styles.metaItem}>
                  <dt>다운로드</dt>
                  <dd>{theme.downloads.toLocaleString()}</dd>
                </div>
              )}
            </dl>

            <div className={styles.tagList}>
              {theme.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>

            <div className={styles.buttonRow}>
              <button type="button" className={styles.primaryButton}>
                {isFree ? "무료 다운로드" : "구매하기"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </BoardLayout>
  );
}
