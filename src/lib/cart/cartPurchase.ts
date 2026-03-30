import type { CartItem } from "@/types/cart";
import type { ThemePlatform } from "@/types/theme";
import type { ThemePurchaseLineItem } from "@/types/themeHistory";

type CartPurchaseGroup = {
  themeId: string;
  themeTitle: string;
  cartItems: CartItem[];
  lineItems: ThemePurchaseLineItem[];
};

const platformLabelMap: Record<ThemePlatform, string> = {
  ios: "iOS",
  android: "AND",
};

function getCartLineItemKey(item: CartItem) {
  if (item.purchaseMode === "set") {
    return `${item.platform}-set`;
  }

  return `${item.platform}-single-${item.versionValue ?? "default"}`;
}

function getSingleVersionLabel(item: CartItem) {
  return item.versionLabel ?? item.versionValue ?? "기본 버전";
}

export function mapCartItemToPurchaseLineItem(
  item: CartItem,
): ThemePurchaseLineItem {
  if (item.purchaseMode === "set") {
    return {
      key: getCartLineItemKey(item),
      platform: item.platform,
      purchaseMode: "set",
      title: `[${platformLabelMap[item.platform]}] 세트 구매`,
      subtitle: "전체 구성",
      price: item.price,
    };
  }

  return {
    key: getCartLineItemKey(item),
    platform: item.platform,
    purchaseMode: "single",
    title: `[${platformLabelMap[item.platform]}] ${getSingleVersionLabel(item)}`,
    subtitle: "개별 구매",
    price: item.price,
    versionValue: item.versionValue ?? undefined,
  };
}

export function groupCartItemsByTheme(items: CartItem[]): CartPurchaseGroup[] {
  const groupedMap = new Map<string, CartItem[]>();

  items.forEach((item) => {
    const current = groupedMap.get(item.themeId) ?? [];
    groupedMap.set(item.themeId, [...current, item]);
  });

  return Array.from(groupedMap.entries()).map(([themeId, themeItems]) => ({
    themeId,
    themeTitle: themeItems[0]?.title ?? "",
    cartItems: themeItems,
    lineItems: themeItems.map(mapCartItemToPurchaseLineItem),
  }));
}
