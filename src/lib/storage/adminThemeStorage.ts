import type { ThemeItem } from "@/types/theme";

const STORAGE_KEY = "chaettyu_admin_themes";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getStoredAdminThemes(): ThemeItem[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as ThemeItem[];
  } catch {
    return [];
  }
}

export function saveStoredAdminThemes(items: ThemeItem[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addStoredAdminTheme(theme: ThemeItem) {
  const currentThemes = getStoredAdminThemes();
  const nextThemes = [
    theme,
    ...currentThemes.filter((item) => item.id !== theme.id),
  ];

  saveStoredAdminThemes(nextThemes);

  return nextThemes;
}

export function getMergedAdminThemes(baseThemes: ThemeItem[]) {
  const storedThemes = getStoredAdminThemes();
  const mergedMap = new Map<string, ThemeItem>();

  for (const theme of baseThemes) {
    mergedMap.set(theme.id, theme);
  }

  for (const theme of storedThemes) {
    mergedMap.set(theme.id, theme);
  }

  return Array.from(mergedMap.values());
}
