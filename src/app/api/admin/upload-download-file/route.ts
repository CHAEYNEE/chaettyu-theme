import { NextResponse } from "next/server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { PurchaseMode, ThemePlatform } from "@/types/theme";

const DOWNLOAD_BUCKET = "theme-downloads";

function normalizeSegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function sanitizeFileName(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  const name = dotIndex >= 0 ? fileName.slice(0, dotIndex) : fileName;
  const extension = dotIndex >= 0 ? fileName.slice(dotIndex) : "";

  const safeName = normalizeSegment(name) || "download-file";

  return `${safeName}${extension}`;
}

function isValidPlatform(value: unknown): value is ThemePlatform {
  return value === "ios" || value === "android";
}

function isValidPurchaseMode(value: unknown): value is PurchaseMode {
  return value === "single" || value === "set";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const themeId = normalizeSegment(String(formData.get("themeId") || ""));
    const platform = formData.get("platform");
    const purchaseMode = formData.get("purchaseMode");
    const versionValue = normalizeSegment(
      String(formData.get("versionValue") || ""),
    );

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "업로드할 파일을 선택해 주세요." },
        { status: 400 },
      );
    }

    if (!themeId) {
      return NextResponse.json(
        { error: "테마 ID가 필요해요." },
        { status: 400 },
      );
    }

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
        { error: "개별 파일은 연결할 버전 값이 필요해요." },
        { status: 400 },
      );
    }

    const safeFileName = sanitizeFileName(file.name || "download-file");
    const versionSegment = purchaseMode === "single" ? versionValue : "set";
    const storagePath = [
      themeId,
      platform,
      purchaseMode,
      versionSegment,
      `${Date.now()}-${safeFileName}`,
    ].join("/");

    const supabase = createSupabaseAdmin();

    const { error: uploadError } = await supabase.storage
      .from(DOWNLOAD_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "다운로드 파일 업로드에 실패했어요." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "다운로드 파일 업로드가 완료되었어요.",
        fileName: file.name,
        storageBucket: DOWNLOAD_BUCKET,
        storagePath,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "알 수 없는 오류가 발생했어요." },
      { status: 500 },
    );
  }
}
