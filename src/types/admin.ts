import type { OrderItem } from "./order";
import type { ThemeItem } from "./theme";

export type AdminSummary = {
  totalUsers: number;
  totalThemes: number;
  freeThemes: number;
  signatureThemes: number;
  totalOrders: number;
  recentThemes: ThemeItem[];
  recentOrders: OrderItem[];
};
