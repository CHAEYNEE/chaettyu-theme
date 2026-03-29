"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useToast } from "@/components/common/Toast/ToastProvider";
import {
  addThemeDownload,
  getUserDownloadedLineItems,
} from "@/lib/storage/themeStorage";
import { buildThemeDownloadUrl } from "@/lib/theme/buildThemeDownloadUrl";
import type {
  ThemeDownloadRecord,
  ThemePurchaseLineItem,
  ThemePurchaseRecord,
} from "@/types/themeHistory";
import { formatDate } from "@/utils/formatDate";

import styles from "./MyPageHistorySection.module.css";

type MyPageRecord = ThemePurchaseRecord | ThemeDownloadRecord;

type MyPageHistorySectionProps = {
  type: "purchase" | "download";
  records: MyPageRecord[];
  emptyText: string;
};

type DownloadTarget = {
  fileName?: string;
  fileUrl: string;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price);
}

function isOwnedLineItem(
  targetItem: ThemePurchaseLineItem,
  ownedItems: ThemePurchaseLineItem[],
) {
  return ownedItems.some((ownedItem) => {
    if (ownedItem.key === targetItem.key) {
      return true;
    }

    if (ownedItem.platform !== targetItem.platform) {
      return false;
    }

    if (
      ownedItem.purchaseMode === "set" &&
      targetItem.purchaseMode === "single"
    ) {
      return true;
    }

    return false;
  });
}

function hasDownloadedAllItems(
  userId: string,
  themeId: string,
  items: ThemePurchaseLineItem[],
) {
  if (items.length === 0) {
    return false;
  }

  const downloadedItems = getUserDownloadedLineItems(userId, themeId);

  return items.every((item) => isOwnedLineItem(item, downloadedItems));
}

function getDownloadTargets(record: MyPageRecord): DownloadTarget[] {
  const fileNameQueue = [...(record.downloadFileNames ?? [])];

  return record.items.map((item) => {
    const fileUrl = buildThemeDownloadUrl({
      themeId: record.themeId,
      platform: item.platform,
      purchaseMode: item.purchaseMode,
      versionValue: item.versionValue,
    });

    const fallbackFileName =
      item.purchaseMode === "set"
        ? `${record.themeId}-${item.platform}-set`
        : `${record.themeId}-${item.platform}-${item.versionValue ?? "default"}`;

    return {
      fileUrl,
      fileName: fileNameQueue.shift() ?? fallbackFileName,
    };
  });
}

function startDownloads(files: DownloadTarget[]) {
  files.forEach((file, index) => {
    window.setTimeout(() => {
      const link = document.createElement("a");
      link.href = file.fileUrl;
      link.rel = "noopener";

      if (file.fileName) {
        link.download = file.fileName;
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, index * 120);
  });
}

function HistoryItemChips({ items }: { items: ThemePurchaseLineItem[] }) {
  return (
    <ul className={styles.itemList}>
      {items.map((item) => (
        <li key={item.key} className={styles.itemChip}>
          <span className={styles.itemTitle}>{item.title}</span>

          {item.subtitle ? (
            <span className={styles.itemSub}>{item.subtitle}</span>
          ) : null}

          {item.versionValue ? (
            <span className={styles.itemMeta}>{item.versionValue}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default function MyPageHistorySection({
  type,
  records,
  emptyText,
}: MyPageHistorySectionProps) {
  const { showToast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [downloadingRecordId, setDownloadingRecordId] = useState<string | null>(
    null,
  );

  const handleRecordDownload = (record: MyPageRecord) => {
    if (record.items.length === 0) {
      showToast("다운로드할 구성을 찾지 못했어요.", {
        type: "error",
      });
      return;
    }

    const files = getDownloadTargets(record);

    if (files.length === 0) {
      showToast("다운로드할 파일을 찾지 못했어요.", {
        type: "error",
      });
      return;
    }

    const wasRedownload = hasDownloadedAllItems(
      record.userId,
      record.themeId,
      record.items,
    );

    setDownloadingRecordId(record.id);
    startDownloads(files);

    addThemeDownload({
      userId: record.userId,
      theme: {
        id: record.themeId,
        title: record.themeTitle,
        thumbnail: record.themeThumbnail,
        type: record.themeType,
        downloadFileName: record.downloadFileName,
        downloadFileNames: record.downloadFileNames,
      },
      items: record.items,
    });

    showToast(
      wasRedownload
        ? "이미 받은 구성이에요. 다시 다운로드했어요!"
        : "다운로드가 완료되었어요!",
      {
        type: "success",
      },
    );

    window.setTimeout(
      () => {
        setDownloadingRecordId(null);
        setRefreshKey((prev) => prev + 1);
      },
      files.length * 120 + 200,
    );
  };

  if (records.length === 0) {
    return (
      <div className={styles.emptyBox}>
        <p className={styles.emptyTitle}>
          {type === "purchase"
            ? "아직 비어 있는 구매 보관함"
            : "아직 비어 있는 다운로드 보관함"}
        </p>
        <p className={styles.emptyText}>{emptyText}</p>
      </div>
    );
  }

  return (
    <ul className={styles.recordList}>
      {records.map((record) => {
        const isPurchase = "purchasedAt" in record;
        const dateText = formatDate(
          isPurchase ? record.purchasedAt : record.downloadedAt,
        );
        const isRedownload = hasDownloadedAllItems(
          record.userId,
          record.themeId,
          record.items,
        );
        const isDownloading = downloadingRecordId === record.id;
        const actionLabel = isRedownload ? "다시 다운로드" : "다운로드";

        return (
          <li key={`${record.id}-${refreshKey}`}>
            <article className={styles.recordCard}>
              <div className={styles.recordTop}>
                <span className={styles.statusBadge}>
                  {isPurchase ? "구매 완료" : "무료 다운로드"}
                </span>
                <span className={styles.recordDate}>{dateText}</span>
              </div>

              <div className={styles.recordBody}>
                <div className={styles.thumbnailWrap}>
                  <Image
                    src={record.themeThumbnail}
                    alt={record.themeTitle}
                    fill
                    sizes="92px"
                    className={styles.thumbnail}
                    unoptimized
                  />
                </div>

                <div className={styles.recordContent}>
                  <Link
                    href={`/themes/${record.themeId}`}
                    className={styles.themeLink}
                  >
                    {record.themeTitle}
                  </Link>

                  <HistoryItemChips items={record.items} />
                </div>

                <div className={styles.recordSide}>
                  {isPurchase ? (
                    <div className={styles.sideStack}>
                      <p className={styles.priceText}>
                        {formatPrice(record.totalPrice)}원
                      </p>

                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => handleRecordDownload(record)}
                        disabled={isDownloading}
                      >
                        {isDownloading ? "다운로드 중..." : actionLabel}
                      </button>
                    </div>
                  ) : (
                    <div className={styles.sideStack}>
                      <span className={styles.freePill}>보관 완료</span>

                      <Link
                        href={`/themes/${record.themeId}`}
                        className={styles.actionButton}
                      >
                        상세에서 다운로드
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
