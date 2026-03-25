export type MockUser = {
  id: string;
  loginId: string;
  email: string;
  nickname: string;
  provider: "mock";
  createdAt: string;
  profileImage?: string;
};
