"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabaseClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/types/authUser";

type ProfileRow = {
  id: string;
  login_id: string | null;
  email: string | null;
  nickname: string | null;
  role: string | null;
  profile_image: string | null;
  created_at: string | null;
  updated_at: string | null;
};

async function mapUserToAuthUser(user: User | null): Promise<AuthUser | null> {
  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select(
      "id, login_id, email, nickname, role, profile_image, created_at, updated_at",
    )
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (error) {
    console.error("Failed to load profile:", error);
  }

  return {
    id: user.id,
    loginId:
      profile?.login_id ??
      (typeof user.user_metadata?.login_id === "string"
        ? user.user_metadata.login_id
        : ""),
    email: profile?.email ?? user.email ?? "",
    nickname:
      profile?.nickname ??
      (typeof user.user_metadata?.nickname === "string"
        ? user.user_metadata.nickname
        : (user.email?.split("@")[0] ?? "회원")),
    provider: "supabase",
    createdAt: user.created_at,
    profileImage:
      profile?.profile_image ??
      (typeof user.user_metadata?.profile_image === "string"
        ? user.user_metadata.profile_image
        : "/images/mock_profile.jpg"),
    role: profile?.role === "admin" ? "admin" : "user",
  };
}

export default function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncUser = async (authUser: User | null) => {
      const mappedUser = await mapUserToAuthUser(authUser);

      if (!isMounted) {
        return;
      }

      setUser(mappedUser);
      setIsLoaded(true);
    };

    const loadInitialUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      await syncUser(user);
    };

    void loadInitialUser();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      void syncUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoaded,
  };
}
