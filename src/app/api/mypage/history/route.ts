import { NextResponse } from "next/server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ThemeDownloadHistoryItem,
  ThemeHistoryResponse,
  ThemePurchaseHistoryItem,
  ThemePurchaseLineItem,
} from "@/types/themeHistory";
import type { PurchaseMode, ThemePlatform, ThemeType } from "@/types/theme";

type PurchaseRow = {
  id: string;
  user_id: string;
  theme_id: string;
  theme_type: ThemeType;
  theme_title: string;
  theme_thumbnail: string;
  total_price: number;
  created_at: string;
};

type PurchaseItemRow = {
  purchase_id: string;
  item_key: string;
  platform: ThemePlatform;
  purchase_mode: PurchaseMode;
  title: string;
  subtitle: string | null;
  price: number;
  version_value: string | null;
};

type DownloadRow = {
  id: string;
  user_id: string;
  theme_id: string;
  theme_type: ThemeType;
  theme_title: string;
  theme_thumbnail: string;
  downloaded_at: string;
};

type DownloadItemRow = {
  download_id: string;
  item_key: string;
  platform: ThemePlatform;
  purchase_mode: PurchaseMode;
  title: string;
  subtitle: string | null;
  version_value: string | null;
};

function mapPurchaseItem(row: PurchaseItemRow): ThemePurchaseLineItem {
  return {
    key: row.item_key,
    platform: row.platform,
    purchaseMode: row.purchase_mode,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    price: row.price,
    versionValue: row.version_value ?? undefined,
  };
}

function mapDownloadItem(row: DownloadItemRow): ThemePurchaseLineItem {
  return {
    key: row.item_key,
    platform: row.platform,
    purchaseMode: row.purchase_mode,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    price: 0,
    versionValue: row.version_value ?? undefined,
  };
}

export async function GET() {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "로그인이 필요해요." },
        { status: 401 },
      );
    }

    const supabase = createSupabaseAdmin();

    const [
      { data: purchaseRows, error: purchaseError },
      { data: purchaseItemRows, error: purchaseItemError },
      { data: downloadRows, error: downloadError },
      { data: downloadItemRows, error: downloadItemError },
    ] = await Promise.all([
      supabase
        .from("purchases")
        .select(
          "id, user_id, theme_id, theme_type, theme_title, theme_thumbnail, total_price, created_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("purchase_items")
        .select(
          "purchase_id, item_key, platform, purchase_mode, title, subtitle, price, version_value",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("downloads")
        .select(
          "id, user_id, theme_id, theme_type, theme_title, theme_thumbnail, downloaded_at",
        )
        .eq("user_id", user.id)
        .order("downloaded_at", { ascending: false }),
      supabase
        .from("download_items")
        .select(
          "download_id, item_key, platform, purchase_mode, title, subtitle, version_value",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
    ]);

    if (
      purchaseError ||
      purchaseItemError ||
      downloadError ||
      downloadItemError
    ) {
      console.error("mypage/history route error:", {
        purchaseError,
        purchaseItemError,
        downloadError,
        downloadItemError,
      });

      return NextResponse.json(
        { message: "마이페이지 이력을 불러오지 못했어요." },
        { status: 500 },
      );
    }

    const purchaseItemMap = new Map<string, ThemePurchaseLineItem[]>();

    (purchaseItemRows ?? []).forEach((row) => {
      const list = purchaseItemMap.get(row.purchase_id) ?? [];
      list.push(mapPurchaseItem(row));
      purchaseItemMap.set(row.purchase_id, list);
    });

    const purchases: ThemePurchaseHistoryItem[] = (purchaseRows ?? []).map(
      (row: PurchaseRow) => ({
        id: row.id,
        userId: row.user_id,
        themeId: row.theme_id,
        themeType: row.theme_type,
        themeTitle: row.theme_title,
        themeThumbnail: row.theme_thumbnail,
        purchasedAt: row.created_at,
        totalPrice: row.total_price,
        items: purchaseItemMap.get(row.id) ?? [],
      }),
    );

    const downloadItemMap = new Map<string, ThemePurchaseLineItem[]>();

    (downloadItemRows ?? []).forEach((row) => {
      const list = downloadItemMap.get(row.download_id) ?? [];
      list.push(mapDownloadItem(row));
      downloadItemMap.set(row.download_id, list);
    });

    const downloads: ThemeDownloadHistoryItem[] = (downloadRows ?? []).map(
      (row: DownloadRow) => ({
        id: row.id,
        userId: row.user_id,
        themeId: row.theme_id,
        themeType: row.theme_type,
        themeTitle: row.theme_title,
        themeThumbnail: row.theme_thumbnail,
        downloadedAt: row.downloaded_at,
        items: downloadItemMap.get(row.id) ?? [],
      }),
    );

    const response: ThemeHistoryResponse = {
      purchases,
      downloads,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("mypage/history route unexpected error:", error);

    return NextResponse.json(
      { message: "알 수 없는 오류가 발생했어요." },
      { status: 500 },
    );
  }
}
