"use client";

import { type ChangeEvent, useMemo, useState } from "react";
import { X } from "lucide-react";

import type { PurchaseMode, ThemeItem, ThemePlatform } from "@/types/theme";

import styles from "./ThemePurchaseBox.module.css";

type SelectedPurchaseItem = {
  key: string;
  platform: ThemePlatform;
  purchaseMode: PurchaseMode;
  title: string;
  subtitle?: string;
  price: number;
  versionValue?: string;
};

type ThemePurchaseBoxProps = {
  theme: ThemeItem;
  onPrimaryAction?: (items: SelectedPurchaseItem[]) => void;
};

const platformLabelMap: Record<ThemePlatform, string> = {
  ios: "iOS",
  android: "AND",
};

export default function ThemePurchaseBox({
  theme,
  onPrimaryAction,
}: ThemePurchaseBoxProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<ThemePlatform | "">(
    "",
  );
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode | "">("");
  const [selectedVersionValue, setSelectedVersionValue] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedPurchaseItem[]>(
    [],
  );

  const versions = theme.versions ?? [];

  const hasSet =
    theme.type === "signature" &&
    typeof theme.setPrice === "number" &&
    versions.length > 0;

  const totalPrice = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price, 0);
  }, [selectedItems]);

  const createSetItem = (platform: ThemePlatform): SelectedPurchaseItem => {
    const subtitle =
      versions.length > 0
        ? `${versions.length}종 구매${
            theme.setBonusCount ? ` + 증정 ${theme.setBonusCount}종` : ""
          }`
        : undefined;

    return {
      key: `${platform}-set`,
      platform,
      purchaseMode: "set",
      title: `[${platformLabelMap[platform]}] 세트 구매`,
      subtitle,
      price: theme.setPrice as number,
    };
  };

  const handlePlatformChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as ThemePlatform | "";

    setSelectedPlatform(value);
    setPurchaseMode("");
    setSelectedVersionValue("");
  };

  const handlePurchaseModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as PurchaseMode | "";

    if (!selectedPlatform || !value) {
      setPurchaseMode(value);
      setSelectedVersionValue("");
      return;
    }

    const hasSetItemForPlatform = selectedItems.some(
      (item) =>
        item.platform === selectedPlatform && item.purchaseMode === "set",
    );

    if (value === "single" && hasSetItemForPlatform) {
      window.alert(
        "이미 해당 기종의 세트 상품이 담겨 있어 개별 구매는 선택할 수 없어요!",
      );
      setPurchaseMode("");
      setSelectedVersionValue("");
      return;
    }

    setPurchaseMode(value);
    setSelectedVersionValue("");

    if (value === "set") {
      handleAddSetItem(selectedPlatform);
    }
  };

  const handleVersionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    setSelectedVersionValue(value);

    if (!value) {
      return;
    }

    handleAddSingleItem(value);
  };

  const handleAddSetItem = (platform: ThemePlatform) => {
    if (!hasSet || typeof theme.setPrice !== "number") {
      return;
    }

    const itemKey = `${platform}-set`;

    const alreadyAdded = selectedItems.some((item) => item.key === itemKey);

    if (alreadyAdded) {
      window.alert("이미 선택한 기종의 세트 상품이 담겨 있어요!");
      return;
    }

    const filteredItems = selectedItems.filter(
      (item) => !(item.platform === platform && item.purchaseMode === "single"),
    );

    setSelectedItems([...filteredItems, createSetItem(platform)]);
    setPurchaseMode("set");
    setSelectedVersionValue("");
  };

  const handleAddSingleItem = (value: string) => {
    if (!selectedPlatform) {
      return;
    }

    const pickedVersion = versions.find((version) => version.value === value);

    if (!pickedVersion) {
      setSelectedVersionValue("");
      return;
    }

    const hasSetItemForPlatform = selectedItems.some(
      (item) =>
        item.platform === selectedPlatform && item.purchaseMode === "set",
    );

    if (hasSetItemForPlatform) {
      window.alert(
        "이미 해당 기종의 세트 상품이 담겨 있어 단품은 추가할 수 없어요!",
      );
      setSelectedVersionValue("");
      return;
    }

    const itemKey = `${selectedPlatform}-single-${pickedVersion.value}`;

    const alreadyAdded = selectedItems.some((item) => item.key === itemKey);

    if (alreadyAdded) {
      window.alert("이미 선택한 버전이에요!");
      setSelectedVersionValue("");
      return;
    }

    const nextItem: SelectedPurchaseItem = {
      key: itemKey,
      platform: selectedPlatform,
      purchaseMode: "single",
      title: `[${platformLabelMap[selectedPlatform]}] ${pickedVersion.label}`,
      subtitle: "개별 구매",
      price: theme.price,
      versionValue: pickedVersion.value,
    };

    const nextItems = [...selectedItems, nextItem];

    const singleItemsForPlatform = nextItems.filter(
      (item) =>
        item.platform === selectedPlatform && item.purchaseMode === "single",
    );

    const shouldConvertToSet =
      hasSet &&
      typeof theme.setPrice === "number" &&
      versions.length > 0 &&
      singleItemsForPlatform.length === versions.length;

    if (shouldConvertToSet) {
      const filteredItems = nextItems.filter(
        (item) =>
          !(
            item.platform === selectedPlatform && item.purchaseMode === "single"
          ),
      );

      setSelectedItems([...filteredItems, createSetItem(selectedPlatform)]);
      setPurchaseMode("set");
      setSelectedVersionValue("");
      window.alert("전 버전을 선택해서 세트 구매로 자동 전환됐어요!");
      return;
    }

    setSelectedItems(nextItems);
    setSelectedVersionValue("");
  };

  const handleRemoveItem = (key: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handlePrimaryAction = () => {
    if (theme.type === "free") {
      onPrimaryAction?.([]);
      return;
    }

    if (selectedItems.length === 0) {
      return;
    }

    onPrimaryAction?.(selectedItems);
  };

  return (
    <div className={styles.box}>
      {theme.type === "signature" ? (
        <>
          <div className={styles.selectArea}>
            <select
              className={`${styles.select} ${
                !selectedPlatform ? styles.placeholderSelect : ""
              }`}
              value={selectedPlatform}
              onChange={handlePlatformChange}
            >
              <option value="">사용 기종</option>
              {theme.platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platformLabelMap[platform]}
                </option>
              ))}
            </select>

            <select
              className={`${styles.select} ${
                !purchaseMode ? styles.placeholderSelect : ""
              }`}
              value={purchaseMode}
              onChange={handlePurchaseModeChange}
              disabled={!selectedPlatform}
            >
              <option value="">구매 방식</option>
              <option value="single">개별 구매</option>
              {hasSet && <option value="set">세트 구매</option>}
            </select>

            {purchaseMode === "single" && (
              <select
                className={`${styles.select} ${
                  !selectedVersionValue ? styles.placeholderSelect : ""
                }`}
                value={selectedVersionValue}
                onChange={handleVersionChange}
                disabled={!selectedPlatform}
              >
                <option value="">버전 선택</option>
                {versions.map((version) => (
                  <option key={version.value} value={version.value}>
                    {version.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className={styles.selectedListBox}>
              <ul className={styles.selectedList}>
                {selectedItems.map((item) => (
                  <li key={item.key} className={styles.selectedItem}>
                    <div className={styles.selectedItemInfo}>
                      <strong className={styles.selectedItemName}>
                        {item.title}
                      </strong>

                      {item.subtitle && (
                        <span className={styles.selectedItemSub}>
                          {item.subtitle}
                        </span>
                      )}
                    </div>

                    <div className={styles.selectedItemPrice}>
                      <span className={styles.selectedItemPriceValue}>
                        {item.price.toLocaleString()}
                      </span>
                      <span className={styles.selectedItemPriceUnit}>원</span>
                    </div>

                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handleRemoveItem(item.key)}
                      aria-label={`${item.title} 삭제`}
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>

              <div className={styles.priceRow}>
                <strong className={styles.price}>
                  <span className={styles.priceValue}>
                    {totalPrice.toLocaleString()}
                  </span>
                  <span className={styles.priceUnit}>원</span>
                </strong>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={styles.priceRow}>
          <strong className={styles.freeText}>무료 다운로드</strong>
        </div>
      )}

      <button
        type="button"
        className={styles.primaryButton}
        onClick={handlePrimaryAction}
        disabled={theme.type === "signature" && selectedItems.length === 0}
      >
        {theme.type === "free" ? "무료 다운로드" : "구매하기"}
      </button>
    </div>
  );
}
