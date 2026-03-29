import { NextResponse } from "next/server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uniqueLineItems } from "@/lib/theme/themeOwnership";
import type {
  ThemeHistoryStatus,
  ThemePurchaseLineItem,
} from "@/types/themeHistory";
import type { PurchaseMode, ThemePlatform } from "@/types/theme";

type ItemRow = {
  item_key: string;
  platform: ThemePlatform;
  purchase_mode: PurchaseMode;
  title: string;
  subtitle: string | null;
  price?: number | null;
  version_value: string | null;
};

function mapRowToLineItem(row: ItemRow): ThemePurchaseLineItem {
  return {
    key: row.item_key,
    platform: row.platform,
    purchaseMode: row.purchase_mode,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    price: row.price ?? 0,
    versionValue: row.version_value ?? undefined,
  };
}

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const themeId = searchParams.get("themeId");

    if (!themeId) {
      return NextResponse.json(
        { message: "themeId가 필요해요." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    const [
      { data: purchaseRows, error: purchaseError },
      { data: downloadRows, error: downloadError },
    ] = await Promise.all([
      supabase
        .from("purchase_items")
        .select(
          "item_key, platform, purchase_mode, title, subtitle, price, version_value",
        )
        .eq("user_id", user.id)
        .eq("theme_id", themeId),
      supabase
        .from("download_items")
        .select(
          "item_key, platform, purchase_mode, title, subtitle, version_value",
        )
        .eq("user_id", user.id)
        .eq("theme_id", themeId),
    ]);

    if (purchaseError) {
      console.error(
        "theme-history/status purchase_items error:",
        purchaseError,
      );

      return NextResponse.json(
        { message: "구매 내역을 불러오지 못했어요." },
        { status: 500 },
      );
    }

    if (downloadError) {
      console.error(
        "theme-history/status download_items error:",
        downloadError,
      );

      return NextResponse.json(
        { message: "다운로드 내역을 불러오지 못했어요." },
        { status: 500 },
      );
    }

    const purchasedItems = uniqueLineItems(
      (purchaseRows ?? []).map((row) => mapRowToLineItem(row)),
    );

    const downloadedItems = uniqueLineItems(
      (downloadRows ?? []).map((row) => mapRowToLineItem(row)),
    );

    const response: ThemeHistoryStatus = {
      purchasedItems,
      downloadedItems,
      purchasedItemKeys: purchasedItems.map((item) => item.key),
      downloadedItemKeys: downloadedItems.map((item) => item.key),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("theme-history/status route error:", error);

    return NextResponse.json(
      { message: "알 수 없는 오류가 발생했어요." },
      { status: 500 },
    );
  }
}
