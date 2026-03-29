import { STORAGE_KEYS } from "@/constants/storageKeys";
import type {
  ThemeDownloadRecord,
  ThemePurchaseLineItem,
  ThemePurchaseRecord,
} from "@/types/themeHistory";
import type { ThemeDownloadFile, ThemeType } from "@/types/theme";

type ThemeHistoryThemeSource = {
  id: string;
  title: string;
  thumbnail: string;
  type: ThemeType;
  downloadFileName?: string;
  downloadFileNames?: string[];
  downloadFiles?: ThemeDownloadFile[];
};

function isBrowser() {
  return typeof window !== "undefined";
}

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return fallback;
    }

    return JSON.parse(rawValue) as T;
  } catch (error) {
    console.error(`[storage] failed to read key: ${key}`, error);
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[storage] failed to write key: ${key}`, error);
  }
}

function isOwnedLineItem(
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

function filterNewLineItems(
  selectedItems: ThemePurchaseLineItem[],
  ownedItems: ThemePurchaseLineItem[],
) {
  return selectedItems.filter((item) => !isOwnedLineItem(item, ownedItems));
}

function mergeUniqueLineItems(
  baseItems: ThemePurchaseLineItem[],
  nextItems: ThemePurchaseLineItem[],
) {
  const itemMap = new Map<string, ThemePurchaseLineItem>();

  [...baseItems, ...nextItems].forEach((item) => {
    itemMap.set(item.key, item);
  });

  return Array.from(itemMap.values());
}

function uniqueLineItems(items: ThemePurchaseLineItem[]) {
  return mergeUniqueLineItems([], items);
}

function getFallbackDownloadFileNames(theme: ThemeHistoryThemeSource) {
  if (theme.downloadFileNames && theme.downloadFileNames.length > 0) {
    return theme.downloadFileNames;
  }

  return theme.downloadFileName ? [theme.downloadFileName] : [];
}

function getDownloadFileNamesByItems(
  theme: ThemeHistoryThemeSource,
  items: ThemePurchaseLineItem[],
) {
  const downloadFiles = theme.downloadFiles;

  if (!downloadFiles || downloadFiles.length === 0) {
    return getFallbackDownloadFileNames(theme);
  }

  const fileNameSet = new Set<string>();

  items.forEach((item) => {
    if (item.purchaseMode === "set") {
      const matchedSetFile = downloadFiles.find(
        (file) =>
          file.platform === item.platform && file.purchaseMode === "set",
      );

      if (matchedSetFile) {
        fileNameSet.add(matchedSetFile.fileName);
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
      fileNameSet.add(matchedSingleFile.fileName);
    }
  });

  const nextFileNames = Array.from(fileNameSet);

  return nextFileNames.length > 0
    ? nextFileNames
    : getFallbackDownloadFileNames(theme);
}

export function clearStorage(key: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(key);
}

/* -------------------- purchases -------------------- */

export function getThemePurchases() {
  return readStorage<ThemePurchaseRecord[]>(STORAGE_KEYS.THEME_PURCHASES, []);
}

export function setThemePurchases(records: ThemePurchaseRecord[]) {
  writeStorage(STORAGE_KEYS.THEME_PURCHASES, records);
}

export function getUserThemePurchases(userId: string) {
  return getThemePurchases().filter((record) => record.userId === userId);
}

export function getUserThemePurchasesByTheme(userId: string, themeId: string) {
  return getThemePurchases().filter(
    (record) => record.userId === userId && record.themeId === themeId,
  );
}

export function hasUserPurchasedTheme(userId: string, themeId: string) {
  return getThemePurchases().some(
    (record) => record.userId === userId && record.themeId === themeId,
  );
}

export function getUserPurchasedLineItems(userId: string, themeId: string) {
  const items = getUserThemePurchasesByTheme(userId, themeId).flatMap(
    (record) => record.items,
  );

  return uniqueLineItems(items);
}

export function getOwnedPurchaseItems(
  userId: string,
  themeId: string,
  selectedItems: ThemePurchaseLineItem[],
) {
  const ownedItems = getUserPurchasedLineItems(userId, themeId);

  return selectedItems.filter((item) => isOwnedLineItem(item, ownedItems));
}

export function getNewPurchaseItems(
  userId: string,
  themeId: string,
  selectedItems: ThemePurchaseLineItem[],
) {
  const ownedItems = getUserPurchasedLineItems(userId, themeId);

  return filterNewLineItems(selectedItems, ownedItems);
}

export function hasPurchasedAllSelectedItems(
  userId: string,
  themeId: string,
  selectedItems: ThemePurchaseLineItem[],
) {
  if (selectedItems.length === 0) {
    return false;
  }

  return getNewPurchaseItems(userId, themeId, selectedItems).length === 0;
}

type AddThemePurchaseParams = {
  userId: string;
  theme: ThemeHistoryThemeSource;
  items: ThemePurchaseLineItem[];
};

export function addThemePurchase({
  userId,
  theme,
  items,
}: AddThemePurchaseParams): ThemePurchaseRecord | null {
  const records = getThemePurchases();
  const ownedItems = getUserPurchasedLineItems(userId, theme.id);
  const newItems = filterNewLineItems(items, ownedItems);

  if (newItems.length === 0) {
    return null;
  }

  const totalPrice = newItems.reduce((sum, item) => sum + item.price, 0);
  const downloadFileNames = getDownloadFileNamesByItems(theme, newItems);

  const nextRecord: ThemePurchaseRecord = {
    id: generateId("purchase"),
    userId,
    themeId: theme.id,
    themeType: theme.type,
    themeTitle: theme.title,
    themeThumbnail: theme.thumbnail,
    downloadFileName: downloadFileNames[0],
    downloadFileNames,
    purchasedAt: new Date().toISOString(),
    totalPrice,
    items: newItems,
  };

  setThemePurchases([nextRecord, ...records]);

  return nextRecord;
}

/* -------------------- downloads -------------------- */

export function getThemeDownloads() {
  return readStorage<ThemeDownloadRecord[]>(STORAGE_KEYS.THEME_DOWNLOADS, []);
}

export function setThemeDownloads(records: ThemeDownloadRecord[]) {
  writeStorage(STORAGE_KEYS.THEME_DOWNLOADS, records);
}

export function getUserThemeDownloads(userId: string) {
  return getThemeDownloads().filter((record) => record.userId === userId);
}

export function getUserThemeDownloadsByTheme(userId: string, themeId: string) {
  return getThemeDownloads().filter(
    (record) => record.userId === userId && record.themeId === themeId,
  );
}

export function hasUserDownloadedTheme(userId: string, themeId: string) {
  return getThemeDownloads().some(
    (record) => record.userId === userId && record.themeId === themeId,
  );
}

export function getUserDownloadedLineItems(userId: string, themeId: string) {
  const items = getUserThemeDownloadsByTheme(userId, themeId).flatMap(
    (record) => record.items,
  );

  return uniqueLineItems(items);
}

export function getOwnedDownloadItems(
  userId: string,
  themeId: string,
  selectedItems: ThemePurchaseLineItem[],
) {
  const ownedItems = getUserDownloadedLineItems(userId, themeId);

  return selectedItems.filter((item) => isOwnedLineItem(item, ownedItems));
}

export function getNewDownloadItems(
  userId: string,
  themeId: string,
  selectedItems: ThemePurchaseLineItem[],
) {
  const ownedItems = getUserDownloadedLineItems(userId, themeId);

  return filterNewLineItems(selectedItems, ownedItems);
}

export function hasDownloadedAllSelectedItems(
  userId: string,
  themeId: string,
  selectedItems: ThemePurchaseLineItem[],
) {
  if (selectedItems.length === 0) {
    return false;
  }

  return getNewDownloadItems(userId, themeId, selectedItems).length === 0;
}

type AddThemeDownloadParams = {
  userId: string;
  theme: ThemeHistoryThemeSource;
  items: ThemePurchaseLineItem[];
};

export function addThemeDownload({
  userId,
  theme,
  items,
}: AddThemeDownloadParams) {
  const records = getThemeDownloads();
  const now = new Date().toISOString();

  const sameThemeRecords = records.filter(
    (record) => record.userId === userId && record.themeId === theme.id,
  );

  if (sameThemeRecords.length === 0) {
    const nextItems = uniqueLineItems(items);
    const downloadFileNames = getDownloadFileNamesByItems(theme, nextItems);

    const nextRecord: ThemeDownloadRecord = {
      id: generateId("download"),
      userId,
      themeId: theme.id,
      themeType: theme.type,
      themeTitle: theme.title,
      themeThumbnail: theme.thumbnail,
      downloadFileName: downloadFileNames[0],
      downloadFileNames,
      downloadedAt: now,
      items: nextItems,
    };

    setThemeDownloads([nextRecord, ...records]);

    return nextRecord;
  }

  const mergedExistingItems = uniqueLineItems(
    sameThemeRecords.flatMap((record) => record.items),
  );

  const mergedItems = mergeUniqueLineItems(mergedExistingItems, items);
  const downloadFileNames = getDownloadFileNamesByItems(theme, mergedItems);
  const baseRecord = sameThemeRecords[0];

  const updatedRecord: ThemeDownloadRecord = {
    ...baseRecord,
    themeType: theme.type,
    themeTitle: theme.title,
    themeThumbnail: theme.thumbnail,
    downloadFileName: downloadFileNames[0],
    downloadFileNames,
    items: mergedItems,
    downloadedAt: now,
  };

  const nextRecords = records.filter(
    (record) => !(record.userId === userId && record.themeId === theme.id),
  );

  setThemeDownloads([updatedRecord, ...nextRecords]);

  return updatedRecord;
}
