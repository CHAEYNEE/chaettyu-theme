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
type ThemeStatusFilter = "all" | "published" | "draft";

type AdminThemesPageProps = {
  searchParams?: Promise<{
    type?: string;
    status?: string;
    q?: string;
  }>;
};

type DbThemeRow = {
  id: string;
  title: string;
  type: ThemeItem["type"];
  is_published: boolean;
  set_price: number | null;
  set_bonus_count: number | null;
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

function getStatusLabel(status: ThemeStatusFilter) {
  switch (status) {
    case "published":
      return "공개";
    case "draft":
      return "비공개";
    case "all":
    default:
      return "전체 공개상태";
  }
}

function parseThemeFilter(value?: string): ThemeFilter {
  if (value === "free" || value === "signature") {
    return value;
  }

  return "all";
}

function parseStatusFilter(value?: string): ThemeStatusFilter {
  if (value === "published" || value === "draft") {
    return value;
  }

  return "all";
}

function buildAdminThemesHref({
  type,
  status,
  q,
}: {
  type?: ThemeFilter;
  status?: ThemeStatusFilter;
  q?: string;
}) {
  const params = new URLSearchParams();

  if (type && type !== "all") {
    params.set("type", type);
  }

  if (status && status !== "all") {
    params.set("status", status);
  }

  if (q?.trim()) {
    params.set("q", q.trim());
  }

  const queryString = params.toString();

  return queryString ? `/admin/themes?${queryString}` : "/admin/themes";
}

function getPageDescription({
  type,
  status,
  keyword,
}: {
  type: ThemeFilter;
  status: ThemeStatusFilter;
  keyword: string;
}) {
  const parts = [`${getFilterLabel(type)} 테마`, getStatusLabel(status)];

  if (keyword) {
    parts.push(`"${keyword}" 검색 결과`);
  }

  return `${parts.join(" · ")} 관리`;
}

function getEmptyStateTitle({
  type,
  status,
  keyword,
}: {
  type: ThemeFilter;
  status: ThemeStatusFilter;
  keyword: string;
}) {
  if (keyword) {
    return `"${keyword}" 검색 결과가 없어요`;
  }

  if (status === "all") {
    return `${getFilterLabel(type)} 테마가 아직 없어요`;
  }

  return `${getFilterLabel(type)} ${getStatusLabel(status)} 테마가 아직 없어요`;
}

function getEmptyStateDescription({
  status,
  keyword,
}: {
  status: ThemeStatusFilter;
  keyword: string;
}) {
  if (keyword) {
    return "검색어 또는 필터 조건을 바꿔서 다시 확인해보세요";
  }

  if (status === "all") {
    return "테마를 등록해보세요";
  }

  return `${getStatusLabel(status)} 상태의 테마를 등록해보세요`;
}

export default async function AdminThemesPage({
  searchParams,
}: AdminThemesPageProps) {
  const resolvedSearchParams = await searchParams;

  const currentFilter = parseThemeFilter(resolvedSearchParams?.type);
  const currentStatus = parseStatusFilter(resolvedSearchParams?.status);
  const keyword = resolvedSearchParams?.q?.trim() ?? "";

  const supabase = createSupabaseAdmin();

  let themesQuery = supabase
    .from("themes")
    .select(
      "id, title, type, is_published, set_price, set_bonus_count, thumbnail_url",
    )
    .order("created_at", { ascending: false });

  if (currentFilter !== "all") {
    themesQuery = themesQuery.eq("type", currentFilter);
  }

  if (currentStatus !== "all") {
    themesQuery = themesQuery.eq("is_published", currentStatus === "published");
  }

  if (keyword) {
    themesQuery = themesQuery.or(
      `title.ilike.%${keyword}%,id.ilike.%${keyword}%`,
    );
  }

  const [
    { data: dbThemesData, error: dbThemesError },
    { data: dbSetDownloadData, error: dbSetDownloadError },
  ] = await Promise.all([
    themesQuery,
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

  const themeRows: AdminThemeRow[] = dbThemes.map((theme) => {
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
      thumbnail: theme.thumbnail_url ?? undefined,
    };
  });

  const filterOptions: ThemeFilter[] = ["all", "free", "signature"];

  return (
    <AdminPageSection
      eyebrow="THEME CONTROL"
      title="테마 관리"
      description={getPageDescription({
        type: currentFilter,
        status: currentStatus,
        keyword,
      })}
      actions={
        <AdminActionButton href="/admin/themes/new">
          + 새 테마 등록
        </AdminActionButton>
      }
    >
      <div className={styles.toolbar}>
        <form action="/admin/themes" method="get" className={styles.searchForm}>
          <input type="hidden" name="type" value={currentFilter} />
          <input type="hidden" name="status" value={currentStatus} />

          <input
            type="text"
            name="q"
            defaultValue={keyword}
            placeholder="테마명 또는 ID 검색"
            className={styles.searchInput}
          />

          <button type="submit" className={styles.searchButton}>
            검색
          </button>

          <Link href="/admin/themes" className={styles.resetButton}>
            초기화
          </Link>
        </form>

        <div className={styles.filterWrap}>
          <div className={styles.filterTabs}>
            {filterOptions.map((filter) => {
              const isActive = currentFilter === filter;
              const href = buildAdminThemesHref({
                type: filter,
                status: currentStatus,
                q: keyword,
              });

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

          <form
            action="/admin/themes"
            method="get"
            className={styles.statusForm}
          >
            <input type="hidden" name="type" value={currentFilter} />
            <input type="hidden" name="q" value={keyword} />

            <select
              name="status"
              defaultValue={currentStatus}
              className={styles.statusSelect}
            >
              <option value="all">전체 공개상태</option>
              <option value="published">공개</option>
              <option value="draft">비공개</option>
            </select>

            <button type="submit" className={styles.statusButton}>
              적용
            </button>
          </form>
        </div>
      </div>

      {themeRows.length > 0 ? (
        <AdminThemeList items={themeRows} />
      ) : (
        <AdminEmptyState
          title={getEmptyStateTitle({
            type: currentFilter,
            status: currentStatus,
            keyword,
          })}
          description={getEmptyStateDescription({
            status: currentStatus,
            keyword,
          })}
        />
      )}
    </AdminPageSection>
  );
}
