"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/common/Toast/ToastProvider";
import ThemePurchaseBox from "@/components/theme/ThemePurchaseBox/ThemePurchaseBox";
import useAuthUser from "@/hooks/useAuthUser";
import { useCart } from "@/providers/CartProvider";
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
import type { AddCartItemInput } from "@/types/cart";
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

async function resolveDownloadTargets(
  files: DownloadTarget[],
): Promise<DownloadTarget[]> {
  const resolvedFiles = await Promise.all(
    files.map(async (file) => {
      const requestUrl = new URL(file.fileUrl, window.location.origin);
      requestUrl.searchParams.set("responseType", "json");

      const response = await fetch(requestUrl.toString(), {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as {
        downloadUrl?: string;
        fileName?: string;
        error?: string;
      };

      if (!response.ok || !data.downloadUrl) {
        throw new Error(data.error || "다운로드 링크를 준비하지 못했어요.");
      }

      return {
        fileUrl: data.downloadUrl,
        fileName: data.fileName ?? file.fileName,
      };
    }),
  );

  return resolvedFiles;
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

function getVersionLabel(
  theme: ThemeItem,
  item: ThemePurchaseLineItem,
): string | null {
  if (item.purchaseMode !== "single" || !item.versionValue) {
    return null;
  }

  return (
    theme.versions?.find((version) => version.value === item.versionValue)
      ?.label ?? item.versionValue
  );
}

function mapLineItemToCartItem(
  theme: ThemeItem,
  item: ThemePurchaseLineItem,
): AddCartItemInput {
  return {
    themeId: theme.id,
    title: theme.title,
    thumbnail: theme.thumbnail,
    price: item.price,
    platform: item.platform,
    purchaseMode: item.purchaseMode,
    versionValue: item.versionValue ?? null,
    versionLabel: getVersionLabel(theme, item),
  };
}

export default function ThemeDetailClient({ theme }: ThemeDetailClientProps) {
  const router = useRouter();
  const { user } = useAuthUser();
  const { showToast } = useToast();
  const { addItems } = useCart();

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

    try {
      const resolvedFiles = await resolveDownloadTargets(files);

      startDownloads(resolvedFiles);

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

      if (theme.type === "free") {
        router.refresh();
      }

      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "다운로드 중 문제가 생겼어요.";

      showToast(message, {
        type: "error",
      });

      return false;
    }
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

  const handleAddToCart = async (items: ThemePurchaseLineItem[]) => {
    if (items.length === 0) {
      showToast("구성을 먼저 선택해 주세요!", {
        type: "error",
      });
      return false;
    }

    if (theme.type === "free") {
      showToast("무료 테마는 장바구니에 담을 수 없어요.", {
        type: "info",
      });
      return false;
    }

    const cartTargetItems = user
      ? getNewPurchaseItems(status.purchasedItems, items)
      : items;

    const hasOwnedItems = user && cartTargetItems.length !== items.length;

    if (user && cartTargetItems.length === 0) {
      showToast("선택한 구성은 이미 보유 중이에요.", {
        type: "info",
      });
      return false;
    }

    const result = addItems(
      cartTargetItems.map((item) => mapLineItemToCartItem(theme, item)),
    );

    if (result.addedCount > 0 && result.duplicateCount === 0) {
      showToast(
        hasOwnedItems
          ? "보유 중인 구성을 제외하고 장바구니에 담았어요!"
          : "장바구니에 담았어요!",
        {
          type: "success",
        },
      );
      return true;
    }

    if (result.addedCount > 0 && result.duplicateCount > 0) {
      showToast(
        hasOwnedItems
          ? "새 구성만 장바구니에 담았고, 이미 담긴 항목과 보유 항목은 제외했어요!"
          : "새 구성만 장바구니에 담았어요. 이미 담긴 항목은 제외됐어요!",
        {
          type: "info",
        },
      );
      return true;
    }

    if (result.addedCount === 0 && result.duplicateCount > 0) {
      showToast("이미 장바구니에 담긴 구성이에요!", {
        type: "info",
      });
      return false;
    }

    if (result.invalidCount > 0) {
      showToast("장바구니에 담지 못한 항목이 있어요.", {
        type: "error",
      });
      return false;
    }

    showToast("장바구니에 담지 못했어요.", {
      type: "error",
    });
    return false;
  };

  return (
    <ThemePurchaseBox
      theme={theme}
      onPrimaryAction={handlePrimaryAction}
      onAddToCart={handleAddToCart}
      purchasedItemKeys={purchasedItemKeys}
      downloadedItemKeys={downloadedItemKeys}
      isDisabled={isStatusLoading}
    />
  );
}
