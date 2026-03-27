export type MockUserRole = "user" | "admin";
export type MockUserProvider = "mock";

export type MockUser = {
  id: string;
  loginId: string;
  email: string;
  nickname: string;
  provider: MockUserProvider;
  createdAt: string;
  profileImage?: string;
  role?: MockUserRole;
};
