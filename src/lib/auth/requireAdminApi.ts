import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminApiProfile = {
  id: string;
  email: string;
  login_id: string;
  nickname: string;
  role: "user" | "admin";
  profile_image: string | null;
};

type RequireAdminApiResult =
  | {
      ok: true;
      profile: AdminApiProfile;
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function requireAdminApi(): Promise<RequireAdminApiResult> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "관리자 로그인이 필요해요." },
        { status: 401 },
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, login_id, nickname, role, profile_image")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "관리자 정보를 확인할 수 없어요." },
        { status: 403 },
      ),
    };
  }

  if (profile.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "관리자만 접근할 수 있어요." },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true,
    profile: profile as AdminApiProfile,
  };
}
