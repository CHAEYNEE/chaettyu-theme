"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./SideTabs.module.css";

type TabItem = {
  label: string;
  fullLabel: string;
  href: string;
  match: (pathname: string) => boolean;
};

const tabs: TabItem[] = [
  {
    label: "홈",
    fullLabel: "홈",
    href: "/",
    match: (pathname) => pathname === "/",
  },
  {
    label: "무료테마",
    fullLabel: "무료 테마",
    href: "/themes/free",
    match: (pathname) => pathname.startsWith("/themes/free"),
  },
  {
    label: "유료테마",
    fullLabel: "시그니처 테마",
    href: "/themes/signature",
    match: (pathname) => pathname.startsWith("/themes/signature"),
  },
  {
    label: "마이페이지",
    fullLabel: "마이페이지",
    href: "/mypage",
    match: (pathname) => pathname.startsWith("/mypage"),
  },
];

export default function SideTabs() {
  const pathname = usePathname();

  return (
    <nav className={styles.wrapper} aria-label="홈 사이드 탭">
      <ul className={styles.list}>
        {tabs.map((tab, index) => {
          const isActive = tab.match(pathname);

          return (
            <li
              key={tab.href}
              className={`${styles.item} ${isActive ? styles.activeItem : ""}`}
              style={{ "--tab-index": index } as CSSProperties}
            >
              <Link
                href={tab.href}
                className={`${styles.tab} ${isActive ? styles.active : ""}`}
                aria-current={isActive ? "page" : undefined}
                aria-label={tab.fullLabel}
              >
                <span className={styles.tabText}>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
