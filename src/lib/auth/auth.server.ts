import type { AuthSession } from "./auth.types";

export async function getServerSession(): Promise<AuthSession> {
  return {
    user: null,
    isLoggedIn: false,
  };
}
