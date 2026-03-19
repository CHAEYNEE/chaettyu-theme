export type UserRole = "user" | "admin";
export type UserStatus = "active" | "inactive";

export type UserItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
  purchaseCount: number;
  status: UserStatus;
};

export type UserLikeState = {
  userId: string;
  likedThemeIds: string[];
};
