export type AuthRole = "user" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  nickname: string;
  role: AuthRole;
};

export type AuthSession = {
  user: AuthUser | null;
  isLoggedIn: boolean;
};
