"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ROUTES } from "@/constants/routes";
import type { ThemeItem } from "@/types/theme";

import styles from "./HomeBoard.module.css";

type HomeBoardProps = {
  freeThemes: ThemeItem[];
  signatureThemes: ThemeItem[];
};

type HeroThemeCardProps = {
  theme: ThemeItem;
};

function HeroThemeCard({ theme }: HeroThemeCardProps) {
  return (
    <article className={styles.themeCard}>
      <Link
        href={`${ROUTES.HOME}themes/${theme.id}`}
        className={styles.themeThumbLink}
      >
        <div className={styles.themeThumb}>
          {theme.thumbnail ? (
            <Image
              src={theme.thumbnail}
              alt={theme.title}
              fill
              className={styles.themeThumbImage}
              sizes="(max-width: 640px) 100vw, 180px"
              unoptimized
            />
          ) : (
            <div className={styles.themeThumbFallback}>{theme.title}</div>
          )}
        </div>
      </Link>

      <div className={styles.themeMeta}>
        <strong className={styles.themeTitle}>{theme.title}</strong>

        <Link
          href={`${ROUTES.HOME}themes/${theme.id}`}
          className={styles.detailButton}
        >
          상세보기
        </Link>
      </div>
    </article>
  );
}

export default function HomeBoard({
  freeThemes,
  signatureThemes,
}: HomeBoardProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const freePreviewThemes = freeThemes.slice(0, 3);
  const signaturePreviewThemes = signatureThemes.slice(0, 3);
  const totalSlides = 2;

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isPaused, totalSlides]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  return (
    <section
      className={styles.sliderSection}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.viewportWrap}>
        <button
          type="button"
          className={`${styles.navButton} ${styles.navButtonLeft}`}
          onClick={handlePrevSlide}
          aria-label="이전 슬라이드"
        >
          ‹
        </button>

        <div className={styles.viewport}>
          <div
            className={styles.track}
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            <section className={styles.slide}>
              <div className={styles.board}>
                <span className={styles.sticker}>FREE</span>

                <div className={styles.cardGrid}>
                  {freePreviewThemes.length > 0 ? (
                    freePreviewThemes.map((theme) => (
                      <HeroThemeCard key={theme.id} theme={theme} />
                    ))
                  ) : (
                    <div className={styles.emptyBox}>
                      아직 공개된 무료 테마가 없어요.
                    </div>
                  )}
                </div>

                <div className={styles.boardFooter}>
                  <Link
                    href={ROUTES.THEMES_FREE}
                    className={styles.primaryButton}
                  >
                    무료 테마 전체보기
                  </Link>
                </div>
              </div>
            </section>

            <section className={styles.slide}>
              <div className={styles.board}>
                <span className={styles.sticker}>SIGNATURE</span>

                <div className={styles.cardGrid}>
                  {signaturePreviewThemes.length > 0 ? (
                    signaturePreviewThemes.map((theme) => (
                      <HeroThemeCard key={theme.id} theme={theme} />
                    ))
                  ) : (
                    <div className={styles.emptyBox}>
                      아직 공개된 시그니처 테마가 없어요.
                    </div>
                  )}
                </div>

                <div className={styles.boardFooter}>
                  <Link
                    href={ROUTES.THEMES_SIGNATURE}
                    className={styles.primaryButton}
                  >
                    시그니처 전체보기
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>

        <button
          type="button"
          className={`${styles.navButton} ${styles.navButtonRight}`}
          onClick={handleNextSlide}
          aria-label="다음 슬라이드"
        >
          ›
        </button>
      </div>

      <div className={styles.controls}>
        {[0, 1].map((index) => (
          <button
            key={index}
            type="button"
            className={`${styles.dot} ${
              currentSlide === index ? styles.dotActive : ""
            }`}
            aria-label={`${index + 1}번 슬라이드 보기`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}
