"use client";

import { useRouter } from "next/navigation";

import ThemePurchaseBox from "@/components/theme/ThemePurchaseBox/ThemePurchaseBox";
import { getMockUser } from "@/lib/auth/mockAuthStorage";
import { addThemeDownload, addThemePurchase } from "@/lib/storage/themeStorage";
import type { ThemeItem } from "@/types/theme";
import type { ThemePurchaseLineItem } from "@/types/themeHistory";

type ThemeDetailClientProps = {
  theme: ThemeItem;
};

export default function ThemeDetailClient({ theme }: ThemeDetailClientProps) {
  const router = useRouter();

  const handlePrimaryAction = (items: ThemePurchaseLineItem[]) => {
    const user = getMockUser();

    if (theme.type === "free") {
      if (user) {
        addThemeDownload({
          userId: user.id,
          theme,
          items,
        });
      }

      window.alert("다운로드가 시작되었어요!");
      return;
    }

    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/themes/${theme.id}`)}`,
      );
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
