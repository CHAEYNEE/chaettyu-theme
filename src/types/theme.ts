export type ThemeType = "free" | "signature";
export type ThemePlatform = "ios" | "android";
export type PurchaseMode = "single" | "set";

export type ThemeVersion = {
  label: string;
  value: string;
};

export type ThemeItem = {
  id: string;
  title: string;
  type: ThemeType;
  price: number;
  setPrice?: number;
  setBonusCount?: number;
  thumbnail: string;
  previewImages: string[];
  description: string;
  tags: string[];
  isPublished: boolean;
  downloadFileName: string;
  createdAt: string;
  platforms: ThemePlatform[];
  versions?: ThemeVersion[];
  detailHtml: string;
  badge?: string;
  downloads?: number;
  likes: number;
};
