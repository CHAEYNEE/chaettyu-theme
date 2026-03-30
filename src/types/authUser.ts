export type AuthUserRole = "user" | "admin";
export type AuthUserProvider = "supabase";

export type AuthUser = {
  id: string;
  loginId: string;
  email: string;
  nickname: string;
  provider: AuthUserProvider;
  createdAt: string;
  profileImage?: string;
  role?: AuthUserRole;
};
