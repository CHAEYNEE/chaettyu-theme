import type { UserItem, UserLikeState } from "@/types/user";

export const users: UserItem[] = [
  {
    id: "user-1",
    name: "채여니",
    email: "user@example.com",
    role: "user",
    joinedAt: "2026-03-19",
    purchaseCount: 2,
    status: "active",
  },
  {
    id: "admin-1",
    name: "관리자",
    email: "admin@example.com",
    role: "admin",
    joinedAt: "2026-03-19",
    purchaseCount: 0,
    status: "active",
  },
];

export const userLikeState: UserLikeState = {
  userId: "user-1",
  likedThemeIds: ["strawberry-ribbon", "milk-heart"],
};
