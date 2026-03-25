import type { PurchaseMode, ThemePlatform } from "@/types/theme";

export type ThemePurchaseLineItem = {
  key: string;
  platform: ThemePlatform;
  purchaseMode: PurchaseMode;
  title: string;
  subtitle?: string;
  price: number;
  versionValue?: string;
};

export type ThemePurchaseRecord = {
  id: string;
  userId: string;
  themeId: string;
  themeTitle: string;
  themeThumbnail: string;
  downloadFileName: string;
  purchasedAt: string;
  totalPrice: number;
  items: ThemePurchaseLineItem[];
};

export type ThemeDownloadRecord = {
  id: string;
  userId: string;
  themeId: string;
  themeTitle: string;
  themeThumbnail: string;
  downloadFileName: string;
  downloadedAt: string;
  items: ThemePurchaseLineItem[];
};
