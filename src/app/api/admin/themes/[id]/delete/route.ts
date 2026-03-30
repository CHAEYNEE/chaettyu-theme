import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { cleanupThemeDetailImages } from "@/lib/theme/cleanupThemeDetailImages";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ThemeRow = {
  id: string;
  detail_html: string | null;
};

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const adminGuard = await requireAdminApi();

    if (!adminGuard.ok) {
      return adminGuard.response;
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "테마 ID가 필요해요." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    const { data: theme, error: themeError } = await supabase
      .from("themes")
      .select("id, detail_html")
      .eq("id", id)
      .maybeSingle<ThemeRow>();

    if (themeError) {
      return NextResponse.json(
        { error: "테마 정보를 확인하지 못했어요." },
        { status: 500 },
      );
    }

    if (!theme) {
      return NextResponse.json(
        { error: "테마를 찾을 수 없어요." },
        { status: 404 },
      );
    }

    const { error: downloadFilesDeleteError } = await supabase
      .from("theme_download_files")
      .delete()
      .eq("theme_id", id);

    if (downloadFilesDeleteError) {
      return NextResponse.json(
        { error: "다운로드 파일 정보 삭제에 실패했어요." },
        { status: 500 },
      );
    }

    const { error: versionsDeleteError } = await supabase
      .from("theme_versions")
      .delete()
      .eq("theme_id", id);

    if (versionsDeleteError) {
      return NextResponse.json(
        { error: "버전 정보 삭제에 실패했어요." },
        { status: 500 },
      );
    }

    const { error: previewImagesDeleteError } = await supabase
      .from("theme_preview_images")
      .delete()
      .eq("theme_id", id);

    if (previewImagesDeleteError) {
      return NextResponse.json(
        { error: "미리보기 이미지 정보 삭제에 실패했어요." },
        { status: 500 },
      );
    }

    const { error: themeDeleteError } = await supabase
      .from("themes")
      .delete()
      .eq("id", id);

    if (themeDeleteError) {
      return NextResponse.json(
        { error: "테마 삭제에 실패했어요." },
        { status: 500 },
      );
    }

    try {
      await cleanupThemeDetailImages({
        themeId: id,
        detailHtml: "",
      });
    } catch (error) {
      console.error("Failed to cleanup detail images after delete:", error);
    }

    return NextResponse.json(
      {
        message: "테마를 삭제했어요.",
        themeId: id,
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
