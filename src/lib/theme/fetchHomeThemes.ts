import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ThemeItem, ThemePlatform, ThemeType } from "@/types/theme";

type HomeThemeRow = {
  id: string;
  title: string;
  type: ThemeType;
  price: number | null;
  thumbnail_url: string | null;
  badge: string | null;
  download_count: number | null;
  purchase_count: number | null;
  is_published: boolean;
  platforms: ThemePlatform[] | null;
  tags: string[] | null;
  created_at: string | null;
};

const HOME_THEME_SELECT = `
  id,
  title,
  type,
  price,
  thumbnail_url,
  badge,
  download_count,
  purchase_count,
  is_published,
  platforms,
  tags,
  created_at
`;

function mapHomeThemeRowToThemeItem(row: HomeThemeRow): ThemeItem {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    price: row.type === "free" ? 0 : (row.price ?? 0),
    thumbnail: row.thumbnail_url ?? "",
    previewImages: [],
    tags: row.tags ?? [],
    isPublished: row.is_published,
    createdAt: row.created_at ?? "",
    platforms:
      row.platforms && row.platforms.length > 0 ? row.platforms : ["ios"],
    detailHtml: "",
    badge: row.badge ?? undefined,
    downloadCount: row.download_count ?? 0,
    purchaseCount: row.purchase_count ?? 0,
  };
}

export async function fetchHomeThemes() {
  const supabase = await createSupabaseServerClient();

  const [freeResult, signatureResult] = await Promise.all([
    supabase
      .from("themes")
      .select(HOME_THEME_SELECT)
      .eq("is_published", true)
      .eq("type", "free")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("themes")
      .select(HOME_THEME_SELECT)
      .eq("is_published", true)
      .eq("type", "signature")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  if (freeResult.error) {
    throw new Error("무료 테마를 불러오지 못했어요.");
  }

  if (signatureResult.error) {
    throw new Error("유료 테마를 불러오지 못했어요.");
  }

  return {
    freeThemes: (freeResult.data ?? []).map((theme) =>
      mapHomeThemeRowToThemeItem(theme as HomeThemeRow),
    ),
    signatureThemes: (signatureResult.data ?? []).map((theme) =>
      mapHomeThemeRowToThemeItem(theme as HomeThemeRow),
    ),
  };
}
