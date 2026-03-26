"use client";

import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogIn, LogOut, ShoppingCart, UserRound } from "lucide-react";

import ScrollToTopButton from "@/components/common/ScrollToTopButton/ScrollToTopButton";
import SideTabs from "@/components/layout/SideTabs/SideTabs";
import useMockUser from "@/hooks/useMockUser";
import { clearMockUser } from "@/lib/auth/mockAuthStorage";
import useOuterScrollbar from "./useOuterScrollbar";
import styles from "./BoardLayout.module.css";

type BoardLayoutProps = {
  children: ReactNode;
  badgeText?: string;
  profileSrc?: string;
  profileAlt?: string;
};

const KNOB_SIZE = 18;

export default function BoardLayout({
  children,
  badgeText = "채뜌",
  profileSrc = "/images/profile.jpg",
  profileAlt = "프로필",
}: BoardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useMockUser();

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

  const resolvedProfileSrc = user?.profileImage || profileSrc;
  const resolvedProfileAlt = user?.nickname
    ? `${user.nickname} 프로필`
    : profileAlt;

  const resolvedBadgeText = user?.nickname?.slice(0, 2) || badgeText;

  const queryString = searchParams?.toString();
  const currentPath = queryString ? `${pathname}?${queryString}` : pathname;

  const handleLoginClick = () => {
    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleMypageClick = () => {
    router.push("/mypage");
  };

  const handleCartClick = () => {
    router.push("/cart");
  };

  const handleLogoutClick = () => {
    clearMockUser();
    router.refresh();
  };

  return (
    <section className={styles.section}>
      <div className={styles.boardWrap}>
        <div className={styles.backPlate} aria-hidden="true" />

        <div className={styles.circleBadge}>
          {resolvedProfileSrc ? (
            <Image
              src={resolvedProfileSrc}
              alt={resolvedProfileAlt}
              fill
              className={styles.profileImage}
              sizes="(max-width: 900px) 76px, 120px"
              priority
            />
          ) : (
            <span className={styles.badgeText}>{resolvedBadgeText}</span>
          )}
        </div>

        <div className={styles.signaturePill}>
          <button
            type="button"
            className={styles.pillIconButton}
            onClick={user ? handleLogoutClick : handleLoginClick}
            aria-label={user ? "로그아웃" : "로그인"}
            title={user ? "로그아웃" : "로그인"}
          >
            {user ? (
              <LogOut className={styles.menuIconSvg} aria-hidden="true" />
            ) : (
              <LogIn className={styles.menuIconSvg} aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            className={styles.pillIconButton}
            onClick={handleMypageClick}
            aria-label="마이페이지"
            title="마이페이지"
          >
            <UserRound className={styles.menuIconSvg} aria-hidden="true" />
          </button>

          <button
            type="button"
            className={styles.pillIconButton}
            onClick={handleCartClick}
            aria-label="장바구니"
            title="장바구니"
          >
            <ShoppingCart className={styles.menuIconSvg} aria-hidden="true" />
          </button>
        </div>

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
