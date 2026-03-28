import AdminDashboardPanel from "@/components/admin/AdminDashboardPanel/AdminDashboardPanel";
import AdminDashboardSummary from "@/components/admin/AdminDashboardSummary/AdminDashboardSummary";
import AdminPageSection from "@/components/admin/AdminPageSection/AdminPageSection";
import AdminQuickActions from "@/components/admin/AdminQuickActions/AdminQuickActions";
import { themes } from "@/data/themes";

import styles from "./page.module.css";

function formatPrice(value: number) {
  return `₩${value.toLocaleString("ko-KR")}`;
}

export default function AdminPage() {
  const totalThemeCount = themes.length;
  const publishedThemeCount = themes.filter(
    (theme) => theme.isPublished,
  ).length;

  const totalPurchaseCount = themes.reduce(
    (sum, theme) => sum + (theme.purchaseCount ?? 0),
    0,
  );

  const totalRevenue = themes.reduce(
    (sum, theme) => sum + theme.price * (theme.purchaseCount ?? 0),
    0,
  );

  const recentThemes = [...themes]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);

  const popularFreeThemes = [...themes]
    .filter((theme) => theme.type === "free")
    .sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0))
    .slice(0, 3);

  const popularSignatureThemes = [...themes]
    .filter((theme) => theme.type === "signature")
    .sort((a, b) => (b.purchaseCount ?? 0) - (a.purchaseCount ?? 0))
    .slice(0, 3);

  const dashboardSummary = [
    {
      label: "전체 테마",
      value: String(totalThemeCount),
      tone: "soft" as const,
    },
    {
      label: "공개 테마",
      value: String(publishedThemeCount),
      tone: "cream" as const,
    },
    {
      label: "총 구매",
      value: String(totalPurchaseCount),
      tone: "soft" as const,
    },
    {
      label: "총 수입액",
      value: formatPrice(totalRevenue),
      tone: "accent" as const,
    },
  ];

  const recentActivities = recentThemes.map((theme) => ({
    id: theme.id,
    title: theme.title,
    createdAt: theme.createdAt,
  }));

  const quickActions = [
    { href: "/admin/themes/new", label: "새 테마 등록" },
    { href: "/admin/themes", label: "전체 테마 보기" },
    { href: "/admin/themes?type=free", label: "무료 테마 보기" },
    { href: "/admin/themes?type=signature", label: "유료 테마 보기" },
  ];

  return (
    <AdminPageSection
      eyebrow="ADMIN HOME"
      title="관리자 대시보드"
      description="채뜌.theme 운영 현황을 한눈에 확인하고 필요한 작업으로 바로 이동할 수 있어요."
    >
      <AdminDashboardSummary items={dashboardSummary} />

      <div className={styles.panelGrid}>
        <AdminDashboardPanel title="최근 등록 테마">
          {recentActivities.map((item) => (
            <p key={item.id} className={styles.panelText}>
              <span className={styles.themeName}>{item.title}</span> 테마가{" "}
              {item.createdAt}에 등록되었어요.
            </p>
          ))}
        </AdminDashboardPanel>

        <AdminDashboardPanel title="빠른 작업">
          <AdminQuickActions items={quickActions} />
        </AdminDashboardPanel>
      </div>

      <div className={styles.panelGrid}>
        <AdminDashboardPanel title="인기 무료 테마 TOP 3">
          {popularFreeThemes.map((theme, index) => (
            <div key={theme.id} className={styles.rankRow}>
              <span className={styles.rankBadge}>{index + 1}</span>
              <div className={styles.rankContent}>
                <strong className={styles.rankTitle}>{theme.title}</strong>
                <p className={styles.rankMeta}>
                  다운로드{" "}
                  <span className={styles.countText}>
                    {(theme.downloadCount ?? 0).toLocaleString("ko-KR")}회
                  </span>
                </p>
              </div>
            </div>
          ))}
        </AdminDashboardPanel>

        <AdminDashboardPanel title="인기 시그니처 테마 TOP 3">
          {popularSignatureThemes.map((theme, index) => (
            <div key={theme.id} className={styles.rankRow}>
              <span className={styles.rankBadge}>{index + 1}</span>
              <div className={styles.rankContent}>
                <strong className={styles.rankTitle}>{theme.title}</strong>
                <p className={styles.rankMeta}>
                  구매{" "}
                  <span className={styles.countText}>
                    {(theme.purchaseCount ?? 0).toLocaleString("ko-KR")}건
                  </span>
                </p>
              </div>
            </div>
          ))}
        </AdminDashboardPanel>
      </div>
    </AdminPageSection>
  );
}
