"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import CustomDropdown, {
  type DropdownOption,
} from "@/components/common/CustomDropdown/CustomDropdown";
import type { ThemePurchaseLineItem } from "@/types/themeHistory";
import type {
  PurchaseMode,
  ThemeItem,
  ThemePlatform,
  ThemeVersion,
} from "@/types/theme";

import styles from "./ThemePurchaseBox.module.css";

type ThemePurchaseBoxProps = {
  theme: ThemeItem;
  onPrimaryAction?: (items: ThemePurchaseLineItem[]) => void;
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
  const [selectedItems, setSelectedItems] = useState<ThemePurchaseLineItem[]>(
    [],
  );

  const resolvedVersions: ThemeVersion[] =
    theme.versions && theme.versions.length > 0
      ? theme.versions
      : [{ label: "기본 버전", value: "default" }];

  const isFree = theme.type === "free";

  const hasSet =
    resolvedVersions.length > 1 &&
    (isFree || typeof theme.setPrice === "number");

  const totalPrice = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price, 0);
  }, [selectedItems]);

  const modeLabelMap: Record<PurchaseMode, string> = isFree
    ? {
        single: "개별 다운로드",
        set: "세트 다운로드",
      }
    : {
        single: "개별 구매",
        set: "세트 구매",
      };

  const platformOptions: DropdownOption[] = theme.platforms.map((platform) => ({
    label: platformLabelMap[platform],
    value: platform,
  }));

  const purchaseModeOptions: DropdownOption[] = [
    { label: modeLabelMap.single, value: "single" },
    ...(hasSet ? [{ label: modeLabelMap.set, value: "set" }] : []),
  ];

  const versionOptions: DropdownOption[] = resolvedVersions.map((version) => ({
    label: version.label,
    value: version.value,
  }));

  const createSetItem = (platform: ThemePlatform): ThemePurchaseLineItem => {
    const subtitle = isFree
      ? `${resolvedVersions.length}종 전체 다운로드`
      : `${resolvedVersions.length}종 구매${
          theme.setBonusCount ? ` + 증정 ${theme.setBonusCount}종` : ""
        }`;

    return {
      key: `${platform}-set`,
      platform,
      purchaseMode: "set",
      title: `[${platformLabelMap[platform]}] ${modeLabelMap.set}`,
      subtitle,
      price: isFree ? 0 : (theme.setPrice as number),
    };
  };

  const handlePlatformChange = (value: string) => {
    const nextPlatform = value as ThemePlatform | "";

    setSelectedPlatform(nextPlatform);
    setPurchaseMode("");
    setSelectedVersionValue("");
  };

  const handlePurchaseModeChange = (value: string) => {
    const nextMode = value as PurchaseMode | "";

    if (!selectedPlatform || !nextMode) {
      setPurchaseMode(nextMode);
      setSelectedVersionValue("");
      return;
    }

    const hasSetItemForPlatform = selectedItems.some(
      (item) =>
        item.platform === selectedPlatform && item.purchaseMode === "set",
    );

    if (nextMode === "single" && hasSetItemForPlatform) {
      window.alert(
        `이미 해당 기종의 ${modeLabelMap.set} 항목이 담겨 있어 ${modeLabelMap.single}은 선택할 수 없어요!`,
      );
      setPurchaseMode("");
      setSelectedVersionValue("");
      return;
    }

    setPurchaseMode(nextMode);
    setSelectedVersionValue("");

    if (nextMode === "set") {
      handleAddSetItem(selectedPlatform);
    }
  };

  const handleVersionChange = (value: string) => {
    setSelectedVersionValue(value);

    if (!value) {
      return;
    }

    handleAddSingleItem(value);
  };

  const handleAddSetItem = (platform: ThemePlatform) => {
    const itemKey = `${platform}-set`;

    const alreadyAdded = selectedItems.some((item) => item.key === itemKey);

    if (alreadyAdded) {
      window.alert(
        `이미 선택한 기종의 ${modeLabelMap.set} 항목이 담겨 있어요!`,
      );
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

    const pickedVersion = resolvedVersions.find(
      (version) => version.value === value,
    );

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
        `이미 해당 기종의 ${modeLabelMap.set} 항목이 담겨 있어 ${modeLabelMap.single}은 추가할 수 없어요!`,
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

    const nextItem: ThemePurchaseLineItem = {
      key: itemKey,
      platform: selectedPlatform,
      purchaseMode: "single",
      title: `[${platformLabelMap[selectedPlatform]}] ${pickedVersion.label}`,
      subtitle: modeLabelMap.single,
      price: isFree ? 0 : theme.price,
      versionValue: pickedVersion.value,
    };

    const nextItems = [...selectedItems, nextItem];

    const singleItemsForPlatform = nextItems.filter(
      (item) =>
        item.platform === selectedPlatform && item.purchaseMode === "single",
    );

    const shouldConvertToSet =
      hasSet && singleItemsForPlatform.length === resolvedVersions.length;

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

      window.alert(
        isFree
          ? "전 버전을 선택해서 세트 다운로드로 자동 전환됐어요!"
          : "전 버전을 선택해서 세트 구매로 자동 전환됐어요!",
      );
      return;
    }

    setSelectedItems(nextItems);
    setSelectedVersionValue("");
  };

  const handleRemoveItem = (key: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handlePrimaryAction = () => {
    if (selectedItems.length === 0) {
      return;
    }

    onPrimaryAction?.(selectedItems);
  };

  return (
    <div className={styles.box}>
      <div className={styles.selectArea}>
        <CustomDropdown
          value={selectedPlatform}
          placeholder="사용 기종"
          options={platformOptions}
          onChange={handlePlatformChange}
        />

        <CustomDropdown
          value={purchaseMode}
          placeholder={isFree ? "다운로드 방식" : "구매 방식"}
          options={purchaseModeOptions}
          onChange={handlePurchaseModeChange}
          disabled={!selectedPlatform}
        />

        {purchaseMode === "single" && (
          <CustomDropdown
            value={selectedVersionValue}
            placeholder={isFree ? "다운로드할 버전 선택" : "버전 선택"}
            options={versionOptions}
            onChange={handleVersionChange}
            disabled={!selectedPlatform}
          />
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

                {isFree ? (
                  <span className={styles.freeItemBadge}>FREE</span>
                ) : (
                  <div className={styles.selectedItemPrice}>
                    <span className={styles.selectedItemPriceValue}>
                      {item.price.toLocaleString()}
                    </span>
                    <span className={styles.selectedItemPriceUnit}>원</span>
                  </div>
                )}

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
            {isFree ? (
              <strong className={styles.freeSummaryText}>
                {selectedItems.length}개 선택됨
              </strong>
            ) : (
              <strong className={styles.price}>
                <span className={styles.priceValue}>
                  {totalPrice.toLocaleString()}
                </span>
                <span className={styles.priceUnit}>원</span>
              </strong>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.primaryButton}
        onClick={handlePrimaryAction}
        disabled={selectedItems.length === 0}
      >
        {isFree ? "다운로드" : "구매하기"}
      </button>
    </div>
  );
}
