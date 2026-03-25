"use client";

import { STORAGE_KEYS } from "@/constants/storageKeys";
import type { MockUser } from "@/types/mockUser";
import type {
  ThemeDownloadRecord,
  ThemePurchaseLineItem,
  ThemePurchaseRecord,
} from "@/types/themeHistory";
import type { ThemeItem } from "@/types/theme";

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

export function clearStorage(key: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(key);
}

/* -------------------- mock user -------------------- */

export function getMockUser() {
  return readStorage<MockUser | null>(STORAGE_KEYS.MOCK_USER, null);
}

export function setMockUser(user: MockUser) {
  writeStorage(STORAGE_KEYS.MOCK_USER, user);
}

export function clearMockUser() {
  clearStorage(STORAGE_KEYS.MOCK_USER);
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

/**
 * "이 테마를 한 번이라도 구매한 적 있는지" 확인할 때 사용
 * 상세 페이지에서 다운로드 버튼 분기 같은 데 쓸 수 있음
 */
export function hasUserPurchasedTheme(userId: string, themeId: string) {
  return getThemePurchases().some(
    (record) => record.userId === userId && record.themeId === themeId,
  );
}

/**
 * 특정 테마에서 유저가 구매한 line item 전체를 평탄화해서 가져옴
 * 나중에 "이미 산 버전 표시" 같은 데 쓰기 좋음
 */
export function getUserPurchasedLineItems(userId: string, themeId: string) {
  return getUserThemePurchasesByTheme(userId, themeId).flatMap(
    (record) => record.items,
  );
}

type AddThemePurchaseParams = {
  userId: string;
  theme: ThemeItem;
  items: ThemePurchaseLineItem[];
};

export function addThemePurchase({
  userId,
  theme,
  items,
}: AddThemePurchaseParams) {
  const records = getThemePurchases();

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  const nextRecord: ThemePurchaseRecord = {
    id: generateId("purchase"),
    userId,
    themeId: theme.id,
    themeTitle: theme.title,
    themeThumbnail: theme.thumbnail,
    downloadFileName: theme.downloadFileName,
    purchasedAt: new Date().toISOString(),
    totalPrice,
    items,
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

export function hasUserDownloadedTheme(userId: string, themeId: string) {
  return getThemeDownloads().some(
    (record) => record.userId === userId && record.themeId === themeId,
  );
}

type AddThemeDownloadParams = {
  userId: string;
  theme: ThemeItem;
};

export function addThemeDownload({ userId, theme }: AddThemeDownloadParams) {
  const records = getThemeDownloads();

  const existingRecord = records.find(
    (record) => record.userId === userId && record.themeId === theme.id,
  );

  if (existingRecord) {
    return existingRecord;
  }

  const nextRecord: ThemeDownloadRecord = {
    id: generateId("download"),
    userId,
    themeId: theme.id,
    themeTitle: theme.title,
    themeThumbnail: theme.thumbnail,
    downloadFileName: theme.downloadFileName,
    downloadedAt: new Date().toISOString(),
  };

  setThemeDownloads([nextRecord, ...records]);

  return nextRecord;
}
