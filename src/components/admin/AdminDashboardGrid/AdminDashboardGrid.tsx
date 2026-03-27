import Link from "next/link";

import styles from "./AdminDashboardGrid.module.css";

const dashboardItems = [
  {
    href: "/admin/themes",
    label: "테마 관리",
    description: "등록된 테마와 상태를 확인해요.",
    badge: "THEME",
  },
  {
    href: "/admin/purchases",
    label: "구매 내역",
    description: "유료 구매 흐름과 기록을 살펴봐요.",
    badge: "BUY",
  },
  {
    href: "/admin/members",
    label: "회원 관리",
    description: "회원 목록과 권한 상태를 확인해요.",
    badge: "USER",
  },
  {
    href: "/admin/themes/new",
    label: "새 테마 등록",
    description: "새로운 테마 등록 작업을 시작해요.",
    badge: "NEW",
  },
];

export default function AdminDashboardGrid() {
  return (
    <div className={styles.grid}>
      {dashboardItems.map((item) => (
        <Link key={item.href} href={item.href} className={styles.card}>
          <span className={styles.badge}>{item.badge}</span>
          <strong className={styles.label}>{item.label}</strong>
          <p className={styles.description}>{item.description}</p>
        </Link>
      ))}
    </div>
  );
}
