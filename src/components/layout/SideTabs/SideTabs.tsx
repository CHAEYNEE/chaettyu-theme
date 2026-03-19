import Link from "next/link";

import { ROUTES } from "@/constants/routes";

import styles from "./SideTabs.module.css";

const tabs = [
  { label: "무료", href: ROUTES.THEMES_FREE },
  { label: "시그니처", href: ROUTES.THEMES_SIGNATURE },
  { label: "마이", href: ROUTES.MYPAGE },
  { label: "관리자", href: ROUTES.ADMIN },
];

export default function SideTabs() {
  return (
    <nav className={styles.tabs} aria-label="홈 사이드 탭">
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href} className={styles.tab}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
