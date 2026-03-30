"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useToast } from "@/components/common/Toast/ToastProvider";
import { buildThemeDownloadUrl } from "@/lib/theme/buildThemeDownloadUrl";
import type {
  ThemeDownloadHistoryItem,
  ThemePurchaseLineItem,
  ThemePurchaseHistoryItem,
} from "@/types/themeHistory";
import { formatDate } from "@/utils/formatDate";

import styles from "./MyPageHistorySection.module.css";

type MyPageRecord = ThemePurchaseHistoryItem | ThemeDownloadHistoryItem;

type MyPageHistorySectionProps = {
  type: "purchase" | "download";
  records: MyPageRecord[];
  emptyText: string;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price);
}

function getItemDownloadUrl(record: MyPageRecord, item: ThemePurchaseLineItem) {
  return buildThemeDownloadUrl({
    themeId: record.themeId,
    platform: item.platform,
    purchaseMode: item.purchaseMode,
    versionValue: item.versionValue,
  });
}

function getItemDownloadFileName(
  record: MyPageRecord,
  item: ThemePurchaseLineItem,
) {
  if (item.purchaseMode === "set") {
    return `${record.themeId}-${item.platform}-set`;
  }

  return `${record.themeId}-${item.platform}-${item.versionValue ?? "default"}`;
}

function startDownload(fileUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = fileUrl;
  link.rel = "noopener";
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function HistoryItemChips({
  record,
  isPurchase,
  downloadingKey,
  onDownload,
}: {
  record: MyPageRecord;
  isPurchase: boolean;
  downloadingKey: string | null;
  onDownload: (record: MyPageRecord, item: ThemePurchaseLineItem) => void;
}) {
  return (
    <ul className={styles.itemList}>
      {record.items.map((item) => {
        const itemKey = `${record.id}:${item.key}`;
        const isDownloading = downloadingKey === itemKey;

        return (
          <li key={item.key}>
            {isPurchase ? (
              <button
                type="button"
                className={styles.itemChipButton}
                onClick={() => onDownload(record, item)}
                disabled={isDownloading}
              >
                <span className={styles.itemTitle}>{item.title}</span>
                <span className={styles.itemSub}>
                  {isDownloading ? "다운로드 중..." : "다운로드"}
                </span>
              </button>
            ) : (
              <div className={styles.itemChip}>
                <span className={styles.itemTitle}>{item.title}</span>

                {item.subtitle ? (
                  <span className={styles.itemSub}>{item.subtitle}</span>
                ) : null}

                {item.versionValue ? (
                  <span className={styles.itemMeta}>{item.versionValue}</span>
                ) : null}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function MyPageHistorySection({
  type,
  records,
  emptyText,
}: MyPageHistorySectionProps) {
  const { showToast } = useToast();
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const handleItemDownload = (
    record: MyPageRecord,
    item: ThemePurchaseLineItem,
  ) => {
    const fileUrl = getItemDownloadUrl(record, item);
    const fileName = getItemDownloadFileName(record, item);
    const itemKey = `${record.id}:${item.key}`;

    setDownloadingKey(itemKey);
    startDownload(fileUrl, fileName);

    showToast(`${item.title} 다운로드를 시작했어요!`, {
      type: "success",
    });

    window.setTimeout(() => {
      setDownloadingKey((prev) => (prev === itemKey ? null : prev));
    }, 500);
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

        return (
          <li key={record.id}>
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

                  <HistoryItemChips
                    record={record}
                    isPurchase={isPurchase}
                    downloadingKey={downloadingKey}
                    onDownload={handleItemDownload}
                  />
                </div>

                <div className={styles.recordSide}>
                  {isPurchase ? (
                    <div className={styles.sideStack}>
                      <p className={styles.priceText}>
                        {formatPrice(record.totalPrice)}원
                      </p>
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
