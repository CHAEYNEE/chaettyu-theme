import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

type PublishThemeRequest = {
  isPublished: boolean;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parsePayload(body: unknown): PublishThemeRequest | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const payload = body as Partial<PublishThemeRequest>;

  if (typeof payload.isPublished !== "boolean") {
    return null;
  }

  return {
    isPublished: payload.isPublished,
  };
}

export async function PATCH(request: Request, { params }: RouteContext) {
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

    const body = await request.json();
    const payload = parsePayload(body);

    if (!payload) {
      return NextResponse.json(
        { error: "요청 형식이 올바르지 않아요." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    const { data: theme, error: themeError } = await supabase
      .from("themes")
      .select("id")
      .eq("id", id)
      .maybeSingle();

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

    const { error: updateError } = await supabase
      .from("themes")
      .update({
        is_published: payload.isPublished,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: "발행 상태 변경에 실패했어요." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: payload.isPublished
          ? "테마를 공개했어요."
          : "테마를 비공개로 전환했어요.",
        themeId: id,
        isPublished: payload.isPublished,
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
