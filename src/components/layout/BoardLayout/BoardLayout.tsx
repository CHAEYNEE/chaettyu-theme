"use client";

import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";

import ScrollToTopButton from "@/components/common/ScrollToTopButton/ScrollToTopButton";
import SideTabs from "@/components/layout/SideTabs/SideTabs";
import useOuterScrollbar from "./useOuterScrollbar";
import styles from "./BoardLayout.module.css";

type BoardLayoutProps = {
  children: ReactNode;
  badgeText?: string;
  pillText?: string;
  profileSrc?: string;
  profileAlt?: string;
};

const KNOB_SIZE = 18;

export default function BoardLayout({
  children,
  badgeText = "채뜌",
  pillText = "Signature Theme",
  profileSrc = "/images/profile.jpg",
  profileAlt = "프로필",
}: BoardLayoutProps) {
  const {
    scrollRef,
    railRef,
    contentRef,
    knobTop,
    isDragging,
    handleRailPointerDown,
    handleKnobPointerDown,
  } = useOuterScrollbar({ knobSize: KNOB_SIZE });

  const scrollbarStyle = {
    "--knob-size": `${KNOB_SIZE}px`,
  } as CSSProperties;

  return (
    <section className={styles.section}>
      <div className={styles.boardWrap}>
        <div className={styles.backPlate} aria-hidden="true" />

        <div className={styles.circleBadge}>
          {profileSrc ? (
            <Image
              src={profileSrc}
              alt={profileAlt}
              fill
              className={styles.logoImage}
              sizes="(max-width: 900px) 76px, 120px"
              priority
            />
          ) : (
            <span className={styles.badgeText}>{badgeText}</span>
          )}
        </div>

        <div className={styles.signaturePill}>{pillText}</div>

        <SideTabs />

        <div className={styles.boardArea}>
          <div className={styles.board}>
            <div
              ref={scrollRef}
              className={styles.boardScroll}
              data-board-scroll
            >
              <div ref={contentRef} className={styles.boardContent}>
                {children}
              </div>
            </div>
          </div>

          <div className={styles.topButtonArea}>
            <ScrollToTopButton />
          </div>

          <div className={styles.outerScrollbar} style={scrollbarStyle}>
            <div
              ref={railRef}
              className={styles.outerScrollbarTrack}
              onPointerDown={handleRailPointerDown}
            >
              <div
                className={`${styles.outerScrollbarKnob} ${
                  isDragging ? styles.dragging : ""
                }`}
                style={{
                  transform: `translateY(${knobTop}px)`,
                }}
                onPointerDown={handleKnobPointerDown}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
