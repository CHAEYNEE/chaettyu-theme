import type { AuthSession } from "./auth.types";

export function hasUserSession(session: AuthSession | null): boolean {
  return session?.isLoggedIn === true && !!session.user;
}

export function isAdminSession(session: AuthSession | null): boolean {
  return (
    session?.isLoggedIn === true &&
    !!session.user &&
    session.user.role === "admin"
  );
}
