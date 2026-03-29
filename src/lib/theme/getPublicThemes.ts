import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { ThemeItem, ThemePlatform, ThemeType } from "@/types/theme";

type PublicThemeRow = {
  id: string;
  title: string;
  type: ThemeType;
  price: number;
  set_price: number | null;
  set_bonus_count: number | null;
  thumbnail_url: string | null;
  tags: string[] | null;
  is_published: boolean;
  created_at: string;
  platforms: ThemePlatform[] | null;
  detail_html: string | null;
  badge: string | null;
  download_count: number | null;
  purchase_count: number | null;
};

function mapThemeRowToThemeItem(row: PublicThemeRow): ThemeItem {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    price: row.price ?? 0,
    setPrice: row.set_price ?? undefined,
    setBonusCount: row.set_bonus_count ?? undefined,
    thumbnail: row.thumbnail_url ?? "",
    previewImages: [],
    tags: row.tags ?? [],
    isPublished: row.is_published,
    createdAt: row.created_at,
    platforms:
      row.platforms && row.platforms.length > 0 ? row.platforms : ["ios"],
    detailHtml: row.detail_html ?? "",
    badge: row.badge ?? undefined,
    downloadCount: row.download_count ?? 0,
    purchaseCount: row.purchase_count ?? 0,
  };
}

export async function getPublicThemesByType(
  type: ThemeType,
): Promise<ThemeItem[]> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("themes")
    .select(
      "id, title, type, price, set_price, set_bonus_count, thumbnail_url, tags, is_published, created_at, platforms, detail_html, badge, download_count, purchase_count",
    )
    .eq("is_published", true)
    .eq("type", type)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Failed to fetch public ${type} themes:`, error);
    return [];
  }

  return (data ?? []).map((row) =>
    mapThemeRowToThemeItem(row as PublicThemeRow),
  );
}
