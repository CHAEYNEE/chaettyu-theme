import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET_NAME = "theme-detail-images";
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");
  const baseName =
    lastDotIndex >= 0 ? fileName.slice(0, lastDotIndex) : fileName;
  const extension = lastDotIndex >= 0 ? fileName.slice(lastDotIndex) : "";

  const safeBaseName = baseName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${safeBaseName || "image"}${extension.toLowerCase()}`;
}

function normalizeThemeId(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  try {
    const adminGuard = await requireAdminApi();

    if (!adminGuard.ok) {
      return adminGuard.response;
    }

    const supabaseAdmin = createSupabaseAdmin();

    const formData = await request.formData();
    const file = formData.get("file");
    const rawThemeId = formData.get("themeId");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "업로드할 이미지 파일이 없어요." },
        { status: 400 },
      );
    }

    if (typeof rawThemeId !== "string" || !rawThemeId.trim()) {
      return NextResponse.json(
        { error: "테마 ID가 필요해요." },
        { status: 400 },
      );
    }

    const themeId = normalizeThemeId(rawThemeId);

    if (!themeId) {
      return NextResponse.json(
        { error: "유효한 테마 ID를 입력해 주세요." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "PNG, JPG, WEBP, GIF 이미지만 업로드할 수 있어요." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "이미지는 5MB 이하만 업로드할 수 있어요." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeFileName = sanitizeFileName(file.name);
    const storagePath = `themes/${themeId}/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message || "상세 이미지 업로드에 실패했어요." },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

    return NextResponse.json({
      publicUrl,
      storageBucket: BUCKET_NAME,
      storagePath,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "상세 이미지 업로드 중 문제가 생겼어요.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
