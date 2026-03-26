import Image from "next/image";
import Link from "next/link";

import type {
  ThemeDownloadRecord,
  ThemePurchaseLineItem,
  ThemePurchaseRecord,
} from "@/types/themeHistory";

import styles from "./MyPageHistorySection.module.css";

type MyPageRecord = ThemePurchaseRecord | ThemeDownloadRecord;

type MyPageHistorySectionProps = {
  type: "purchase" | "download";
  records: MyPageRecord[];
  emptyText: string;
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateString));
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price);
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
                    <p className={styles.priceText}>
                      {formatPrice(record.totalPrice)}원
                    </p>
                  ) : (
                    <span className={styles.freePill}>보관 완료</span>
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
