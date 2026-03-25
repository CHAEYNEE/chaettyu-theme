import { STORAGE_KEYS } from "@/constants/storageKeys";
import type { MockUser } from "@/types/mockUser";

export const MOCK_AUTH_EVENT = "mock-auth-changed";

export function getMockUser(): MockUser | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEYS.MOCK_USER);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as MockUser;
  } catch {
    window.localStorage.removeItem(STORAGE_KEYS.MOCK_USER);
    return null;
  }
}

export function setMockUser(user: MockUser) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEYS.MOCK_USER, JSON.stringify(user));
  window.dispatchEvent(new Event(MOCK_AUTH_EVENT));
}

export function clearMockUser() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(STORAGE_KEYS.MOCK_USER);
  window.dispatchEvent(new Event(MOCK_AUTH_EVENT));
}

export function sanitizeRedirectPath(path?: string | null) {
  if (!path) return "/";
  if (!path.startsWith("/")) return "/";
  if (path.startsWith("//")) return "/";
  return path;
}
