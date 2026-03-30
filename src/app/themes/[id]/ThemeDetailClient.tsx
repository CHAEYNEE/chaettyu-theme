"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/common/Toast/ToastProvider";
import ThemePurchaseBox from "@/components/theme/ThemePurchaseBox/ThemePurchaseBox";
import useAuthUser from "@/hooks/useAuthUser";
import {
  createThemePurchase,
  fetchThemeHistoryStatus,
} from "@/lib/api/themeHistory";
import {
  getNewPurchaseItems,
  hasDownloadedAllSelectedItems,
  hasPurchasedAllSelectedItems,
  mergeUniqueLineItems,
} from "@/lib/theme/themeOwnership";
import { buildThemeDownloadUrl } from "@/lib/theme/buildThemeDownloadUrl";
import type { ThemeItem } from "@/types/theme";
import type {
  ThemeHistoryStatus,
  ThemePurchaseLineItem,
} from "@/types/themeHistory";

type ThemeDetailClientProps = {
  theme: ThemeItem;
};

type DownloadTarget = {
  fileName?: string;
  fileUrl: string;
};

const EMPTY_STATUS: ThemeHistoryStatus = {
  purchasedItems: [],
  downloadedItems: [],
  purchasedItemKeys: [],
  downloadedItemKeys: [],
};

function getDownloadTargets(
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

function startDownloads(files: DownloadTarget[]) {
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

export default function ThemeDetailClient({ theme }: ThemeDetailClientProps) {
  const router = useRouter();
  const { user } = useAuthUser();
  const { showToast } = useToast();

  const [status, setStatus] = useState<ThemeHistoryStatus>(EMPTY_STATUS);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setStatus(EMPTY_STATUS);
      return;
    }

    let isMounted = true;

    const loadStatus = async () => {
      try {
        setIsStatusLoading(true);
        const nextStatus = await fetchThemeHistoryStatus(theme.id);

        if (!isMounted) {
          return;
        }

        setStatus(nextStatus);
      } catch (error) {
        console.error(error);

        if (!isMounted) {
          return;
        }

        showToast("보유 내역을 불러오지 못했어요.", {
          type: "error",
        });
      } finally {
        if (isMounted) {
          setIsStatusLoading(false);
        }
      }
    };

    void loadStatus();

    return () => {
      isMounted = false;
    };
  }, [theme.id, user, showToast]);

  const purchasedItemKeys = useMemo(
    () => status.purchasedItemKeys,
    [status.purchasedItemKeys],
  );

  const downloadedItemKeys = useMemo(
    () => status.downloadedItemKeys,
    [status.downloadedItemKeys],
  );

  const handleDownload = async (items: ThemePurchaseLineItem[]) => {
    const files = getDownloadTargets(theme, items);

    if (files.length === 0) {
      showToast("다운로드할 파일이 아직 연결되지 않았어요!", {
        type: "error",
      });
      return false;
    }

    const isRedownload = user
      ? hasDownloadedAllSelectedItems(status.downloadedItems, items)
      : false;

    startDownloads(files);

    if (user) {
      const mergedDownloadedItems = mergeUniqueLineItems(
        status.downloadedItems,
        items,
      );

      setStatus((prev) => ({
        ...prev,
        downloadedItems: mergedDownloadedItems,
        downloadedItemKeys: mergedDownloadedItems.map((item) => item.key),
      }));
    }

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

  const handlePrimaryAction = async (items: ThemePurchaseLineItem[]) => {
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

    const alreadyOwned = hasPurchasedAllSelectedItems(
      status.purchasedItems,
      items,
    );

    if (alreadyOwned) {
      return handleDownload(items);
    }

    const purchasableItems = getNewPurchaseItems(status.purchasedItems, items);
    const hasMixedSelection = purchasableItems.length !== items.length;

    try {
      await createThemePurchase({
        themeId: theme.id,
        items: purchasableItems,
      });

      const mergedPurchasedItems = mergeUniqueLineItems(
        status.purchasedItems,
        purchasableItems,
      );

      setStatus((prev) => ({
        ...prev,
        purchasedItems: mergedPurchasedItems,
        purchasedItemKeys: mergedPurchasedItems.map((item) => item.key),
      }));

      showToast(
        hasMixedSelection
          ? "이미 가진 구성을 제외한 새 구성만 구매했어요!"
          : "구매가 완료되었어요!",
        {
          type: "success",
        },
      );

      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "구매 처리 중 오류가 발생했어요.";

      showToast(message, {
        type: "error",
      });

      return false;
    }
  };

  return (
    <ThemePurchaseBox
      theme={theme}
      onPrimaryAction={handlePrimaryAction}
      purchasedItemKeys={purchasedItemKeys}
      downloadedItemKeys={downloadedItemKeys}
      isDisabled={isStatusLoading}
    />
  );
}
