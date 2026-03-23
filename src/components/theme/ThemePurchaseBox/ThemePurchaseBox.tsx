"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import type {
  PurchaseMode,
  ThemePlatform,
  ThemeType,
  ThemeVersion,
} from "@/types/theme";

import styles from "./ThemePurchaseBox.module.css";

type ThemePurchaseBoxProps = {
  type: ThemeType;
  price: number;
  setPrice?: number;
  setBonusCount?: number;
  platforms: ThemePlatform[];
  versions?: ThemeVersion[];
};

type SelectedPurchaseItem = {
  key: string;
  platform: ThemePlatform;
  purchaseMode: PurchaseMode;
  title: string;
  subtitle?: string;
  price: number;
  versionValue?: string;
};

const platformLabelMap: Record<ThemePlatform, string> = {
  ios: "iOS",
  android: "AND",
};

const purchaseModeLabelMap: Record<PurchaseMode, string> = {
  single: "개별 구매",
  set: "세트 구매",
};

export default function ThemePurchaseBox({
  type,
  price,
  setPrice,
  setBonusCount = 0,
  platforms,
  versions = [],
}: ThemePurchaseBoxProps) {
  const isFree = type === "free";
  const hasVersions = versions.length > 0;
  const hasSet = typeof setPrice === "number";

  const [selectedPlatform, setSelectedPlatform] = useState<ThemePlatform | "">(
    "",
  );
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode | "">("");
  const [selectedVersionValue, setSelectedVersionValue] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedPurchaseItem[]>(
    [],
  );

  const totalPrice = useMemo(() => {
    if (isFree) return 0;
    return selectedItems.reduce((sum, item) => sum + item.price, 0);
  }, [isFree, selectedItems]);

  const isPurchaseDisabled = useMemo(() => {
    if (!selectedPlatform) return true;

    if (isFree) {
      if (hasVersions) return selectedItems.length === 0;
      return false;
    }

    return selectedItems.length === 0;
  }, [hasVersions, isFree, selectedItems.length, selectedPlatform]);

  const handlePlatformChange = (value: string) => {
    setSelectedPlatform(value as ThemePlatform | "");
    setPurchaseMode("");
    setSelectedVersionValue("");
  };

  const handleAddSingleItem = (value: string) => {
    if (!selectedPlatform || !value) return;

    const pickedVersion = versions.find((version) => version.value === value);

    if (!pickedVersion) {
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
      price,
      versionValue: pickedVersion.value,
    };

    setSelectedItems((prev) => [...prev, nextItem]);
    setSelectedVersionValue("");
  };

  const handleAddSetItem = (platform: ThemePlatform) => {
    if (!hasSet || typeof setPrice !== "number") return;

    const itemKey = `${platform}-set`;

    const alreadyAdded = selectedItems.some((item) => item.key === itemKey);

    if (alreadyAdded) {
      window.alert("이미 선택한 기종의 세트 상품이 담겨 있어요!");
      setPurchaseMode("");
      return;
    }

    const versionCount = versions.length;
    const subtitle =
      versionCount > 0
        ? `${versionCount}종 구매${
            setBonusCount > 0 ? ` + 증정 ${setBonusCount}종` : ""
          }`
        : undefined;

    const nextItem: SelectedPurchaseItem = {
      key: itemKey,
      platform,
      purchaseMode: "set",
      title: `[${platformLabelMap[platform]}] 세트 구매`,
      subtitle,
      price: setPrice,
    };

    setSelectedItems((prev) => [...prev, nextItem]);
    setPurchaseMode("");
    setSelectedVersionValue("");
  };

  const handlePurchaseModeChange = (value: string) => {
    const nextMode = value as PurchaseMode | "";

    setPurchaseMode(nextMode);
    setSelectedVersionValue("");

    if (!selectedPlatform || !nextMode) return;

    if (nextMode === "set") {
      handleAddSetItem(selectedPlatform);
    }
  };

  const handleRemoveItem = (key: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.key !== key));
  };

  return (
    <div className={styles.box}>
      <div className={styles.selectArea}>
        <select
          id="theme-platform"
          className={`${styles.select} ${
            !selectedPlatform ? styles.placeholderSelect : ""
          }`}
          value={selectedPlatform}
          onChange={(event) => handlePlatformChange(event.target.value)}
          aria-label="사용 기종 선택"
        >
          <option value="" disabled>
            사용 기종
          </option>
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platformLabelMap[platform]}
            </option>
          ))}
        </select>
      </div>

      {!isFree && hasSet && (
        <div className={styles.selectArea}>
          <select
            id="purchase-mode"
            className={`${styles.select} ${
              !purchaseMode ? styles.placeholderSelect : ""
            }`}
            value={purchaseMode}
            onChange={(event) => handlePurchaseModeChange(event.target.value)}
            aria-label="구매 방식 선택"
            disabled={!selectedPlatform}
          >
            <option value="" disabled>
              구매 방식
            </option>
            <option value="single">{purchaseModeLabelMap.single}</option>
            <option value="set">{purchaseModeLabelMap.set}</option>
          </select>
        </div>
      )}

      {hasVersions && (isFree || purchaseMode === "single") && (
        <div className={styles.selectArea}>
          <select
            id="theme-version"
            className={`${styles.select} ${
              !selectedVersionValue ? styles.placeholderSelect : ""
            }`}
            value={selectedVersionValue}
            onChange={(event) => {
              const value = event.target.value;
              setSelectedVersionValue(value);
              handleAddSingleItem(value);
            }}
            aria-label="버전 선택"
            disabled={!selectedPlatform}
          >
            <option value="" disabled>
              버전 선택
            </option>
            {versions.map((version) => (
              <option key={version.value} value={version.value}>
                {version.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className={styles.selectedListBox}>
          <ul className={styles.selectedList}>
            {selectedItems.map((item) => (
              <li key={item.key} className={styles.selectedItem}>
                <div className={styles.selectedItemInfo}>
                  <span className={styles.selectedItemName}>{item.title}</span>
                  {item.subtitle && (
                    <span className={styles.selectedItemSub}>
                      {item.subtitle}
                    </span>
                  )}
                  {!isFree && (
                    <strong className={styles.selectedItemPrice}>
                      <span className={styles.itemCurrency}>₩</span>
                      {item.price.toLocaleString()}
                    </strong>
                  )}
                </div>

                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemoveItem(item.key)}
                  aria-label={`${item.title} 삭제`}
                >
                  <X size={16} strokeWidth={2.2} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(isFree || selectedItems.length > 0) && (
        <div className={styles.priceRow}>
          {isFree ? (
            <strong className={styles.freeText}>무료 다운로드</strong>
          ) : (
            <strong className={styles.price}>
              <span className={styles.currency}>₩</span>
              {totalPrice.toLocaleString()}
            </strong>
          )}
        </div>
      )}

      <button
        type="button"
        className={styles.primaryButton}
        disabled={isPurchaseDisabled}
      >
        {isFree ? "무료 다운로드" : "구매하기"}
      </button>
    </div>
  );
}
