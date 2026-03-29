"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import BoardLayout from "@/components/layout/BoardLayout/BoardLayout";
import MyPageEmptyState from "@/components/mypage/MyPageEmptyState/MyPageEmptyState";
import MyPageHistorySection from "@/components/mypage/MyPageHistorySection/MyPageHistorySection";
import MyPageProfileCard from "@/components/mypage/MyPageProfileCard/MyPageProfileCard";
import useMockUser from "@/hooks/useMockUser";
import { fetchMyThemeHistory } from "@/lib/api/themeHistory";
import type {
  ThemeDownloadHistoryItem,
  ThemePurchaseHistoryItem,
} from "@/types/themeHistory";

import styles from "./MyPageClient.module.css";

type MyPageTab = "purchase" | "download";

function getLatestActivityDate(
  purchases: ThemePurchaseHistoryItem[],
  downloads: ThemeDownloadHistoryItem[],
) {
  const allDates = [
    ...purchases.map((record) => record.purchasedAt),
    ...downloads.map((record) => record.downloadedAt),
  ];

  if (allDates.length === 0) {
    return null;
  }

  return [...allDates].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  )[0];
}

export default function MyPageClient() {
  const router = useRouter();
  const { user, isLoaded } = useMockUser();

  const [selectedTab, setSelectedTab] = useState<MyPageTab | null>(null);
  const [purchaseRecords, setPurchaseRecords] = useState<
    ThemePurchaseHistoryItem[]
  >([]);
  const [downloadRecords, setDownloadRecords] = useState<
    ThemeDownloadHistoryItem[]
  >([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!user) {
      router.replace("/login?redirect=/mypage");
    }
  }, [isLoaded, router, user]);

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }

    let isMounted = true;

    const loadHistory = async () => {
      try {
        setIsHistoryLoading(true);

        const response = await fetchMyThemeHistory();

        if (!isMounted) {
          return;
        }

        setPurchaseRecords(response.purchases ?? []);
        setDownloadRecords(response.downloads ?? []);
      } catch (error) {
        console.error(error);

        if (!isMounted) {
          return;
        }

        setPurchaseRecords([]);
        setDownloadRecords([]);
      } finally {
        if (isMounted) {
          setIsHistoryLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, user]);

  const purchasedThemeIdSet = useMemo(() => {
    return new Set(purchaseRecords.map((record) => record.themeId));
  }, [purchaseRecords]);

  const downloads = useMemo(() => {
    return downloadRecords.filter((record) => {
      if (record.themeType) {
        return record.themeType === "free";
      }

      return !purchasedThemeIdSet.has(record.themeId);
    });
  }, [downloadRecords, purchasedThemeIdSet]);

  const ownedThemeCount = useMemo(() => {
    const ownedThemeIds = new Set([
      ...purchaseRecords.map((record) => record.themeId),
      ...downloads.map((record) => record.themeId),
    ]);

    return ownedThemeIds.size;
  }, [downloads, purchaseRecords]);

  if (!isLoaded || !user) {
    return null;
  }

  if (isHistoryLoading) {
    return (
      <BoardLayout>
        <div className={styles.container}>
          <MyPageProfileCard
            user={user}
            purchaseCount={0}
            ownedThemeCount={0}
            latestActivity={null}
          />
        </div>
      </BoardLayout>
    );
  }

  const hasHistory = purchaseRecords.length > 0 || downloads.length > 0;
  const latestActivity = getLatestActivityDate(purchaseRecords, downloads);

  const activeTab: MyPageTab =
    selectedTab ??
    (purchaseRecords.length === 0 && downloads.length > 0
      ? "download"
      : "purchase");

  const currentRecords = activeTab === "purchase" ? purchaseRecords : downloads;

  return (
    <BoardLayout>
      <div className={styles.container}>
        <MyPageProfileCard
          user={user}
          purchaseCount={purchaseRecords.length}
          ownedThemeCount={ownedThemeCount}
          latestActivity={latestActivity}
        />

        {hasHistory ? (
          <section className={styles.historyShell}>
            <div className={styles.historyHead}>
              <div className={styles.headingGroup}>
                <p className={styles.eyebrow}>THEME DRAWER</p>
                <h2 className={styles.title}>내 테마 보관함</h2>
              </div>

              <div className={styles.tabRow}>
                <button
                  type="button"
                  className={`${styles.tabButton} ${
                    activeTab === "purchase" ? styles.tabButtonActive : ""
                  }`}
                  onClick={() => setSelectedTab("purchase")}
                >
                  <span>구매한 테마</span>
                  <strong>{purchaseRecords.length}</strong>
                </button>

                <button
                  type="button"
                  className={`${styles.tabButton} ${
                    activeTab === "download" ? styles.tabButtonActive : ""
                  }`}
                  onClick={() => setSelectedTab("download")}
                >
                  <span>다운로드한 테마</span>
                  <strong>{downloads.length}</strong>
                </button>
              </div>
            </div>

            <MyPageHistorySection
              type={activeTab}
              records={currentRecords}
              emptyText={
                activeTab === "purchase"
                  ? "아직 구매한 테마가 없어요."
                  : "아직 다운로드한 무료 테마가 없어요."
              }
            />
          </section>
        ) : (
          <MyPageEmptyState />
        )}
      </div>
    </BoardLayout>
  );
}
