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

export type ThemePurchaseHistoryItem = {
  id: string;
  userId: string;
  themeId: string;
  themeType: ThemeType;
  themeTitle: string;
  themeThumbnail: string;
  purchasedAt: string;
  totalPrice: number;
  items: ThemePurchaseLineItem[];
};

export type ThemeDownloadHistoryItem = {
  id: string;
  userId: string;
  themeId: string;
  themeType: ThemeType;
  themeTitle: string;
  themeThumbnail: string;
  downloadedAt: string;
  items: ThemePurchaseLineItem[];
};

export type ThemeHistoryStatus = {
  purchasedItems: ThemePurchaseLineItem[];
  downloadedItems: ThemePurchaseLineItem[];
  purchasedItemKeys: string[];
  downloadedItemKeys: string[];
};

export type CreateThemePurchasePayload = {
  themeId: string;
  items: ThemePurchaseLineItem[];
};

export type CreateThemePurchaseResponse = {
  success: true;
  purchaseId: string;
};

export type ThemeHistoryResponse = {
  purchases: ThemePurchaseHistoryItem[];
  downloads: ThemeDownloadHistoryItem[];
};
