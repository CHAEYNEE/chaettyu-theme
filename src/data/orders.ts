import type { OrderItem } from "@/types/order";

export const orders: OrderItem[] = [
  {
    id: "order-1",
    userId: "user-1",
    themeId: "milk-heart",
    themeTitle: "밀크 하트",
    themeThumbnail: "/images/themes/milk-heart/thumb.png",
    price: 2500,
    purchasedAt: "2026-03-19",
    status: "completed",
    downloadable: true,
  },
  {
    id: "order-2",
    userId: "user-1",
    themeId: "cherry-note",
    themeTitle: "체리 노트",
    themeThumbnail: "/images/themes/cherry-note/thumb.png",
    price: 3200,
    purchasedAt: "2026-03-19",
    status: "completed",
    downloadable: true,
  },
];
