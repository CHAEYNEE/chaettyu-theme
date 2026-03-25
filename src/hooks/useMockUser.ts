"use client";

import { useEffect, useState } from "react";

import type { MockUser } from "@/types/mockUser";
import { getMockUser, MOCK_AUTH_EVENT } from "@/lib/auth/mockAuthStorage";

export default function useMockUser() {
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    const syncUser = () => {
      setUser(getMockUser());
    };

    syncUser();

    window.addEventListener("storage", syncUser);
    window.addEventListener(MOCK_AUTH_EVENT, syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener(MOCK_AUTH_EVENT, syncUser);
    };
  }, []);

  return user;
}
