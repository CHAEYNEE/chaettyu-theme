export type ThemeType = "free" | "signature";
export type ThemePlatform = "ios" | "android";

export type ThemeItem = {
  id: string;
  title: string;
  type: ThemeType;
  price: number;
  thumbnail: string;
  previewImages: string[];
  description: string;
  tags: string[];
  isPublished: boolean;
  downloadFileName: string;
  createdAt: string;
  platforms: ThemePlatform[];
  badge?: string;
  downloads?: number;
  likes: number;
};
