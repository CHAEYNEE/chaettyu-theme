"use client";

import { STORAGE_KEYS } from "@/constants/storageKeys";
import type { MockUser } from "@/types/mockUser";

export const MOCK_AUTH_EVENT = "mock-auth-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emitMockAuthChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(MOCK_AUTH_EVENT));
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

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`[storage] failed to clear key: ${key}`, error);
  }
}

export function getMockUser(): MockUser | null {
  return readStorage<MockUser | null>(STORAGE_KEYS.MOCK_USER, null);
}

export function setMockUser(user: MockUser) {
  writeStorage(STORAGE_KEYS.MOCK_USER, user);
  emitMockAuthChange();
}

export function clearMockUser() {
  clearStorage(STORAGE_KEYS.MOCK_USER);
  emitMockAuthChange();
}

export function hasMockUser(): boolean {
  return getMockUser() !== null;
}

export function sanitizeRedirectPath(path?: string | null): string {
  if (!path) return "/";
  if (!path.startsWith("/")) return "/";
  if (path.startsWith("//")) return "/";

  return path;
}
