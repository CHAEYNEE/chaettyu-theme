"use client";

import { getMockUser as getStoredAuthUser } from "./mockAuthStorage";
import type { AuthSession, AuthUser } from "./auth.types";

function normalizeAuthUser(): AuthUser | null {
  const storedUser = getStoredAuthUser();

  if (!storedUser) {
    return null;
  }

  return {
    id: storedUser.id,
    email: storedUser.email,
    nickname: storedUser.nickname,
    role: storedUser.role ?? "user",
  };
}

export function getClientSession(): AuthSession {
  const user = normalizeAuthUser();

  return {
    user,
    isLoggedIn: Boolean(user),
  };
}
