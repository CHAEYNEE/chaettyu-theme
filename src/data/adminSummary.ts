import type { AdminSummary } from "@/types/admin";
import { orders } from "./orders";
import { themes } from "./themes";

export const adminSummary: AdminSummary = {
  totalUsers: 2,
  totalThemes: themes.length,
  freeThemes: themes.filter((theme) => theme.type === "free").length,
  signatureThemes: themes.filter((theme) => theme.type === "signature").length,
  totalOrders: orders.length,
  recentThemes: themes.slice(0, 2),
  recentOrders: orders.slice(0, 2),
};
