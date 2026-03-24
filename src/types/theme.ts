export type ThemeType = "free" | "signature";
export type ThemePlatform = "ios" | "android";
export type PurchaseMode = "single" | "set";

export type ThemeVersion = {
  label: string;
  value: string;
};

export type ThemeReview = {
  id: string;
  author: string;
  rating: number;
  content: string;
  createdAt: string;
  images?: string[];
};

export type ThemeQna = {
  id: string;
  author: string;
  question: string;
  answer?: string;
  createdAt: string;
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
  tags: string[];
  isPublished: boolean;
  downloadFileName: string;
  createdAt: string;
  platforms: ThemePlatform[];
  versions?: ThemeVersion[];
  detailHtml: string;
  reviews?: ThemeReview[];
  qnas?: ThemeQna[];
  badge?: string;
  downloads?: number;
  likes: number;
};
