"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

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
      window.alert("구성을 먼저 선택해 주세요!");
      return;
    }

    if (theme.type === "free") {
      if (!user) {
        window.alert("다운로드가 시작되었어요!");
        return;
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

      window.alert(
        isRedownload
          ? "이미 받은 구성이에요. 다시 다운로드했어요!"
          : "다운로드가 완료되었어요!",
      );
      return;
    }

    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/themes/${theme.id}`)}`,
      );
      return;
    }

    const alreadyOwned = hasPurchasedAllSelectedItems(user.id, theme.id, items);

    if (alreadyOwned) {
      window.alert(
        "선택한 구성은 이미 보유 중이에요. 다운로드로 다시 받을 수 있어요.",
      );
      return;
    }

    const purchasableItems = getNewPurchaseItems(user.id, theme.id, items);
    const hasMixedSelection = purchasableItems.length !== items.length;

    const purchaseResult = addThemePurchase({
      userId: user.id,
      theme,
      items: purchasableItems,
    });

    if (!purchaseResult) {
      window.alert(
        "선택한 구성은 이미 보유 중이에요. 다운로드로 다시 받을 수 있어요.",
      );
      return;
    }

    window.alert(
      hasMixedSelection
        ? "이미 가진 구성을 제외한 새 구성만 구매했어요!"
        : "구매가 완료되었어요!",
    );
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
