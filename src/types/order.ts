export type OrderStatus = "completed";

export type OrderItem = {
  id: string;
  userId: string;
  themeId: string;
  themeTitle: string;
  themeThumbnail: string;
  price: number;
  purchasedAt: string;
  status: OrderStatus;
  downloadable: boolean;
};
