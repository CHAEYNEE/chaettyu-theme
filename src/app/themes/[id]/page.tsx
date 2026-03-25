import { notFound } from "next/navigation";

import BoardLayout from "@/components/layout/BoardLayout/BoardLayout";
import PreviewGallery from "@/components/theme/PreviewGallery/PreviewGallery";
import ThemeDetailTabs from "@/components/theme/ThemeDetailTabs/ThemeDetailTabs";
import ThemePurchaseBox from "@/components/theme/ThemePurchaseBox/ThemePurchaseBox";
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
  const unitPrice = theme.price;
  const versionCount = theme.versions?.length ?? 0;
  const setBonusCount = theme.setBonusCount ?? 0;
  const setPrice = theme.setPrice;

  const hasSetPrice = !isFree && typeof setPrice === "number";

  const originalSetPrice =
    !isFree && hasSetPrice && versionCount > 0
      ? unitPrice * (versionCount + setBonusCount)
      : undefined;

  const discountPercent =
    hasSetPrice &&
    typeof originalSetPrice === "number" &&
    originalSetPrice > setPrice
      ? Math.round(((originalSetPrice - setPrice) / originalSetPrice) * 100)
      : 0;

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

            <dl className={styles.metaList}>
              <div className={styles.metaItem}>
                <dt>지원 기종</dt>
                <dd>
                  {theme.platforms
                    .map((platform) => platformLabelMap[platform])
                    .join(" · ")}
                </dd>
              </div>

              {!isFree && (
                <div className={styles.metaItem}>
                  <dt>개당 가격</dt>
                  <dd>
                    <span className={styles.metaPrice}>
                      <span className={styles.metaPriceValue}>
                        {unitPrice.toLocaleString()}
                      </span>
                      <span className={styles.metaPriceUnit}>원</span>
                    </span>
                  </dd>
                </div>
              )}

              {!isFree && hasSetPrice && (
                <div className={styles.metaItem}>
                  <dt>세트 가격</dt>
                  <dd>
                    <div className={styles.metaPriceWrap}>
                      <div className={styles.metaPriceRow}>
                        <span className={styles.metaPrice}>
                          <span className={styles.metaPriceValue}>
                            {setPrice.toLocaleString()}
                          </span>
                          <span className={styles.metaPriceUnit}>원</span>
                        </span>

                        {versionCount > 0 && (
                          <span className={styles.metaGiftText}>
                            {versionCount}종 구매
                            {setBonusCount > 0
                              ? ` + 증정 ${setBonusCount}종`
                              : ""}
                          </span>
                        )}
                      </div>

                      {typeof originalSetPrice === "number" &&
                        originalSetPrice > setPrice && (
                          <div className={styles.metaSubInfo}>
                            <span className={styles.metaOriginalPrice}>
                              <span className={styles.metaOriginalPriceValue}>
                                {originalSetPrice.toLocaleString()}
                              </span>
                              <span className={styles.metaOriginalPriceUnit}>
                                원
                              </span>
                            </span>

                            <span className={styles.metaDiscount}>
                              {discountPercent}% 할인
                            </span>
                          </div>
                        )}
                    </div>
                  </dd>
                </div>
              )}

              {typeof theme.downloadCount === "number" && (
                <div className={styles.metaItem}>
                  <dt>다운로드</dt>
                  <dd>{theme.downloadCount.toLocaleString()}</dd>
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

            <ThemePurchaseBox theme={theme} />
          </div>
        </div>

        <ThemeDetailTabs
          detailHtml={theme.detailHtml}
          reviews={theme.reviews}
          qnas={theme.qnas}
        />
      </section>
    </BoardLayout>
  );
}
