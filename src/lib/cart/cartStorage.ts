import { getCartItemKey } from "@/lib/cart/getCartItemKey";
import type { CartItem } from "@/types/cart";

export const CART_STORAGE_KEY = "chaettyu-theme-cart";
const CART_STORAGE_EVENT = "chaettyu-theme-cart-change";
const EMPTY_CART: CartItem[] = [];

let cartCache: CartItem[] = EMPTY_CART;

function isBrowser() {
  return typeof window !== "undefined";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isThemePlatform(value: unknown): value is CartItem["platform"] {
  return value === "ios" || value === "android";
}

function isPurchaseMode(value: unknown): value is CartItem["purchaseMode"] {
  return value === "single" || value === "set";
}

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<CartItem>;

  return (
    isNonEmptyString(item.themeId) &&
    isNonEmptyString(item.title) &&
    isNonEmptyString(item.thumbnail) &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    isThemePlatform(item.platform) &&
    isPurchaseMode(item.purchaseMode)
  );
}

function normalizeCartItem(item: CartItem): CartItem {
  return {
    ...item,
    id: getCartItemKey(item),
    themeId: item.themeId.trim(),
    title: item.title.trim(),
    thumbnail: item.thumbnail.trim(),
    versionValue: item.versionValue?.trim() || null,
    versionLabel: item.versionLabel?.trim() || null,
    quantity:
      Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1,
  };
}

function notifyCartStore() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(CART_STORAGE_EVENT));
}

function loadCartItemsFromStorage(): CartItem[] {
  if (!isBrowser()) {
    return EMPTY_CART;
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!raw) {
      return EMPTY_CART;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return EMPTY_CART;
    }

    const normalizedItems = parsed
      .filter(isValidCartItem)
      .map(normalizeCartItem);

    return normalizedItems.length > 0 ? normalizedItems : EMPTY_CART;
  } catch (error) {
    console.error("[cartStorage] loadCartItemsFromStorage error:", error);
    return EMPTY_CART;
  }
}

export function readCartItems(): CartItem[] {
  if (!isBrowser()) {
    return EMPTY_CART;
  }

  if (
    cartCache !== EMPTY_CART ||
    window.localStorage.getItem(CART_STORAGE_KEY)
  ) {
    if (cartCache !== EMPTY_CART) {
      return cartCache;
    }
  }

  cartCache = loadCartItemsFromStorage();
  return cartCache;
}

export function writeCartItems(items: CartItem[]) {
  if (!isBrowser()) {
    return;
  }

  try {
    const normalizedItems = items.map(normalizeCartItem);
    const nextItems = normalizedItems.length > 0 ? normalizedItems : EMPTY_CART;

    cartCache = nextItems;

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextItems));
    notifyCartStore();
  } catch (error) {
    console.error("[cartStorage] writeCartItems error:", error);
  }
}

export function clearCartItems() {
  if (!isBrowser()) {
    return;
  }

  try {
    cartCache = EMPTY_CART;
    window.localStorage.removeItem(CART_STORAGE_KEY);
    notifyCartStore();
  } catch (error) {
    console.error("[cartStorage] clearCartItems error:", error);
  }
}

export function subscribeCartStorage(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== CART_STORAGE_KEY) {
      return;
    }

    cartCache = loadCartItemsFromStorage();
    callback();
  };

  const handleCustomEvent = () => {
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CART_STORAGE_EVENT, handleCustomEvent);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CART_STORAGE_EVENT, handleCustomEvent);
  };
}
