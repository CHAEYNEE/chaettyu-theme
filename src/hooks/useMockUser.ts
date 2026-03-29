"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabaseClient } from "@/lib/supabase/client";
import type { MockUser } from "@/types/mockUser";

function mapUserToMockUser(user: User | null): MockUser | null {
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
    provider: "mock",
    createdAt: user.created_at,
    profileImage:
      typeof user.user_metadata?.profile_image === "string"
        ? user.user_metadata.profile_image
        : "/images/mock_profile.jpg",
    role: user.user_metadata?.role === "admin" ? "admin" : "user",
  };
}

export default function useMockUser() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!isMounted) return;

      setUser(mapUserToMockUser(user));
      setIsLoaded(true);
    };

    syncUser();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(mapUserToMockUser(session?.user ?? null));
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
