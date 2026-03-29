import type { PurchaseMode, ThemePlatform, ThemeType } from "@/types/theme";

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
  themeType: ThemeType;
  themeTitle: string;
  themeThumbnail: string;
  downloadFileName?: string;
  downloadFileNames?: string[];
  purchasedAt: string;
  totalPrice: number;
  items: ThemePurchaseLineItem[];
};

export type ThemeDownloadRecord = {
  id: string;
  userId: string;
  themeId: string;
  themeType: ThemeType;
  themeTitle: string;
  themeThumbnail: string;
  downloadFileName?: string;
  downloadFileNames?: string[];
  downloadedAt: string;
  items: ThemePurchaseLineItem[];
};
