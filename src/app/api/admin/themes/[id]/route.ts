import { NextResponse } from "next/server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  PurchaseMode,
  ThemePlatform,
  ThemeType,
  ThemeVersion,
} from "@/types/theme";

type ThemeDownloadFilePayload = {
  platform: ThemePlatform;
  purchaseMode: PurchaseMode;
  versionValue?: string;
  fileName: string;
  storageBucket: string;
  storagePath: string;
};

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
  versions?: ThemeVersion[];
  downloadFiles?: ThemeDownloadFilePayload[];
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

function isValidVersionArray(value: unknown): value is ThemeVersion[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.label === "string" &&
        typeof item.value === "string",
    )
  );
}

function isValidDownloadFileArray(
  value: unknown,
): value is ThemeDownloadFilePayload[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        (item.platform === "ios" || item.platform === "android") &&
        (item.purchaseMode === "single" || item.purchaseMode === "set") &&
        typeof item.fileName === "string" &&
        typeof item.storageBucket === "string" &&
        typeof item.storagePath === "string" &&
        (item.versionValue === undefined ||
          typeof item.versionValue === "string"),
    )
  );
}

function hasDuplicateVersionValues(versions: ThemeVersion[]) {
  const values = versions.map((version) => version.value).filter(Boolean);

  return new Set(values).size !== values.length;
}

function hasDuplicateDownloadFileKeys(
  downloadFiles: ThemeDownloadFilePayload[],
) {
  const keys = downloadFiles.map((downloadFile) =>
    downloadFile.purchaseMode === "single"
      ? `${downloadFile.platform}:${downloadFile.purchaseMode}:${downloadFile.versionValue ?? ""}`
      : `${downloadFile.platform}:${downloadFile.purchaseMode}`,
  );

  return new Set(keys).size !== keys.length;
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
    typeof payload.detailHtml !== "string" ||
    (payload.versions !== undefined &&
      !isValidVersionArray(payload.versions)) ||
    (payload.downloadFiles !== undefined &&
      !isValidDownloadFileArray(payload.downloadFiles))
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
    const versions = (payload.versions ?? [])
      .map((version) => ({
        label: version.label.trim(),
        value: version.value.trim(),
      }))
      .filter((version) => version.label || version.value);
    const downloadFiles = (payload.downloadFiles ?? [])
      .map((downloadFile) => ({
        platform: downloadFile.platform,
        purchaseMode: downloadFile.purchaseMode,
        versionValue:
          downloadFile.purchaseMode === "single"
            ? downloadFile.versionValue?.trim()
            : undefined,
        fileName: downloadFile.fileName.trim(),
        storageBucket: downloadFile.storageBucket.trim(),
        storagePath: downloadFile.storagePath.trim(),
      }))
      .filter(
        (downloadFile) =>
          downloadFile.fileName ||
          downloadFile.storageBucket ||
          downloadFile.storagePath ||
          downloadFile.versionValue,
      );

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

    if (
      versions.some((version) => !version.label.trim() || !version.value.trim())
    ) {
      return NextResponse.json(
        { error: "버전명과 버전 값은 함께 입력해 주세요." },
        { status: 400 },
      );
    }

    if (hasDuplicateVersionValues(versions)) {
      return NextResponse.json(
        { error: "버전 값은 중복될 수 없어요." },
        { status: 400 },
      );
    }

    if (
      downloadFiles.some(
        (downloadFile) =>
          !downloadFile.fileName ||
          !downloadFile.storageBucket ||
          !downloadFile.storagePath,
      )
    ) {
      return NextResponse.json(
        { error: "다운로드 파일 업로드를 완료해 주세요." },
        { status: 400 },
      );
    }

    if (
      downloadFiles.some(
        (downloadFile) =>
          downloadFile.purchaseMode === "single" && !downloadFile.versionValue,
      )
    ) {
      return NextResponse.json(
        { error: "개별 다운로드 파일은 버전 연결이 필요해요." },
        { status: 400 },
      );
    }

    const versionValueSet = new Set(versions.map((version) => version.value));

    if (
      downloadFiles.some(
        (downloadFile) =>
          downloadFile.purchaseMode === "single" &&
          downloadFile.versionValue &&
          !versionValueSet.has(downloadFile.versionValue),
      )
    ) {
      return NextResponse.json(
        { error: "등록된 버전 값만 다운로드 파일에 연결할 수 있어요." },
        { status: 400 },
      );
    }

    if (hasDuplicateDownloadFileKeys(downloadFiles)) {
      return NextResponse.json(
        { error: "같은 플랫폼/구매 방식 조합의 다운로드 파일이 중복되었어요." },
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

    const { error: deleteVersionsError } = await supabase
      .from("theme_versions")
      .delete()
      .eq("theme_id", normalizedRouteId);

    if (deleteVersionsError) {
      return NextResponse.json(
        { error: "기존 버전 정보 정리에 실패했어요." },
        { status: 500 },
      );
    }

    if (versions.length > 0) {
      const { error: insertVersionsError } = await supabase
        .from("theme_versions")
        .insert(
          versions.map((version, index) => ({
            theme_id: normalizedRouteId,
            label: version.label,
            value: version.value,
            sort_order: index,
          })),
        );

      if (insertVersionsError) {
        return NextResponse.json(
          { error: "새 버전 정보 저장에 실패했어요." },
          { status: 500 },
        );
      }
    }

    const { error: deleteDownloadFilesError } = await supabase
      .from("theme_download_files")
      .delete()
      .eq("theme_id", normalizedRouteId);

    if (deleteDownloadFilesError) {
      return NextResponse.json(
        { error: "기존 다운로드 파일 정보 정리에 실패했어요." },
        { status: 500 },
      );
    }

    if (downloadFiles.length > 0) {
      const { error: insertDownloadFilesError } = await supabase
        .from("theme_download_files")
        .insert(
          downloadFiles.map((downloadFile) => ({
            theme_id: normalizedRouteId,
            platform: downloadFile.platform,
            purchase_mode: downloadFile.purchaseMode,
            version_value:
              downloadFile.purchaseMode === "single"
                ? (downloadFile.versionValue ?? null)
                : null,
            file_name: downloadFile.fileName,
            storage_bucket: downloadFile.storageBucket,
            storage_path: downloadFile.storagePath,
          })),
        );

      if (insertDownloadFilesError) {
        return NextResponse.json(
          { error: "새 다운로드 파일 정보 저장에 실패했어요." },
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
