"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabaseClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/types/authUser";

function mapUserToAuthUser(user: User | null): AuthUser | null {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    loginId:
      typeof user.user_metadata?.login_id === "string"
        ? user.user_metadata.login_id
        : "",
    email: user.email ?? "",
    nickname:
      typeof user.user_metadata?.nickname === "string"
        ? user.user_metadata.nickname
        : (user.email?.split("@")[0] ?? "회원"),
    provider: "supabase",
    createdAt: user.created_at,
    profileImage:
      typeof user.user_metadata?.profile_image === "string"
        ? user.user_metadata.profile_image
        : "/images/mock_profile.jpg",
    role: user.user_metadata?.role === "admin" ? "admin" : "user",
  };
}

export default function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!isMounted) {
        return;
      }

      setUser(mapUserToAuthUser(user));
      setIsLoaded(true);
    };

    void syncUser();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(mapUserToAuthUser(session?.user ?? null));
      setIsLoaded(true);
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
