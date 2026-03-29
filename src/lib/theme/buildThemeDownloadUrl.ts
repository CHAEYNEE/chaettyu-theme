import type { PurchaseMode, ThemePlatform } from "@/types/theme";

type BuildThemeDownloadUrlParams = {
  themeId: string;
  platform: ThemePlatform;
  purchaseMode: PurchaseMode;
  versionValue?: string;
};

export function buildThemeDownloadUrl({
  themeId,
  platform,
  purchaseMode,
  versionValue,
}: BuildThemeDownloadUrlParams) {
  const params = new URLSearchParams({
    platform,
    purchaseMode,
  });

  if (purchaseMode === "single" && versionValue) {
    params.set("versionValue", versionValue);
  }

  return `/api/themes/${themeId}/download?${params.toString()}`;
}
