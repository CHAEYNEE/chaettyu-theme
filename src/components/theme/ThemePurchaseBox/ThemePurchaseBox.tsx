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
  purchasedItemKeys?: string[];
  downloadedItemKeys?: string[];
};

const platformLabelMap: Record<ThemePlatform, string> = {
  ios: "iOS",
  android: "AND",
};

export default function ThemePurchaseBox({
  theme,
  onPrimaryAction,
  purchasedItemKeys = [],
  downloadedItemKeys = [],
}: ThemePurchaseBoxProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<ThemePlatform | "">(
    "",
  );
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode | "">("");
  const [selectedVersionValue, setSelectedVersionValue] = useState("");
  const [selectedItems, setSelectedItems] = useState<ThemePurchaseLineItem[]>(
    [],
  );

  const purchasedKeySet = useMemo(
    () => new Set(purchasedItemKeys),
    [purchasedItemKeys],
  );
  const downloadedKeySet = useMemo(
    () => new Set(downloadedItemKeys),
    [downloadedItemKeys],
  );

  const isPurchasedItem = (item: ThemePurchaseLineItem) => {
    if (purchasedKeySet.has(item.key)) {
      return true;
    }

    if (
      item.purchaseMode === "single" &&
      purchasedKeySet.has(`${item.platform}-set`)
    ) {
      return true;
    }

    return false;
  };

  const isDownloadedItem = (item: ThemePurchaseLineItem) => {
    if (downloadedKeySet.has(item.key)) {
      return true;
    }

    if (
      item.purchaseMode === "single" &&
      downloadedKeySet.has(`${item.platform}-set`)
    ) {
      return true;
    }

    return false;
  };

  const resolvedVersions: ThemeVersion[] =
    theme.versions && theme.versions.length > 0
      ? theme.versions
      : [{ label: "기본 버전", value: "default" }];

  const isFree = theme.type === "free";

  const hasSet =
    resolvedVersions.length > 1 &&
    (isFree || typeof theme.setPrice === "number");

  const payableItems = isFree
    ? selectedItems
    : selectedItems.filter((item) => !isPurchasedItem(item));

  const totalPrice = useMemo(() => {
    return payableItems.reduce((sum, item) => sum + item.price, 0);
  }, [payableItems]);

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

  const allSelectedPurchased =
    !isFree &&
    selectedItems.length > 0 &&
    selectedItems.every((item) => isPurchasedItem(item));

  const someSelectedPurchased =
    !isFree &&
    selectedItems.length > 0 &&
    selectedItems.some((item) => isPurchasedItem(item)) &&
    !allSelectedPurchased;

  const allSelectedDownloaded =
    isFree &&
    selectedItems.length > 0 &&
    selectedItems.every((item) => isDownloadedItem(item));

  const someSelectedDownloaded =
    isFree &&
    selectedItems.length > 0 &&
    selectedItems.some((item) => isDownloadedItem(item)) &&
    !allSelectedDownloaded;

  const primaryButtonLabel = useMemo(() => {
    if (isFree) {
      if (allSelectedDownloaded) {
        return "다시 다운로드";
      }

      if (someSelectedDownloaded) {
        return "선택한 구성 다운로드";
      }

      return "다운로드";
    }

    if (allSelectedPurchased) {
      return "이미 보유한 구성";
    }

    if (someSelectedPurchased) {
      return "새 구성만 구매하기";
    }

    return "구매하기";
  }, [
    allSelectedDownloaded,
    allSelectedPurchased,
    isFree,
    someSelectedDownloaded,
    someSelectedPurchased,
  ]);

  const isPrimaryDisabled =
    selectedItems.length === 0 || (!isFree && allSelectedPurchased);

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

    const alreadyPurchasedSet = !isFree && purchasedKeySet.has(itemKey);

    if (alreadyPurchasedSet) {
      window.alert("이미 해당 기종 세트를 보유 중이에요!");
      return;
    }

    const alreadyDownloadedSet = isFree && downloadedKeySet.has(itemKey);

    if (alreadyDownloadedSet) {
      window.alert("이미 받은 세트 구성이에요!");
      return;
    }

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

    const alreadyPurchasedSingle =
      !isFree &&
      (purchasedKeySet.has(itemKey) ||
        purchasedKeySet.has(`${selectedPlatform}-set`));

    if (alreadyPurchasedSingle) {
      window.alert(
        "이미 해당 기종 세트를 보유 중이거나, 이미 구매한 버전이에요!",
      );
      setSelectedVersionValue("");
      return;
    }

    const alreadyDownloadedSingle =
      isFree &&
      (downloadedKeySet.has(itemKey) ||
        downloadedKeySet.has(`${selectedPlatform}-set`));

    if (alreadyDownloadedSingle) {
      window.alert("이미 받은 구성이에요!");
      setSelectedVersionValue("");
      return;
    }

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
    if (isPrimaryDisabled) {
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
            {selectedItems.map((item) => {
              const isPurchased = isPurchasedItem(item);
              const isDownloaded = isDownloadedItem(item);

              return (
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

                    <div className={styles.badgeRow}>
                      {!isFree && isPurchased ? (
                        <span className={styles.ownedBadge}>보유 중</span>
                      ) : null}

                      {isFree && isDownloaded ? (
                        <span className={styles.downloadedBadge}>
                          다운로드 완료
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {isFree ? (
                    isDownloaded ? (
                      <span className={styles.downloadedText}>
                        다시 받을 수 있어요
                      </span>
                    ) : (
                      <span className={styles.freeItemBadge}>FREE</span>
                    )
                  ) : isPurchased ? (
                    <span className={styles.ownedText}>이미 보유</span>
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
              );
            })}
          </ul>

          <div className={styles.priceRow}>
            {isFree ? (
              <div className={styles.summaryBox}>
                <strong className={styles.freeSummaryText}>
                  {selectedItems.length}개 선택됨
                </strong>

                {allSelectedDownloaded ? (
                  <p className={styles.helperText}>
                    이미 받은 구성이에요. 다시 다운로드할 수 있어요.
                  </p>
                ) : someSelectedDownloaded ? (
                  <p className={styles.helperText}>
                    새 구성과 기존 구성이 함께 선택되어 있어요.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className={styles.summaryBox}>
                <strong className={styles.price}>
                  <span className={styles.priceValue}>
                    {totalPrice.toLocaleString()}
                  </span>
                  <span className={styles.priceUnit}>원</span>
                </strong>

                {allSelectedPurchased ? (
                  <p className={styles.helperText}>
                    선택한 구성은 모두 이미 보유 중이에요.
                  </p>
                ) : someSelectedPurchased ? (
                  <p className={styles.helperText}>
                    보유 중인 구성을 제외한 새 구성만 계산돼요.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.primaryButton}
        onClick={handlePrimaryAction}
        disabled={isPrimaryDisabled}
      >
        {primaryButtonLabel}
      </button>
    </div>
  );
}
