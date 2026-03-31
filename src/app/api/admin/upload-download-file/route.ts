import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/requireAdminApi";
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

type CreateUploadUrlBody = {
  fileName?: string;
  themeId?: string;
  platform?: ThemePlatform;
  purchaseMode?: PurchaseMode;
  versionValue?: string;
};

export async function POST(request: Request) {
  try {
    const adminGuard = await requireAdminApi();

    if (!adminGuard.ok) {
      return adminGuard.response;
    }

    const body = (await request.json()) as CreateUploadUrlBody;

    const fileName = String(body.fileName || "");
    const themeId = normalizeSegment(String(body.themeId || ""));
    const platform = body.platform;
    const purchaseMode = body.purchaseMode;
    const versionValue = normalizeSegment(String(body.versionValue || ""));

    if (!fileName) {
      return NextResponse.json(
        { error: "업로드할 파일 이름이 필요해요." },
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

    const safeFileName = sanitizeFileName(fileName);
    const versionSegment = purchaseMode === "single" ? versionValue : "set";
    const storagePath = [
      themeId,
      platform,
      purchaseMode,
      versionSegment,
      `${Date.now()}-${safeFileName}`,
    ].join("/");

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.storage
      .from(DOWNLOAD_BUCKET)
      .createSignedUploadUrl(storagePath);

    if (error || !data?.token) {
      return NextResponse.json(
        { error: "업로드 URL 발급에 실패했어요." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "업로드 URL 발급이 완료되었어요.",
        fileName,
        storageBucket: DOWNLOAD_BUCKET,
        storagePath,
        uploadToken: data.token,
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
