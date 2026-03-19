export type ThemeType = "free" | "signature";

export type ThemeItem = {
  id: string;
  title: string;
  type: ThemeType;
  price: number;
  thumbnail: string;
  previewImages: string[];
  description: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  downloadFileName: string;
  createdAt: string;
  badge?: string;
  downloads?: number;
  likes: number;
};
