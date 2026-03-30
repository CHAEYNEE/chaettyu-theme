"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/common/Toast/ToastProvider";
import BoardLayout from "@/components/layout/BoardLayout/BoardLayout";
import useAuthUser from "@/hooks/useAuthUser";
import {
  createThemePurchase,
  fetchThemeHistoryStatus,
} from "@/lib/api/themeHistory";
import { groupCartItemsByTheme } from "@/lib/cart/cartPurchase";
import { getNewPurchaseItems } from "@/lib/theme/themeOwnership";
import { useCart } from "@/providers/CartProvider";
import type { CartItem } from "@/types/cart";

import styles from "./page.module.css";

function formatPrice(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function getPlatformLabel(platform: CartItem["platform"]) {
  return platform === "ios" ? "iOS" : "AND";
}

function getPurchaseModeLabel(mode: CartItem["purchaseMode"]) {
  return mode === "set" ? "세트" : "개별";
}

function getVersionText(item: CartItem) {
  if (item.purchaseMode === "set") {
    return "전체 구성";
  }

  return item.versionLabel ?? item.versionValue ?? "기본 버전";
}

function getCartItemPurchaseKey(item: CartItem) {
  if (item.purchaseMode === "set") {
    return `${item.platform}-set`;
  }

  return `${item.platform}-single-${item.versionValue ?? "default"}`;
}

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuthUser();
  const { showToast } = useToast();
  const { items, itemCount, totalPrice, removeItem, removeItems, clearCart } =
    useCart();

  const [isPurchasing, setIsPurchasing] = useState(false);

  const groupedItems = useMemo(() => groupCartItemsByTheme(items), [items]);

  const handleRemoveItem = (itemId: string, title: string) => {
    const result = removeItem(itemId);

    if (result.success) {
      showToast(`${title} 항목을 장바구니에서 뺐어요.`, {
        type: "success",
      });
      return;
    }

    showToast("장바구니 항목을 삭제하지 못했어요.", {
      type: "error",
    });
  };

  const handleClearCart = () => {
    if (items.length === 0) {
      return;
    }

    const confirmed = window.confirm("장바구니를 비울까요?");

    if (!confirmed) {
      return;
    }

    clearCart();

    showToast("장바구니를 비웠어요.", {
      type: "success",
    });
  };

  const handlePurchaseAll = async () => {
    if (items.length === 0 || isPurchasing) {
      return;
    }

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/cart")}`);
      return;
    }

    try {
      setIsPurchasing(true);

      let successCount = 0;
      let alreadyOwnedCount = 0;
      let failedThemeCount = 0;
      const purchasedCartItemIds: string[] = [];

      for (const group of groupedItems) {
        try {
          const status = await fetchThemeHistoryStatus(group.themeId);

          const purchasableItems = getNewPurchaseItems(
            status.purchasedItems,
            group.lineItems,
          );

          if (purchasableItems.length === 0) {
            alreadyOwnedCount += group.lineItems.length;
            continue;
          }

          await createThemePurchase({
            themeId: group.themeId,
            items: purchasableItems,
          });

          const purchasableKeySet = new Set(
            purchasableItems.map((item) => item.key),
          );

          group.cartItems.forEach((cartItem) => {
            const purchaseKey = getCartItemPurchaseKey(cartItem);

            if (purchasableKeySet.has(purchaseKey)) {
              purchasedCartItemIds.push(cartItem.id);
              successCount += 1;
              return;
            }

            alreadyOwnedCount += 1;
          });
        } catch (error) {
          console.error(`[cart purchase] ${group.themeId} failed`, error);
          failedThemeCount += 1;
        }
      }

      removeItems(purchasedCartItemIds);

      if (successCount > 0 && failedThemeCount === 0) {
        showToast(
          alreadyOwnedCount > 0
            ? `새 구성 ${successCount}개만 구매했어요. 이미 보유한 구성은 제외됐어요!`
            : `${successCount}개 구성을 구매했어요!`,
          {
            type: "success",
          },
        );
        return;
      }

      if (successCount > 0 && failedThemeCount > 0) {
        showToast(
          `${successCount}개는 구매했고, 일부 테마는 실패했어요. 실패한 항목은 장바구니에 남겨둘게요.`,
          {
            type: "info",
          },
        );
        return;
      }

      if (alreadyOwnedCount > 0 && failedThemeCount === 0) {
        showToast("선택한 구성은 이미 모두 보유 중이에요.", {
          type: "info",
        });
        return;
      }

      showToast("장바구니 구매 중 오류가 발생했어요.", {
        type: "error",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const isEmpty = items.length === 0;

  return (
    <BoardLayout badgeText="Cart">
      <section className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <p className={styles.eyebrow}>Cart</p>
            <h1 className={styles.title}>장바구니</h1>
            <p className={styles.description}>
              담아둔 시그니처 테마를 한 번에 정리하고 바로 구매할 수 있어요.
            </p>
          </div>

          {!isEmpty ? (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClearCart}
              disabled={isPurchasing}
            >
              전체 비우기
            </button>
          ) : null}
        </header>

        {isEmpty ? (
          <div className={styles.emptyState}>
            <strong className={styles.emptyTitle}>
              아직 담긴 테마가 없어요
            </strong>
            <p className={styles.emptyDescription}>
              마음에 드는 시그니처 테마를 담아두고 한 번에 모아보자구.
            </p>

            <div className={styles.emptyActions}>
              <Link href="/themes/signature" className={styles.primaryLink}>
                시그니처 테마 보러가기
              </Link>
              <Link href="/" className={styles.secondaryLink}>
                홈으로 가기
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.content}>
            <section className={styles.listSection}>
              <ul className={styles.list}>
                {items.map((item) => (
                  <li key={item.id} className={styles.card}>
                    <Link
                      href={`/themes/${item.themeId}`}
                      className={styles.thumbnailLink}
                      aria-label={`${item.title} 상세 페이지로 이동`}
                    >
                      <div className={styles.thumbnailWrap}>
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className={styles.thumbnail}
                          sizes="(max-width: 900px) 96px, 120px"
                        />
                      </div>
                    </Link>

                    <div className={styles.itemBody}>
                      <div className={styles.itemTop}>
                        <div className={styles.itemTextGroup}>
                          <Link
                            href={`/themes/${item.themeId}`}
                            className={styles.itemTitleLink}
                          >
                            <strong className={styles.itemTitle}>
                              {item.title}
                            </strong>
                          </Link>

                          <div className={styles.metaRow}>
                            <span className={styles.metaChip}>
                              {getPlatformLabel(item.platform)}
                            </span>
                            <span className={styles.metaChip}>
                              {getPurchaseModeLabel(item.purchaseMode)}
                            </span>
                            <span className={styles.metaChip}>
                              {getVersionText(item)}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => handleRemoveItem(item.id, item.title)}
                          disabled={isPurchasing}
                        >
                          삭제
                        </button>
                      </div>

                      <div className={styles.bottomRow}>
                        <span className={styles.quantityText}>
                          수량 {item.quantity}
                        </span>

                        <strong className={styles.itemPrice}>
                          {formatPrice(item.price * item.quantity)}
                        </strong>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <aside className={styles.summarySection}>
              <div className={styles.summaryCard}>
                <p className={styles.summaryEyebrow}>ORDER SUMMARY</p>

                <div className={styles.summaryRow}>
                  <span>담긴 항목</span>
                  <strong>{itemCount}개</strong>
                </div>

                <div className={styles.summaryRow}>
                  <span>총 결제 금액</span>
                  <strong className={styles.summaryPrice}>
                    {formatPrice(totalPrice)}
                  </strong>
                </div>

                <div className={styles.summaryActions}>
                  <button
                    type="button"
                    className={styles.purchaseButton}
                    onClick={handlePurchaseAll}
                    disabled={isEmpty || isPurchasing}
                  >
                    {isPurchasing ? "구매 처리 중..." : "전체 구매하기"}
                  </button>

                  <Link
                    href="/themes/signature"
                    className={styles.secondaryLink}
                  >
                    테마 더 담으러 가기
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </BoardLayout>
  );
}
