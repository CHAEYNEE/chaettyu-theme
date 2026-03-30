import { buildThemeDownloadUrl } from "@/lib/theme/buildThemeDownloadUrl";
import type { ThemeItem } from "@/types/theme";
import type { ThemePurchaseLineItem } from "@/types/themeHistory";

export type DownloadTarget = {
  fileName?: string;
  fileUrl: string;
};

export function getDownloadTargets(
  theme: ThemeItem,
  items: ThemePurchaseLineItem[],
): DownloadTarget[] {
  return items.map((item) => {
    const fileUrl = buildThemeDownloadUrl({
      themeId: theme.id,
      platform: item.platform,
      purchaseMode: item.purchaseMode,
      versionValue: item.versionValue,
    });

    const matchedFileName =
      item.purchaseMode === "set"
        ? theme.downloadFiles?.find(
            (file) =>
              file.platform === item.platform && file.purchaseMode === "set",
          )?.fileName
        : theme.downloadFiles?.find(
            (file) =>
              file.platform === item.platform &&
              file.purchaseMode === "single" &&
              file.versionValue === item.versionValue,
          )?.fileName;

    const fallbackFileName =
      item.purchaseMode === "set"
        ? `${theme.id}-${item.platform}-set`
        : `${theme.id}-${item.platform}-${item.versionValue ?? "default"}`;

    return {
      fileUrl,
      fileName: matchedFileName ?? fallbackFileName,
    };
  });
}

export function startDownloads(files: DownloadTarget[]) {
  files.forEach((file, index) => {
    window.setTimeout(() => {
      const link = document.createElement("a");
      link.href = file.fileUrl;
      link.rel = "noopener";

      if (file.fileName) {
        link.download = file.fileName;
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, index * 120);
  });
}
