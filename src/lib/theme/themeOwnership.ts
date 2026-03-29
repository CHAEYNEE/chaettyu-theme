import type { ThemePurchaseLineItem } from "@/types/themeHistory";

export function isOwnedLineItem(
  targetItem: ThemePurchaseLineItem,
  ownedItems: ThemePurchaseLineItem[],
) {
  return ownedItems.some((ownedItem) => {
    if (ownedItem.key === targetItem.key) {
      return true;
    }

    if (ownedItem.platform !== targetItem.platform) {
      return false;
    }

    if (
      ownedItem.purchaseMode === "set" &&
      targetItem.purchaseMode === "single"
    ) {
      return true;
    }

    return false;
  });
}

export function filterNewLineItems(
  selectedItems: ThemePurchaseLineItem[],
  ownedItems: ThemePurchaseLineItem[],
) {
  return selectedItems.filter((item) => !isOwnedLineItem(item, ownedItems));
}

export function mergeUniqueLineItems(
  baseItems: ThemePurchaseLineItem[],
  nextItems: ThemePurchaseLineItem[],
) {
  const itemMap = new Map<string, ThemePurchaseLineItem>();

  [...baseItems, ...nextItems].forEach((item) => {
    itemMap.set(item.key, item);
  });

  return Array.from(itemMap.values());
}

export function uniqueLineItems(items: ThemePurchaseLineItem[]) {
  return mergeUniqueLineItems([], items);
}

export function getNewPurchaseItems(
  ownedItems: ThemePurchaseLineItem[],
  selectedItems: ThemePurchaseLineItem[],
) {
  return filterNewLineItems(selectedItems, ownedItems);
}

export function hasPurchasedAllSelectedItems(
  ownedItems: ThemePurchaseLineItem[],
  selectedItems: ThemePurchaseLineItem[],
) {
  if (selectedItems.length === 0) {
    return false;
  }

  return getNewPurchaseItems(ownedItems, selectedItems).length === 0;
}

export function hasDownloadedAllSelectedItems(
  downloadedItems: ThemePurchaseLineItem[],
  selectedItems: ThemePurchaseLineItem[],
) {
  if (selectedItems.length === 0) {
    return false;
  }

  return filterNewLineItems(selectedItems, downloadedItems).length === 0;
}
