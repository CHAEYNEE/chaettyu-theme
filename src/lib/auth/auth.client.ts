"use client";

import { getMockUser } from "./mockAuthStorage";
import type { AuthSession, AuthUser } from "./auth.types";

function normalizeAuthUser(): AuthUser | null {
  const mockUser = getMockUser();

  if (!mockUser) {
    return null;
  }

  return {
    id: mockUser.id,
    email: mockUser.email,
    nickname: mockUser.nickname,
    role: mockUser.role ?? "user",
  };
}

export function getClientSession(): AuthSession {
  const user = normalizeAuthUser();

  return {
    user,
    isLoggedIn: !!user,
  };
}
