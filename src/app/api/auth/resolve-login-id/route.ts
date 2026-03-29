import { NextResponse } from "next/server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";

type ResolveLoginIdRequest = {
  loginId?: string;
};

function normalizeLoginId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_-]/g, "");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ResolveLoginIdRequest;
    const loginId = normalizeLoginId(body.loginId ?? "");

    if (!loginId) {
      return NextResponse.json(
        { error: "아이디를 입력해 주세요." },
        { status: 400 },
      );
    }

    const supabaseAdmin = createSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("login_id", loginId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "로그인 정보를 확인하지 못했어요." },
        { status: 500 },
      );
    }

    if (!data?.email) {
      return NextResponse.json(
        { error: "아이디 또는 비밀번호가 올바르지 않아요." },
        { status: 401 },
      );
    }

    return NextResponse.json({ email: data.email }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "로그인 정보를 처리하는 중 문제가 생겼어요." },
      { status: 500 },
    );
  }
}
