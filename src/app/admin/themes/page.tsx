import Link from "next/link";

import AdminActionButton from "@/components/admin/AdminActionButton/AdminActionButton";
import AdminEmptyState from "@/components/admin/AdminEmptyState/AdminEmptyState";
import AdminPageSection from "@/components/admin/AdminPageSection/AdminPageSection";
import AdminThemeList, {
  type AdminThemeRow,
} from "@/components/admin/AdminThemeList/AdminThemeList";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { ThemeItem } from "@/types/theme";

import styles from "./page.module.css";

type ThemeFilter = "all" | "free" | "signature";

type AdminThemesPageProps = {
  searchParams?: Promise<{
    type?: string;
  }>;
};

type AdminThemeListItem = AdminThemeRow & {
  createdAt: string;
};

type DbThemeRow = {
  id: string;
  title: string;
  type: ThemeItem["type"];
  is_published: boolean;
  set_price: number | null;
  set_bonus_count: number | null;
  created_at: string;
  thumbnail_url: string | null;
};

type DbSetDownloadRow = {
  theme_id: string;
};

function getFilterLabel(filter: ThemeFilter) {
  switch (filter) {
    case "free":
      return "무료";
    case "signature":
      return "유료";
    case "all":
    default:
      return "전체";
  }
}

function parseThemeFilter(value?: string): ThemeFilter {
  if (value === "free" || value === "signature") {
    return value;
  }

  return "all";
}

export default async function AdminThemesPage({
  searchParams,
}: AdminThemesPageProps) {
  const resolvedSearchParams = await searchParams;
  const currentFilter = parseThemeFilter(resolvedSearchParams?.type);

  const supabase = createSupabaseAdmin();

  const [
    { data: dbThemesData, error: dbThemesError },
    { data: dbSetDownloadData, error: dbSetDownloadError },
  ] = await Promise.all([
    supabase
      .from("themes")
      .select(
        "id, title, type, is_published, set_price, set_bonus_count, created_at, thumbnail_url",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("theme_download_files")
      .select("theme_id")
      .eq("purchase_mode", "set"),
  ]);

  if (dbThemesError) {
    console.error("Failed to fetch themes from Supabase:", dbThemesError);
  }

  if (dbSetDownloadError) {
    console.error(
      "Failed to fetch set download files from Supabase:",
      dbSetDownloadError,
    );
  }

  const dbThemes = (dbThemesData ?? []) as DbThemeRow[];
  const dbSetDownloadRows = (dbSetDownloadData ?? []) as DbSetDownloadRow[];

  const setDownloadThemeIds = new Set(
    dbSetDownloadRows.map((row) => row.theme_id),
  );

  const dbThemeItems: AdminThemeListItem[] = dbThemes.map((theme) => {
    const hasSetMode =
      Boolean(theme.set_price) ||
      Boolean(theme.set_bonus_count) ||
      setDownloadThemeIds.has(theme.id);

    return {
      id: theme.id,
      title: theme.title,
      type: theme.type,
      purchaseMode: hasSetMode ? "set" : "single",
      status: theme.is_published ? "published" : "draft",
      createdAt: theme.created_at,
      thumbnail: theme.thumbnail_url ?? undefined,
    };
  });

  const filteredThemes = dbThemeItems.filter((theme) => {
    if (currentFilter === "all") {
      return true;
    }

    return theme.type === currentFilter;
  });

  const themeRows: AdminThemeRow[] = [...filteredThemes]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .map((theme) => ({
      id: theme.id,
      title: theme.title,
      type: theme.type,
      purchaseMode: theme.purchaseMode,
      status: theme.status,
      thumbnail: theme.thumbnail,
    }));

  const filterOptions: ThemeFilter[] = ["all", "free", "signature"];

  return (
    <AdminPageSection
      eyebrow="THEME CONTROL"
      title="테마 관리"
      description={`${getFilterLabel(currentFilter)} 테마 목록 및 테마 관리`}
      actions={
        <AdminActionButton href="/admin/themes/new">
          + 새 테마 등록
        </AdminActionButton>
      }
    >
      <div className={styles.filterWrap}>
        <div className={styles.filterTabs}>
          {filterOptions.map((filter) => {
            const isActive = currentFilter === filter;
            const href =
              filter === "all"
                ? "/admin/themes"
                : `/admin/themes?type=${filter}`;

            return (
              <Link
                key={filter}
                href={href}
                className={`${styles.filterTab} ${
                  isActive ? styles.filterTabActive : ""
                }`}
              >
                {getFilterLabel(filter)}
              </Link>
            );
          })}
        </div>
      </div>

      {themeRows.length > 0 ? (
        <AdminThemeList items={themeRows} />
      ) : (
        <AdminEmptyState
          title={`${getFilterLabel(currentFilter)} 테마가 아직 없어요`}
          description="테마를 등록해보세요"
        />
      )}
    </AdminPageSection>
  );
}
