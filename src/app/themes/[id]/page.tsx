import { notFound } from "next/navigation";

import BoardLayout from "@/components/layout/BoardLayout/BoardLayout";
import PreviewGallery from "@/components/theme/PreviewGallery/PreviewGallery";
import ThemeDetailTabs from "@/components/theme/ThemeDetailTabs/ThemeDetailTabs";
import { getPublicThemeDetail } from "@/lib/theme/getPublicThemeDetail";
import type { ThemePlatform } from "@/types/theme";

import ThemeDetailClient from "./ThemeDetailClient";
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

export const revalidate = 0;

export default async function ThemeDetailPage({
  params,
}: ThemeDetailPageProps) {
  const { id } = await params;
  const theme = await getPublicThemeDetail(id);

  if (!theme) {
    notFound();
  }

  const isFree = theme.type === "free";
  const unitPrice = theme.price;
  const versionCount = theme.versions?.length ?? 0;
  const setBonusCount = theme.setBonusCount ?? 0;
  const setPrice = theme.setPrice;

  const hasSetPrice = !isFree && typeof setPrice === "number";

  const totalSetThemeCount = versionCount + setBonusCount;

  const originalSetPrice =
    !isFree && hasSetPrice && totalSetThemeCount > 0
      ? unitPrice * totalSetThemeCount
      : undefined;

  const discountPercent =
    hasSetPrice &&
    typeof originalSetPrice === "number" &&
    originalSetPrice > setPrice
      ? Math.round(((originalSetPrice - setPrice) / originalSetPrice) * 100)
      : 0;

  const setGiftLabel =
    versionCount > 0
      ? setBonusCount > 0
        ? `${versionCount}종+${setBonusCount}종 증정`
        : `${versionCount}종 구매`
      : null;

  return (
    <BoardLayout>
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

                        {setGiftLabel && (
                          <span className={styles.metaGiftText}>
                            {setGiftLabel}
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

              {isFree && typeof theme.downloadCount === "number" && (
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

            <ThemeDetailClient theme={theme} />
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
