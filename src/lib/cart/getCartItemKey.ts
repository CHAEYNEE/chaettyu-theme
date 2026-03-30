import type { CartItemIdentity } from "@/types/cart";

function normalizeVersionValue(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed && trimmed.length > 0 ? trimmed : "none";
}

export function getCartItemKey({
  themeId,
  platform,
  purchaseMode,
  versionValue,
}: CartItemIdentity) {
  return [
    themeId.trim(),
    platform.trim().toLowerCase(),
    purchaseMode.trim().toLowerCase(),
    normalizeVersionValue(versionValue),
  ].join(":");
}
