import Image from "next/image";
import { notFound } from "next/navigation";

import BoardLayout from "@/components/layout/BoardLayout/BoardLayout";
import { themes } from "@/data/themes";
import { formatPrice } from "@/utils/formatPrice";

import styles from "./page.module.css";

type ThemeDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
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

  const mainImage = theme.previewImages[0] ?? theme.thumbnail;

  return (
    <BoardLayout
      pillText={theme.type === "free" ? "Free Theme" : "Signature Theme"}
    >
      <section className={styles.section}>
        <div className={styles.top}>
          <div className={styles.previewArea}>
            <div className={styles.mainPreview}>
              <Image
                src={mainImage}
                alt={theme.title}
                fill
                className={styles.previewImage}
                sizes="(max-width: 900px) 100vw, 520px"
                priority
              />
            </div>

            <div className={styles.previewGrid}>
              {theme.previewImages.map((image, index) => (
                <div
                  key={`${theme.id}-${index}`}
                  className={styles.previewThumb}
                >
                  <Image
                    src={image}
                    alt={`${theme.title} 미리보기 ${index + 1}`}
                    fill
                    className={styles.previewImage}
                    sizes="(max-width: 900px) 50vw, 240px"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.infoArea}>
            <div className={styles.metaTop}>
              <span className={styles.typeBadge}>
                {theme.type === "free" ? "FREE" : "SIGNATURE"}
              </span>

              {theme.badge && (
                <span className={styles.subBadge}>{theme.badge}</span>
              )}
            </div>

            <h1 className={styles.title}>{theme.title}</h1>
            <p className={styles.description}>{theme.description}</p>

            <dl className={styles.metaList}>
              <div className={styles.metaItem}>
                <dt>카테고리</dt>
                <dd>{theme.category}</dd>
              </div>

              <div className={styles.metaItem}>
                <dt>가격</dt>
                <dd>
                  {theme.type === "free"
                    ? "무료 다운로드"
                    : formatPrice(theme.price)}
                </dd>
              </div>

              <div className={styles.metaItem}>
                <dt>좋아요</dt>
                <dd>♥ {theme.likes}</dd>
              </div>

              {typeof theme.downloads === "number" && (
                <div className={styles.metaItem}>
                  <dt>다운로드</dt>
                  <dd>{theme.downloads}</dd>
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
              {theme.type === "free" ? (
                <button type="button" className={styles.primaryButton}>
                  무료 다운로드
                </button>
              ) : (
                <button type="button" className={styles.primaryButton}>
                  구매하기
                </button>
              )}

              <button type="button" className={styles.secondaryButton}>
                ♥ 좋아요
              </button>
            </div>
          </div>
        </div>
      </section>
    </BoardLayout>
  );
}
