import type {
  CreateThemePurchasePayload,
  CreateThemePurchaseResponse,
  ThemeHistoryResponse,
  ThemeHistoryStatus,
} from "@/types/themeHistory";

async function safeJson<T>(response: Response): Promise<T> {
  const rawText = await response.text();
  let data: unknown = null;

  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof (data as { error?: unknown }).error === "string"
          ? (data as { error: string }).error
          : rawText
            ? rawText.slice(0, 200)
            : `HTTP ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export async function fetchThemeHistoryStatus(themeId: string) {
  const response = await fetch(`/api/theme-history/status?themeId=${themeId}`, {
    method: "GET",
    cache: "no-store",
  });

  return safeJson<ThemeHistoryStatus>(response);
}

export async function createThemePurchase(payload: CreateThemePurchasePayload) {
  const response = await fetch("/api/purchases", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return safeJson<CreateThemePurchaseResponse>(response);
}

export async function fetchMyThemeHistory() {
  const response = await fetch("/api/mypage/history", {
    method: "GET",
    cache: "no-store",
  });

  return safeJson<ThemeHistoryResponse>(response);
}
