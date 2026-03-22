"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./SideTabs.module.css";
import { tabs } from "./tabs";

export default function SideTabs() {
  const pathname = usePathname();

  return (
    <nav className={styles.wrapper} aria-label="홈 사이드 탭">
      <ul className={styles.list}>
        {tabs.map((tab) => {
          const isActive = tab.match(pathname);

          return (
            <li
              key={tab.href}
              className={`${styles.item} ${isActive ? styles.activeItem : ""}`}
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
