import { notFound } from "next/navigation";

import AdminPageSection from "@/components/admin/AdminPageSection/AdminPageSection";
import AdminThemeForm, {
  type AdminThemeFormInitialValues,
} from "@/components/admin/AdminThemeForm/AdminThemeForm";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { PurchaseMode, ThemePlatform, ThemeType } from "@/types/theme";

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
  detail_json: Record<string, unknown> | null;
  platforms: ThemePlatform[] | null;
  is_published: boolean;
};

type DbPreviewImageRow = {
  image_url: string;
  sort_order: number;
};

type DbThemeVersionRow = {
  label: string;
  value: string;
  sort_order: number;
};

type DbDownloadFileRow = {
  platform: ThemePlatform;
  purchase_mode: PurchaseMode;
  version_value: string | null;
  file_name: string;
  storage_bucket: string;
  storage_path: string;
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

function sanitizeDetailJson(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

export default async function AdminEditThemePage({
  params,
}: AdminEditThemePageProps) {
  const { id } = await params;
  const supabase = createSupabaseAdmin();

  const [
    { data: themeData, error: themeError },
    { data: previewData, error: previewError },
    { data: versionData, error: versionError },
    { data: downloadFileData, error: downloadFileError },
  ] = await Promise.all([
    supabase
      .from("themes")
      .select(
        "id, title, type, price, set_price, thumbnail_url, tags, badge, detail_html, detail_json, platforms, is_published",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("theme_preview_images")
      .select("image_url, sort_order")
      .eq("theme_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("theme_versions")
      .select("label, value, sort_order")
      .eq("theme_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("theme_download_files")
      .select(
        "platform, purchase_mode, version_value, file_name, storage_bucket, storage_path",
      )
      .eq("theme_id", id),
  ]);

  if (themeError) {
    console.error("Failed to fetch theme for edit:", themeError);
  }

  if (previewError) {
    console.error("Failed to fetch preview images for edit:", previewError);
  }

  if (versionError) {
    console.error("Failed to fetch theme versions for edit:", versionError);
  }

  if (downloadFileError) {
    console.error(
      "Failed to fetch theme download files for edit:",
      downloadFileError,
    );
  }

  if (!themeData) {
    notFound();
  }

  const theme = themeData as DbThemeDetailRow;
  const previewImages = ((previewData ?? []) as DbPreviewImageRow[]).map(
    (item) => item.image_url,
  );
  const versions = ((versionData ?? []) as DbThemeVersionRow[]).map(
    (version) => ({
      label: version.label,
      value: version.value,
    }),
  );
  const downloadFiles = ((downloadFileData ?? []) as DbDownloadFileRow[]).map(
    (downloadFile) => ({
      platform: downloadFile.platform,
      purchaseMode: downloadFile.purchase_mode,
      versionValue: downloadFile.version_value ?? undefined,
      fileName: downloadFile.file_name,
      storageBucket: downloadFile.storage_bucket,
      storagePath: downloadFile.storage_path,
    }),
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
    detailJson: sanitizeDetailJson(theme.detail_json),
    platforms: sanitizePlatforms(theme.platforms),
    isPublished: theme.is_published,
    versions,
    downloadFiles,
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
