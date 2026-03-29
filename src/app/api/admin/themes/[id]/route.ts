import { NextResponse } from "next/server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { ThemePlatform, ThemeType } from "@/types/theme";

type UpdateThemeRequest = {
  id: string;
  title: string;
  type: ThemeType;
  price: number;
  setPrice?: number;
  setBonusCount?: number;
  thumbnail: string;
  previewImages: string[];
  tags: string[];
  isPublished: boolean;
  downloadFileName?: string;
  platforms: ThemePlatform[];
  detailHtml: string;
  badge?: string;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function normalizeId(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValidThemeType(value: unknown): value is ThemeType {
  return value === "free" || value === "signature";
}

function isValidPlatformArray(value: unknown): value is ThemePlatform[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item === "ios" || item === "android")
  );
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function parsePayload(body: unknown): UpdateThemeRequest | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const payload = body as Partial<UpdateThemeRequest>;

  if (
    typeof payload.id !== "string" ||
    typeof payload.title !== "string" ||
    !isValidThemeType(payload.type) ||
    typeof payload.price !== "number" ||
    typeof payload.thumbnail !== "string" ||
    !isStringArray(payload.previewImages) ||
    !isStringArray(payload.tags) ||
    typeof payload.isPublished !== "boolean" ||
    !isValidPlatformArray(payload.platforms) ||
    typeof payload.detailHtml !== "string"
  ) {
    return null;
  }

  return payload as UpdateThemeRequest;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id: routeId } = await context.params;
    const normalizedRouteId = normalizeId(routeId);

    const body = await request.json();
    const payload = parsePayload(body);

    if (!payload) {
      return NextResponse.json(
        { error: "요청 형식이 올바르지 않아요." },
        { status: 400 },
      );
    }

    const normalizedId = normalizeId(payload.id);
    const trimmedTitle = payload.title.trim();
    const trimmedThumbnail = payload.thumbnail.trim();
    const previewImages = payload.previewImages
      .map((item) => item.trim())
      .filter(Boolean);
    const tags = payload.tags.map((item) => item.trim()).filter(Boolean);
    const detailHtml = payload.detailHtml.trim();

    if (!normalizedId) {
      return NextResponse.json(
        { error: "테마 ID를 확인해 주세요." },
        { status: 400 },
      );
    }

    if (normalizedId !== normalizedRouteId) {
      return NextResponse.json(
        { error: "수정 대상 테마 ID가 일치하지 않아요." },
        { status: 400 },
      );
    }

    if (!trimmedTitle) {
      return NextResponse.json(
        { error: "테마명을 입력해 주세요." },
        { status: 400 },
      );
    }

    if (!trimmedThumbnail) {
      return NextResponse.json(
        { error: "썸네일을 업로드해 주세요." },
        { status: 400 },
      );
    }

    if (payload.platforms.length === 0) {
      return NextResponse.json(
        { error: "최소 1개의 플랫폼을 선택해 주세요." },
        { status: 400 },
      );
    }

    if (payload.type === "signature" && payload.price <= 0) {
      return NextResponse.json(
        { error: "유료 테마는 가격을 입력해 주세요." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    const { data: existingTheme, error: existingThemeError } = await supabase
      .from("themes")
      .select("id")
      .eq("id", normalizedRouteId)
      .maybeSingle();

    if (existingThemeError) {
      return NextResponse.json(
        { error: "기존 테마 정보를 확인하지 못했어요." },
        { status: 500 },
      );
    }

    if (!existingTheme) {
      return NextResponse.json(
        { error: "수정할 테마를 찾지 못했어요." },
        { status: 404 },
      );
    }

    const { error: updateThemeError } = await supabase
      .from("themes")
      .update({
        title: trimmedTitle,
        type: payload.type,
        price: payload.type === "free" ? 0 : payload.price,
        set_price:
          payload.type === "signature" && payload.setPrice
            ? payload.setPrice
            : null,
        set_bonus_count:
          payload.type === "signature" && payload.setBonusCount
            ? payload.setBonusCount
            : 0,
        thumbnail_url: trimmedThumbnail,
        tags,
        is_published: payload.isPublished,
        download_file_name: payload.downloadFileName ?? null,
        platforms: payload.platforms,
        detail_html: detailHtml,
        detail_json: null,
        badge: payload.badge?.trim() || null,
      })
      .eq("id", normalizedRouteId);

    if (updateThemeError) {
      return NextResponse.json(
        { error: "테마 기본 정보 수정에 실패했어요." },
        { status: 500 },
      );
    }

    const { error: deletePreviewError } = await supabase
      .from("theme_preview_images")
      .delete()
      .eq("theme_id", normalizedRouteId);

    if (deletePreviewError) {
      return NextResponse.json(
        { error: "기존 미리보기 이미지 정리에 실패했어요." },
        { status: 500 },
      );
    }

    if (previewImages.length > 0) {
      const { error: insertPreviewError } = await supabase
        .from("theme_preview_images")
        .insert(
          previewImages.map((imageUrl, index) => ({
            theme_id: normalizedRouteId,
            image_url: imageUrl,
            sort_order: index,
          })),
        );

      if (insertPreviewError) {
        return NextResponse.json(
          { error: "새 미리보기 이미지 저장에 실패했어요." },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      {
        message: "테마가 수정되었어요.",
        themeId: normalizedRouteId,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "알 수 없는 오류가 발생했어요." },
      { status: 500 },
    );
  }
}
