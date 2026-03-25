"use client";

import { useRouter } from "next/navigation";

import ThemePurchaseBox from "@/components/theme/ThemePurchaseBox/ThemePurchaseBox";
import {
  addThemeDownload,
  addThemePurchase,
  getMockUser,
} from "@/lib/storage/themeStorage";
import type { ThemeItem } from "@/types/theme";
import type { ThemePurchaseLineItem } from "@/types/themeHistory";

type ThemeDetailClientProps = {
  theme: ThemeItem;
};

export default function ThemeDetailClient({ theme }: ThemeDetailClientProps) {
  const router = useRouter();

  const handlePrimaryAction = (items: ThemePurchaseLineItem[]) => {
    const user = getMockUser();

    if (!user) {
      router.push(`/login?redirect=/themes/${theme.id}`);
      return;
    }

    if (theme.type === "free") {
      addThemeDownload({
        userId: user.id,
        theme,
      });

      window.alert("무료 다운로드가 시작되었어요!");
      return;
    }

    addThemePurchase({
      userId: user.id,
      theme,
      items,
    });

    window.alert("구매가 완료되었어요!");
  };

  return (
    <ThemePurchaseBox theme={theme} onPrimaryAction={handlePrimaryAction} />
  );
}
