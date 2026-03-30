import type { PurchaseMode, ThemePlatform } from "@/types/theme";

export type CartItemIdentity = {
  themeId: string;
  platform: ThemePlatform;
  purchaseMode: PurchaseMode;
  versionValue?: string | null;
};

export type CartItem = CartItemIdentity & {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  versionLabel?: string | null;
  quantity: number;
};

export type AddCartItemInput = Omit<CartItem, "id" | "quantity"> & {
  quantity?: number;
};

export type AddCartItemResult =
  | {
      success: true;
      reason: "added";
      item: CartItem;
    }
  | {
      success: false;
      reason: "duplicate" | "invalid";
      item?: CartItem;
    };

export type RemoveCartItemResult =
  | {
      success: true;
      reason: "removed";
      itemId: string;
    }
  | {
      success: false;
      reason: "not-found";
      itemId: string;
    };

export type CartContextValue = {
  items: CartItem[];
  isHydrated: boolean;
  itemCount: number;
  totalQuantity: number;
  totalPrice: number;
  addItem: (input: AddCartItemInput) => AddCartItemResult;
  removeItem: (itemId: string) => RemoveCartItemResult;
  clearCart: () => void;
  hasItem: (identity: CartItemIdentity) => boolean;
  getItemByIdentity: (identity: CartItemIdentity) => CartItem | undefined;
};
