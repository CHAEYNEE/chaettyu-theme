import { NextResponse } from "next/server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getNewPurchaseItems } from "@/lib/theme/themeOwnership";
import type {
  CreateThemePurchasePayload,
  ThemePurchaseLineItem,
} from "@/types/themeHistory";
import type { PurchaseMode, ThemePlatform, ThemeType } from "@/types/theme";

type ExistingPurchaseItemRow = {
  item_key: string;
  platform: ThemePlatform;
  purchase_mode: PurchaseMode;
  title: string;
  subtitle: string | null;
  price: number;
  version_value: string | null;
};

type ThemeRow = {
  id: string;
  title: string;
  type: ThemeType;
  thumbnail_url: string;
  is_published: boolean;
};

function isValidPlatform(value: unknown): value is ThemePlatform {
  return value === "ios" || value === "android";
}

function isValidPurchaseMode(value: unknown): value is PurchaseMode {
  return value === "single" || value === "set";
}

function isValidLineItem(value: unknown): value is ThemePurchaseLineItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<ThemePurchaseLineItem>;

  return (
    typeof item.key === "string" &&
    isValidPlatform(item.platform) &&
    isValidPurchaseMode(item.purchaseMode) &&
    typeof item.title === "string" &&
    typeof item.price === "number"
  );
}

function mapExistingRowToLineItem(
  row: ExistingPurchaseItemRow,
): ThemePurchaseLineItem {
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

export async function POST(request: Request) {
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

    const body = (await request.json()) as Partial<CreateThemePurchasePayload>;

    if (!body.themeId || typeof body.themeId !== "string") {
      return NextResponse.json(
        { message: "themeId가 올바르지 않아요." },
        { status: 400 },
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { message: "구매할 구성이 없어요." },
        { status: 400 },
      );
    }

    if (!body.items.every(isValidLineItem)) {
      return NextResponse.json(
        { message: "구매 구성 값이 올바르지 않아요." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    const { data: themeRow, error: themeError } = await supabase
      .from("themes")
      .select("id, title, type, thumbnail_url, is_published")
      .eq("id", body.themeId)
      .eq("is_published", true)
      .maybeSingle<ThemeRow>();

    if (themeError || !themeRow) {
      return NextResponse.json(
        { message: "구매할 수 있는 테마를 찾지 못했어요." },
        { status: 404 },
      );
    }

    if (themeRow.type === "free") {
      return NextResponse.json(
        { message: "무료 테마는 구매할 필요가 없어요." },
        { status: 400 },
      );
    }

    const selectedItems = body.items;

    const { data: existingRows, error: existingError } = await supabase
      .from("purchase_items")
      .select(
        "item_key, platform, purchase_mode, title, subtitle, price, version_value",
      )
      .eq("user_id", user.id)
      .eq("theme_id", body.themeId);

    if (existingError) {
      console.error(
        "purchases route existing purchase_items error:",
        existingError,
      );

      return NextResponse.json(
        { message: "기존 구매 내역을 확인하지 못했어요." },
        { status: 500 },
      );
    }

    const ownedItems = (existingRows ?? []).map((row) =>
      mapExistingRowToLineItem(row),
    );

    const newItems = getNewPurchaseItems(ownedItems, selectedItems);

    if (newItems.length === 0) {
      return NextResponse.json(
        { message: "선택한 구성은 이미 보유 중이에요." },
        { status: 409 },
      );
    }

    const totalPrice = newItems.reduce((sum, item) => sum + item.price, 0);

    const { data: purchaseRow, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        user_id: user.id,
        theme_id: themeRow.id,
        theme_type: themeRow.type,
        theme_title: themeRow.title,
        theme_thumbnail: themeRow.thumbnail_url,
        total_price: totalPrice,
      })
      .select("id")
      .single();

    if (purchaseError || !purchaseRow) {
      console.error("purchases route purchases insert error:", purchaseError);

      return NextResponse.json(
        { message: "구매 기록 저장에 실패했어요." },
        { status: 500 },
      );
    }

    const { error: itemInsertError } = await supabase
      .from("purchase_items")
      .insert(
        newItems.map((item) => ({
          purchase_id: purchaseRow.id,
          user_id: user.id,
          theme_id: themeRow.id,
          item_key: item.key,
          platform: item.platform,
          purchase_mode: item.purchaseMode,
          title: item.title,
          subtitle: item.subtitle ?? null,
          price: item.price,
          version_value: item.versionValue ?? null,
        })),
      );

    if (itemInsertError) {
      console.error(
        "purchases route purchase_items insert error:",
        itemInsertError,
      );

      await supabase.from("purchases").delete().eq("id", purchaseRow.id);

      if (itemInsertError.code === "23505") {
        return NextResponse.json(
          { message: "이미 보유 중인 구성이 포함되어 있어요." },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { message: "구매 구성 저장에 실패했어요." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      purchaseId: purchaseRow.id,
    });
  } catch (error) {
    console.error("purchases route error:", error);

    return NextResponse.json(
      { message: "알 수 없는 오류가 발생했어요." },
      { status: 500 },
    );
  }
}
