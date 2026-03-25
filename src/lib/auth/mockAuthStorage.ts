import { STORAGE_KEYS } from "@/constants/storageKeys";
import type { MockUser } from "@/types/mockUser";

export const MOCK_AUTH_EVENT = "mock-auth-changed";

function isBrowser() {
  return typeof window !== "undefined";
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

function clearStorage(key: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(key);
}

export function getMockUser() {
  return readStorage<MockUser | null>(STORAGE_KEYS.MOCK_USER, null);
}

export function setMockUser(user: MockUser) {
  writeStorage(STORAGE_KEYS.MOCK_USER, user);
  window.dispatchEvent(new Event(MOCK_AUTH_EVENT));
}

export function clearMockUser() {
  clearStorage(STORAGE_KEYS.MOCK_USER);
  window.dispatchEvent(new Event(MOCK_AUTH_EVENT));
}

export function sanitizeRedirectPath(path?: string | null) {
  if (!path) return "/";
  if (!path.startsWith("/")) return "/";
  if (path.startsWith("//")) return "/";
  return path;
}
