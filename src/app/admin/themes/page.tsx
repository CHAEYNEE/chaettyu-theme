"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import AdminActionButton from "@/components/admin/AdminActionButton/AdminActionButton";
import AdminEmptyState from "@/components/admin/AdminEmptyState/AdminEmptyState";
import AdminPageSection from "@/components/admin/AdminPageSection/AdminPageSection";
import AdminThemeList, {
  type AdminThemeRow,
} from "@/components/admin/AdminThemeList/AdminThemeList";
import { themes } from "@/data/themes";
import { getMergedAdminThemes } from "@/lib/storage/adminThemeStorage";
import type { ThemeItem } from "@/types/theme";

import styles from "./page.module.css";

type ThemeFilter = "all" | "free" | "signature";

function getPurchaseMode(theme: ThemeItem): AdminThemeRow["purchaseMode"] {
  if (theme.setPrice || theme.setBonusCount) {
    return "set";
  }

  if (theme.downloadFiles?.some((file) => file.purchaseMode === "set")) {
    return "set";
  }

  return "single";
}

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

function parseThemeFilter(value: string | null): ThemeFilter {
  if (value === "free" || value === "signature") {
    return value;
  }

  return "all";
}

export default function AdminThemesPage() {
  const searchParams = useSearchParams();

  const [allThemes] = useState<ThemeItem[]>(() => getMergedAdminThemes(themes));

  const currentFilter = parseThemeFilter(searchParams.get("type"));

  const filteredThemes = useMemo(() => {
    return allThemes.filter((theme) => {
      if (currentFilter === "all") {
        return true;
      }

      return theme.type === currentFilter;
    });
  }, [allThemes, currentFilter]);

  const themeRows: AdminThemeRow[] = useMemo(() => {
    return [...filteredThemes]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .map((theme) => ({
        id: theme.id,
        title: theme.title,
        type: theme.type,
        purchaseMode: getPurchaseMode(theme),
        status: theme.isPublished ? "published" : "draft",
      }));
  }, [filteredThemes]);

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
