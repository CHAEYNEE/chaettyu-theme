import AdminDashboardPanel from "@/components/admin/AdminDashboardPanel/AdminDashboardPanel";
import AdminDashboardSummary from "@/components/admin/AdminDashboardSummary/AdminDashboardSummary";
import AdminPageSection from "@/components/admin/AdminPageSection/AdminPageSection";
import AdminQuickActions from "@/components/admin/AdminQuickActions/AdminQuickActions";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

import styles from "./page.module.css";

type DbThemeRow = {
  id: string;
  title: string;
  type: "free" | "signature";
  is_published: boolean;
  price: number;
  download_count: number | null;
  purchase_count: number | null;
  created_at: string;
};

function formatPrice(value: number) {
  return `₩${value.toLocaleString("ko-KR")}`;
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateString));
}

export default async function AdminPage() {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("themes")
    .select(
      "id, title, type, is_published, price, download_count, purchase_count, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch admin dashboard themes:", error);
  }

  const themes = (data ?? []) as DbThemeRow[];

  const totalThemeCount = themes.length;
  const publishedThemeCount = themes.filter(
    (theme) => theme.is_published,
  ).length;

  const totalPurchaseCount = themes.reduce(
    (sum, theme) => sum + (theme.purchase_count ?? 0),
    0,
  );

  const totalRevenue = themes.reduce(
    (sum, theme) => sum + theme.price * (theme.purchase_count ?? 0),
    0,
  );

  const recentThemes = [...themes]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 3);

  const popularFreeThemes = [...themes]
    .filter((theme) => theme.type === "free")
    .sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0))
    .slice(0, 3);

  const popularSignatureThemes = [...themes]
    .filter((theme) => theme.type === "signature")
    .sort((a, b) => (b.purchase_count ?? 0) - (a.purchase_count ?? 0))
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
    createdAt: formatDate(theme.created_at),
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
      description="채뜌.theme 운영 현황을 한눈에 확인하는 대시보드"
    >
      <AdminDashboardSummary items={dashboardSummary} />

      <div className={styles.panelGrid}>
        <AdminDashboardPanel title="최근 등록 테마">
          {recentActivities.length > 0 ? (
            recentActivities.map((item) => (
              <p key={item.id} className={styles.panelText}>
                <span className={styles.themeName}>{item.title}</span> 테마가{" "}
                {item.createdAt}에 등록되었어요.
              </p>
            ))
          ) : (
            <p className={styles.panelText}>아직 등록된 테마가 없어요.</p>
          )}
        </AdminDashboardPanel>

        <AdminDashboardPanel title="빠른 작업">
          <AdminQuickActions items={quickActions} />
        </AdminDashboardPanel>
      </div>

      <div className={styles.panelGrid}>
        <AdminDashboardPanel title="인기 무료 테마 TOP 3">
          {popularFreeThemes.length > 0 ? (
            popularFreeThemes.map((theme, index) => (
              <div key={theme.id} className={styles.rankRow}>
                <span className={styles.rankBadge}>{index + 1}</span>
                <div className={styles.rankContent}>
                  <strong className={styles.rankTitle}>{theme.title}</strong>
                  <p className={styles.rankMeta}>
                    다운로드{" "}
                    <span className={styles.countText}>
                      {(theme.download_count ?? 0).toLocaleString("ko-KR")}회
                    </span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.panelText}>무료 테마 데이터가 아직 없어요.</p>
          )}
        </AdminDashboardPanel>

        <AdminDashboardPanel title="인기 유료 테마 TOP 3">
          {popularSignatureThemes.length > 0 ? (
            popularSignatureThemes.map((theme, index) => (
              <div key={theme.id} className={styles.rankRow}>
                <span className={styles.rankBadge}>{index + 1}</span>
                <div className={styles.rankContent}>
                  <strong className={styles.rankTitle}>{theme.title}</strong>
                  <p className={styles.rankMeta}>
                    구매{" "}
                    <span className={styles.countText}>
                      {(theme.purchase_count ?? 0).toLocaleString("ko-KR")}건
                    </span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.panelText}>유료 테마 데이터가 아직 없어요.</p>
          )}
        </AdminDashboardPanel>
      </div>
    </AdminPageSection>
  );
}
