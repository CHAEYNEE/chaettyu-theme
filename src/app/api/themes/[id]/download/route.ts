import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isOwnedLineItem } from "@/lib/theme/themeOwnership";
import type { PurchaseMode, ThemePlatform, ThemeType } from "@/types/theme";
import type { ThemePurchaseLineItem } from "@/types/themeHistory";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type PurchaseItemRow = {
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
  is_published: boolean;
  type: ThemeType;
  title: string;
  thumbnail_url: string;
  download_count: number | null;
};

function isValidPlatform(value: string | null): value is ThemePlatform {
  return value === "ios" || value === "android";
}

function isValidPurchaseMode(value: string | null): value is PurchaseMode {
  return value === "single" || value === "set";
}

function buildRequestedItem(params: {
  platform: ThemePlatform;
  purchaseMode: PurchaseMode;
  versionValue: string | null;
}): ThemePurchaseLineItem {
  const platformLabel = params.platform === "ios" ? "iOS" : "AND";

  if (params.purchaseMode === "set") {
    return {
      key: `${params.platform}-set`,
      platform: params.platform,
      purchaseMode: "set",
      title: `[${platformLabel}] 세트 다운로드`,
      subtitle: undefined,
      price: 0,
      versionValue: undefined,
    };
  }

  return {
    key: `${params.platform}-single-${params.versionValue ?? "default"}`,
    platform: params.platform,
    purchaseMode: "single",
    title: `[${platformLabel}] ${params.versionValue ?? "기본 버전"}`,
    subtitle: "개별 다운로드",
    price: 0,
    versionValue: params.versionValue ?? undefined,
  };
}

function mapPurchaseRowToLineItem(row: PurchaseItemRow): ThemePurchaseLineItem {
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

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);

    const platform = searchParams.get("platform");
    const purchaseMode = searchParams.get("purchaseMode");
    const versionValue = searchParams.get("versionValue");
    const responseType = searchParams.get("responseType");

    if (!isValidPlatform(platform)) {
      return NextResponse.json(
        { error: "플랫폼 값이 올바르지 않아요." },
        { status: 400 },
      );
    }

    if (!isValidPurchaseMode(purchaseMode)) {
      return NextResponse.json(
        { error: "구매 방식 값이 올바르지 않아요." },
        { status: 400 },
      );
    }

    if (purchaseMode === "single" && !versionValue) {
      return NextResponse.json(
        { error: "버전 값이 필요해요." },
        { status: 400 },
      );
    }

    const supabaseServer = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    const supabase = createSupabaseAdmin();

    const { data: themeData, error: themeError } = await supabase
      .from("themes")
      .select("id, is_published, type, title, thumbnail_url, download_count")
      .eq("id", id)
      .eq("is_published", true)
      .maybeSingle<ThemeRow>();

    if (themeError || !themeData) {
      return NextResponse.json(
        { error: "공개된 테마를 찾지 못했어요." },
        { status: 404 },
      );
    }

    const requestedItem = buildRequestedItem({
      platform,
      purchaseMode,
      versionValue,
    });

    if (themeData.type !== "free") {
      if (!user) {
        return NextResponse.json(
          { error: "유료 테마는 로그인 후 다운로드할 수 있어요." },
          { status: 401 },
        );
      }

      const { data: purchaseItems, error: purchaseItemsError } = await supabase
        .from("purchase_items")
        .select(
          "item_key, platform, purchase_mode, title, subtitle, price, version_value",
        )
        .eq("user_id", user.id)
        .eq("theme_id", id);

      if (purchaseItemsError) {
        console.error(
          "Theme download purchase_items error:",
          purchaseItemsError,
        );

        return NextResponse.json(
          { error: "구매 내역을 확인하지 못했어요." },
          { status: 500 },
        );
      }

      const ownedItems = (purchaseItems ?? []).map((row) =>
        mapPurchaseRowToLineItem(row),
      );

      const canDownload = isOwnedLineItem(requestedItem, ownedItems);

      if (!canDownload) {
        return NextResponse.json(
          { error: "이 구성은 아직 구매하지 않았어요." },
          { status: 403 },
        );
      }
    }

    let query = supabase
      .from("theme_download_files")
      .select("file_name, storage_bucket, storage_path")
      .eq("theme_id", id)
      .eq("platform", platform)
      .eq("purchase_mode", purchaseMode);

    if (purchaseMode === "single") {
      query = query.eq("version_value", versionValue);
    } else {
      query = query.is("version_value", null);
    }

    const { data: downloadFile, error: downloadFileError } =
      await query.maybeSingle();

    if (downloadFileError || !downloadFile) {
      return NextResponse.json(
        { error: "다운로드 파일을 찾지 못했어요." },
        { status: 404 },
      );
    }

    if (user) {
      const { data: downloadRow, error: downloadUpsertError } = await supabase
        .from("downloads")
        .upsert(
          {
            user_id: user.id,
            theme_id: id,
            theme_type: themeData.type,
            theme_title: themeData.title,
            theme_thumbnail: themeData.thumbnail_url,
            downloaded_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,theme_id",
          },
        )
        .select("id")
        .single();

      if (downloadUpsertError || !downloadRow) {
        console.error(
          "Theme download downloads upsert error:",
          downloadUpsertError,
        );
      } else {
        const { error: downloadItemUpsertError } = await supabase
          .from("download_items")
          .upsert(
            {
              download_id: downloadRow.id,
              user_id: user.id,
              theme_id: id,
              item_key: requestedItem.key,
              platform: requestedItem.platform,
              purchase_mode: requestedItem.purchaseMode,
              title: requestedItem.title,
              subtitle: requestedItem.subtitle ?? null,
              version_value: requestedItem.versionValue ?? null,
            },
            {
              onConflict: "user_id,theme_id,item_key",
            },
          );

        if (downloadItemUpsertError) {
          console.error(
            "Theme download download_items upsert error:",
            downloadItemUpsertError,
          );
        }
      }
    }

    if (themeData.type === "free") {
      const nextDownloadCount = (themeData.download_count ?? 0) + 1;

      const { error: incrementError } = await supabase
        .from("themes")
        .update({
          download_count: nextDownloadCount,
        })
        .eq("id", id);

      if (incrementError) {
        console.error("Theme download count increment error:", incrementError);
      } else {
        revalidatePath("/", "page");
        revalidatePath("/themes/free", "page");
        revalidatePath(`/themes/${id}`, "page");
      }
    }

    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from(downloadFile.storage_bucket)
        .createSignedUrl(downloadFile.storage_path, 60);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      return NextResponse.json(
        { error: "다운로드 링크 생성에 실패했어요." },
        { status: 500 },
      );
    }

    const signedUrl = new URL(signedUrlData.signedUrl);
    signedUrl.searchParams.set("download", downloadFile.file_name);

    if (responseType === "json") {
      return NextResponse.json({
        downloadUrl: signedUrl.toString(),
        fileName: downloadFile.file_name,
      });
    }

    return NextResponse.redirect(signedUrl.toString(), 307);
  } catch (error) {
    console.error("Theme download route error:", error);

    return NextResponse.json(
      { error: "알 수 없는 오류가 발생했어요." },
      { status: 500 },
    );
  }
}
