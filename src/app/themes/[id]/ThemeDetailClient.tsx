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

  const handlePrimaryAction = (items: ThemePurchaseLineItem[]) => {
    if (items.length === 0) {
      showToast("구성을 먼저 선택해 주세요!", {
        type: "error",
      });
      return false;
    }

    if (theme.type === "free") {
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
          ? "이미 받은 구성이에요. 다시 다운로드했어요!"
          : "다운로드가 완료되었어요!",
        {
          type: "success",
        },
      );

      return true;
    }

    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/themes/${theme.id}`)}`,
      );
      return false;
    }

    const alreadyOwned = hasPurchasedAllSelectedItems(user.id, theme.id, items);

    if (alreadyOwned) {
      showToast(
        "선택한 구성은 이미 보유 중이에요. 다운로드로 다시 받을 수 있어요.",
        {
          type: "info",
        },
      );
      return false;
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
