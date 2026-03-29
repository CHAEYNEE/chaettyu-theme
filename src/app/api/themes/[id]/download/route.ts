import { NextResponse } from "next/server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { PurchaseMode, ThemePlatform } from "@/types/theme";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isValidPlatform(value: string | null): value is ThemePlatform {
  return value === "ios" || value === "android";
}

function isValidPurchaseMode(value: string | null): value is PurchaseMode {
  return value === "single" || value === "set";
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);

    const platform = searchParams.get("platform");
    const purchaseMode = searchParams.get("purchaseMode");
    const versionValue = searchParams.get("versionValue");

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

    const supabase = createSupabaseAdmin();

    const { data: themeData, error: themeError } = await supabase
      .from("themes")
      .select("id, is_published")
      .eq("id", id)
      .eq("is_published", true)
      .maybeSingle();

    if (themeError || !themeData) {
      return NextResponse.json(
        { error: "공개된 테마를 찾지 못했어요." },
        { status: 404 },
      );
    }

    let query = supabase
      .from("theme_download_files")
      .select("file_name, storage_bucket, storage_path")
      .eq("theme_id", id)
      .eq("platform", platform)
      .eq("purchase_mode", purchaseMode);

    if (purchaseMode === "single") {
      if (!versionValue) {
        return NextResponse.json(
          { error: "버전 값이 필요해요." },
          { status: 400 },
        );
      }

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

    return NextResponse.redirect(signedUrlData.signedUrl, 307);
  } catch {
    return NextResponse.json(
      { error: "알 수 없는 오류가 발생했어요." },
      { status: 500 },
    );
  }
}
