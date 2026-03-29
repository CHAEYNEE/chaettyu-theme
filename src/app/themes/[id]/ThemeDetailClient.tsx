"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/common/Toast/ToastProvider";
import ThemePurchaseBox from "@/components/theme/ThemePurchaseBox/ThemePurchaseBox";
import useMockUser from "@/hooks/useMockUser";
import {
  addThemeDownload,
  addThemePurchase,
  getNewPurchaseItems,
  getUserDownloadedLineItems,
  getUserPurchasedLineItems,
  hasDownloadedAllSelectedItems,
  hasPurchasedAllSelectedItems,
} from "@/lib/storage/themeStorage";
import type { ThemeItem } from "@/types/theme";
import type { ThemePurchaseLineItem } from "@/types/themeHistory";

type ThemeDetailClientProps = {
  theme: ThemeItem;
};

type DownloadTarget = {
  fileName: string;
  fileUrl: string;
};

function getDownloadTargets(
  theme: ThemeItem,
  items: ThemePurchaseLineItem[],
): DownloadTarget[] {
  const downloadFiles = theme.downloadFiles;

  if (!downloadFiles || downloadFiles.length === 0) {
    return [];
  }

  const fileMap = new Map<string, DownloadTarget>();

  items.forEach((item) => {
    if (item.purchaseMode === "set") {
      const matchedSetFile = downloadFiles.find(
        (file) =>
          file.platform === item.platform && file.purchaseMode === "set",
      );

      if (matchedSetFile) {
        fileMap.set(`${matchedSetFile.platform}-set`, {
          fileName: matchedSetFile.fileName,
          fileUrl: matchedSetFile.fileUrl,
        });
      }

      return;
    }

    const matchedSingleFile = downloadFiles.find(
      (file) =>
        file.platform === item.platform &&
        file.purchaseMode === "single" &&
        file.versionValue === item.versionValue,
    );

    if (matchedSingleFile) {
      fileMap.set(
        `${matchedSingleFile.platform}-${matchedSingleFile.versionValue}`,
        {
          fileName: matchedSingleFile.fileName,
          fileUrl: matchedSingleFile.fileUrl,
        },
      );
    }
  });

  return Array.from(fileMap.values());
}

function startDownloads(files: DownloadTarget[]) {
  files.forEach((file, index) => {
    window.setTimeout(() => {
      const link = document.createElement("a");
      link.href = file.fileUrl;
      link.download = file.fileName;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, index * 120);
  });
}

export default function ThemeDetailClient({ theme }: ThemeDetailClientProps) {
  const router = useRouter();
  const { user } = useMockUser();
  const { showToast } = useToast();

  const purchasedItemKeys = useMemo(() => {
    if (!user) {
      return [];
    }

    return getUserPurchasedLineItems(user.id, theme.id).map((item) => item.key);
  }, [theme.id, user]);

  const downloadedItemKeys = useMemo(() => {
    if (!user) {
      return [];
    }

    return getUserDownloadedLineItems(user.id, theme.id).map(
      (item) => item.key,
    );
  }, [theme.id, user]);

  const handleDownload = (items: ThemePurchaseLineItem[]) => {
    const files = getDownloadTargets(theme, items);

    if (files.length === 0) {
      showToast("다운로드할 파일이 아직 연결되지 않았어요!", {
        type: "error",
      });
      return false;
    }

    startDownloads(files);

    if (!user) {
      showToast("다운로드가 시작되었어요!", {
        type: "success",
      });
      return true;
    }

    const isRedownload = hasDownloadedAllSelectedItems(
      user.id,
      theme.id,
      items,
    );

    addThemeDownload({
      userId: user.id,
      theme,
      items,
    });

    showToast(
      isRedownload
        ? "이미 받은 구성이에요. 다시 다운로드를 시작했어요!"
        : "다운로드를 시작했어요!",
      {
        type: "success",
      },
    );

    return true;
  };

  const handlePrimaryAction = (items: ThemePurchaseLineItem[]) => {
    if (items.length === 0) {
      showToast("구성을 먼저 선택해 주세요!", {
        type: "error",
      });
      return false;
    }

    if (theme.type === "free") {
      return handleDownload(items);
    }

    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/themes/${theme.id}`)}`,
      );
      return false;
    }

    const alreadyOwned = hasPurchasedAllSelectedItems(user.id, theme.id, items);

    if (alreadyOwned) {
      return handleDownload(items);
    }

    const purchasableItems = getNewPurchaseItems(user.id, theme.id, items);
    const hasMixedSelection = purchasableItems.length !== items.length;

    const purchaseResult = addThemePurchase({
      userId: user.id,
      theme,
      items: purchasableItems,
    });

    if (!purchaseResult) {
      showToast(
        "선택한 구성은 이미 보유 중이에요. 다운로드로 다시 받을 수 있어요.",
        {
          type: "info",
        },
      );
      return false;
    }

    showToast(
      hasMixedSelection
        ? "이미 가진 구성을 제외한 새 구성만 구매했어요!"
        : "구매가 완료되었어요!",
      {
        type: "success",
      },
    );

    return true;
  };

  return (
    <ThemePurchaseBox
      theme={theme}
      onPrimaryAction={handlePrimaryAction}
      purchasedItemKeys={purchasedItemKeys}
      downloadedItemKeys={downloadedItemKeys}
    />
  );
}
