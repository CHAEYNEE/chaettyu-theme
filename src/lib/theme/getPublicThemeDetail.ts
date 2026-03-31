import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  PurchaseMode,
  ThemeDownloadFile,
  ThemeItem,
  ThemePlatform,
  ThemeType,
  ThemeVersion,
} from "@/types/theme";

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

type PreviewImageRow = {
  image_url: string;
  sort_order: number;
};

type VersionRow = {
  label: string;
  value: string;
  sort_order: number;
};

type DownloadFileRow = {
  platform: ThemePlatform;
  purchase_mode: PurchaseMode;
  version_value: string | null;
  file_name: string;
  storage_bucket: string;
  storage_path: string;
};

function buildDownloadApiUrl(params: {
  themeId: string;
  platform: ThemePlatform;
  purchaseMode: PurchaseMode;
  versionValue?: string | null;
}) {
  const searchParams = new URLSearchParams({
    platform: params.platform,
    purchaseMode: params.purchaseMode,
  });

  if (params.purchaseMode === "single" && params.versionValue) {
    searchParams.set("versionValue", params.versionValue);
  }

  return `/api/themes/${params.themeId}/download?${searchParams.toString()}`;
}

function mapDownloadFileRowToThemeDownloadFile(
  themeId: string,
  row: DownloadFileRow,
): ThemeDownloadFile {
  if (row.purchase_mode === "set") {
    return {
      platform: row.platform,
      purchaseMode: "set",
      fileName: row.file_name,
      fileUrl: buildDownloadApiUrl({
        themeId,
        platform: row.platform,
        purchaseMode: "set",
      }),
    };
  }

  return {
    platform: row.platform,
    purchaseMode: "single",
    versionValue: row.version_value ?? "",
    fileName: row.file_name,
    fileUrl: buildDownloadApiUrl({
      themeId,
      platform: row.platform,
      purchaseMode: "single",
      versionValue: row.version_value,
    }),
  };
}

export async function getPublicThemeDetail(
  id: string,
): Promise<ThemeItem | null> {
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
        "id, title, type, price, set_price, set_bonus_count, thumbnail_url, tags, is_published, created_at, platforms, detail_html, badge, download_count, purchase_count",
      )
      .eq("id", id)
      .eq("is_published", true)
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
    console.error("Failed to fetch public theme detail:", themeError);
    return null;
  }

  if (previewError) {
    console.error("Failed to fetch preview images:", previewError);
  }

  if (versionError) {
    console.error("Failed to fetch theme versions:", versionError);
  }

  if (downloadFileError) {
    console.error("Failed to fetch theme download files:", downloadFileError);
  }

  if (!themeData) {
    return null;
  }

  const theme = themeData as PublicThemeRow;
  const previewImages = ((previewData ?? []) as PreviewImageRow[]).map(
    (item) => item.image_url,
  );
  const versions = ((versionData ?? []) as VersionRow[]).map<ThemeVersion>(
    (item) => ({
      label: item.label,
      value: item.value,
    }),
  );
  const downloadFiles = (
    (downloadFileData ?? []) as DownloadFileRow[]
  ).map<ThemeDownloadFile>((item) =>
    mapDownloadFileRowToThemeDownloadFile(theme.id, item),
  );

  return {
    id: theme.id,
    title: theme.title,
    type: theme.type,
    price: theme.price ?? 0,
    setPrice: theme.set_price ?? undefined,
    setBonusCount:
      theme.type !== "free" && theme.set_price != null
        ? theme.set_bonus_count && theme.set_bonus_count > 0
          ? theme.set_bonus_count
          : 1
        : undefined,
    thumbnail: theme.thumbnail_url ?? "",
    previewImages,
    tags: theme.tags ?? [],
    isPublished: theme.is_published,
    createdAt: theme.created_at,
    platforms:
      theme.platforms && theme.platforms.length > 0 ? theme.platforms : ["ios"],
    versions,
    detailHtml: theme.detail_html ?? "",
    badge: theme.badge ?? undefined,
    downloadFiles,
    downloadCount: theme.download_count ?? 0,
    purchaseCount: theme.purchase_count ?? 0,
    reviews: [],
    qnas: [],
  };
}
