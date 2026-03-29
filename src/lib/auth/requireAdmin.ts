import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminProfile = {
  id: string;
  email: string;
  login_id: string;
  nickname: string;
  role: "user" | "admin";
  profile_image: string | null;
};

type RequireAdminOptions = {
  redirectTo?: string;
};

export async function requireAdmin(
  options?: RequireAdminOptions,
): Promise<AdminProfile> {
  const redirectTo = options?.redirectTo ?? "/admin";

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, login_id, nickname, role, profile_image")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    redirect("/mypage");
  }

  if (profile.role !== "admin") {
    redirect("/mypage");
  }

  return profile as AdminProfile;
}
