"use client";

import { STORAGE_KEYS } from "@/constants/storageKeys";
import type { AuthUser } from "@/types/authUser";

export const AUTH_STORAGE_EVENT = "auth-storage-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emitAuthStorageChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
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

export function getStoredAuthUser(): AuthUser | null {
  return readStorage<AuthUser | null>(STORAGE_KEYS.AUTH_USER, null);
}

export function setStoredAuthUser(user: AuthUser) {
  writeStorage(STORAGE_KEYS.AUTH_USER, user);
  emitAuthStorageChange();
}

export function clearStoredAuthUser() {
  clearStorage(STORAGE_KEYS.AUTH_USER);
  emitAuthStorageChange();
}

export function hasStoredAuthUser(): boolean {
  return getStoredAuthUser() !== null;
}

export function sanitizeRedirectPath(path?: string | null): string {
  if (!path) return "/";
  if (!path.startsWith("/")) return "/";
  if (path.startsWith("//")) return "/";

  return path;
}
