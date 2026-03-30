"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { getCartItemKey } from "@/lib/cart/getCartItemKey";
import {
  clearCartItems,
  readCartItems,
  subscribeCartStorage,
  writeCartItems,
} from "@/lib/cart/cartStorage";
import type {
  AddCartItemInput,
  AddCartItemResult,
  CartContextValue,
  CartItem,
  CartItemIdentity,
  RemoveCartItemResult,
  RemoveCartItemsResult,
} from "@/types/cart";

const CartContext = createContext<CartContextValue | null>(null);
const EMPTY_CART: CartItem[] = [];

type CartProviderProps = {
  children: ReactNode;
};

function createCartItem(input: AddCartItemInput): CartItem | null {
  const themeId = input.themeId?.trim();
  const title = input.title?.trim();
  const thumbnail = input.thumbnail?.trim();
  const price = Number(input.price);

  if (
    !themeId ||
    !title ||
    !thumbnail ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return null;
  }

  const id = getCartItemKey({
    themeId,
    platform: input.platform,
    purchaseMode: input.purchaseMode,
    versionValue: input.versionValue ?? null,
  });

  return {
    id,
    themeId,
    title,
    thumbnail,
    price,
    platform: input.platform,
    purchaseMode: input.purchaseMode,
    versionValue: input.versionValue ?? null,
    versionLabel: input.versionLabel ?? null,
    quantity: input.quantity && input.quantity > 0 ? input.quantity : 1,
  };
}

function subscribeCartStore(onStoreChange: () => void) {
  return subscribeCartStorage(onStoreChange);
}

function getCartSnapshot() {
  return readCartItems();
}

function getCartServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

export function CartProvider({ children }: CartProviderProps) {
  const items = useSyncExternalStore(
    subscribeCartStore,
    getCartSnapshot,
    getCartServerSnapshot,
  );

  const isHydrated = true;

  const getItemByIdentity = useCallback(
    (identity: CartItemIdentity) => {
      const itemId = getCartItemKey(identity);

      return items.find((item) => item.id === itemId);
    },
    [items],
  );

  const hasItem = useCallback(
    (identity: CartItemIdentity) => {
      return items.some((item) => item.id === getCartItemKey(identity));
    },
    [items],
  );

  const addItem = useCallback(
    (input: AddCartItemInput): AddCartItemResult => {
      const nextItem = createCartItem(input);

      if (!nextItem) {
        return {
          success: false,
          reason: "invalid",
        };
      }

      const duplicatedItem = items.find((item) => item.id === nextItem.id);

      if (duplicatedItem) {
        return {
          success: false,
          reason: "duplicate",
          item: duplicatedItem,
        };
      }

      writeCartItems([...items, nextItem]);

      return {
        success: true,
        reason: "added",
        item: nextItem,
      };
    },
    [items],
  );

  const removeItem = useCallback(
    (itemId: string): RemoveCartItemResult => {
      const exists = items.some((item) => item.id === itemId);

      if (!exists) {
        return {
          success: false,
          reason: "not-found",
          itemId,
        };
      }

      writeCartItems(items.filter((item) => item.id !== itemId));

      return {
        success: true,
        reason: "removed",
        itemId,
      };
    },
    [items],
  );

  const removeItems = useCallback(
    (itemIds: string[]): RemoveCartItemsResult => {
      if (itemIds.length === 0) {
        return {
          success: true,
          removedCount: 0,
        };
      }

      const itemIdSet = new Set(itemIds);
      const nextItems = items.filter((item) => !itemIdSet.has(item.id));
      const removedCount = items.length - nextItems.length;

      if (removedCount > 0) {
        writeCartItems(nextItems);
      }

      return {
        success: removedCount > 0,
        removedCount,
      };
    },
    [items],
  );

  const clearCart = useCallback(() => {
    clearCartItems();
  }, []);

  const itemCount = useMemo(() => items.length, [items]);

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isHydrated,
      itemCount,
      totalQuantity,
      totalPrice,
      addItem,
      removeItem,
      removeItems,
      clearCart,
      hasItem,
      getItemByIdentity,
    }),
    [
      items,
      isHydrated,
      itemCount,
      totalQuantity,
      totalPrice,
      addItem,
      removeItem,
      removeItems,
      clearCart,
      hasItem,
      getItemByIdentity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
