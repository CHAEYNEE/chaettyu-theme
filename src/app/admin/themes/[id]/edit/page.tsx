import { notFound } from "next/navigation";

import AdminPageSection from "@/components/admin/AdminPageSection/AdminPageSection";
import AdminThemeForm, {
  type AdminThemeFormInitialValues,
} from "@/components/admin/AdminThemeForm/AdminThemeForm";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { ThemePlatform, ThemeType } from "@/types/theme";

type AdminEditThemePageProps = {
  params: Promise<{
    id: string;
  }>;
};

type DbThemeDetailRow = {
  id: string;
  title: string;
  type: ThemeType;
  price: number;
  set_price: number | null;
  thumbnail_url: string | null;
  tags: string[] | null;
  badge: string | null;
  detail_html: string | null;
  platforms: ThemePlatform[] | null;
  is_published: boolean;
};

type DbPreviewImageRow = {
  image_url: string;
  sort_order: number;
};

function sanitizePlatforms(value: ThemePlatform[] | null | undefined) {
  if (!Array.isArray(value)) {
    return ["ios"] as ThemePlatform[];
  }

  const filtered = value.filter(
    (item): item is ThemePlatform => item === "ios" || item === "android",
  );

  return filtered.length > 0 ? filtered : (["ios"] as ThemePlatform[]);
}

export default async function AdminEditThemePage({
  params,
}: AdminEditThemePageProps) {
  const { id } = await params;
  const supabase = createSupabaseAdmin();

  const [
    { data: themeData, error: themeError },
    { data: previewData, error: previewError },
  ] = await Promise.all([
    supabase
      .from("themes")
      .select(
        "id, title, type, price, set_price, thumbnail_url, tags, badge, detail_html, platforms, is_published",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("theme_preview_images")
      .select("image_url, sort_order")
      .eq("theme_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  if (themeError) {
    console.error("Failed to fetch theme for edit:", themeError);
  }

  if (previewError) {
    console.error("Failed to fetch preview images for edit:", previewError);
  }

  if (!themeData) {
    notFound();
  }

  const theme = themeData as DbThemeDetailRow;
  const previewImages = ((previewData ?? []) as DbPreviewImageRow[]).map(
    (item) => item.image_url,
  );

  const initialValues: AdminThemeFormInitialValues = {
    id: theme.id,
    title: theme.title,
    type: theme.type,
    price: Number(theme.price ?? 0),
    setPrice: theme.set_price,
    thumbnail: theme.thumbnail_url ?? "",
    previewImages,
    tags: theme.tags ?? [],
    badge: theme.badge ?? "",
    detailHtml: theme.detail_html ?? "",
    platforms: sanitizePlatforms(theme.platforms),
    isPublished: theme.is_published,
  };

  return (
    <AdminPageSection
      eyebrow="EDIT THEME"
      title="테마 수정"
      description={`${theme.title} 정보를 수정해보세요.`}
    >
      <AdminThemeForm mode="edit" initialValues={initialValues} />
    </AdminPageSection>
  );
}
