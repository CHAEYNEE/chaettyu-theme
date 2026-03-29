"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import BoardLayout from "@/components/layout/BoardLayout/BoardLayout";
import MyPageEmptyState from "@/components/mypage/MyPageEmptyState/MyPageEmptyState";
import MyPageHistorySection from "@/components/mypage/MyPageHistorySection/MyPageHistorySection";
import MyPageProfileCard from "@/components/mypage/MyPageProfileCard/MyPageProfileCard";
import useMockUser from "@/hooks/useMockUser";
import {
  getUserThemeDownloads,
  getUserThemePurchases,
} from "@/lib/storage/themeStorage";
import type {
  ThemeDownloadRecord,
  ThemePurchaseRecord,
} from "@/types/themeHistory";

import styles from "./MyPageClient.module.css";

type MyPageTab = "purchase" | "download";

function getLatestActivityDate(
  purchases: ThemePurchaseRecord[],
  downloads: ThemeDownloadRecord[],
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

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.replace("/login?redirect=/mypage");
    }
  }, [isLoaded, router, user]);

  const purchases = useMemo(() => {
    if (!user) return [];
    return getUserThemePurchases(user.id);
  }, [user]);

  const purchasedThemeIdSet = useMemo(() => {
    return new Set(purchases.map((record) => record.themeId));
  }, [purchases]);

  const downloads = useMemo(() => {
    if (!user) return [];

    return getUserThemeDownloads(user.id).filter((record) => {
      if ("themeType" in record && record.themeType) {
        return record.themeType === "free";
      }

      return !purchasedThemeIdSet.has(record.themeId);
    });
  }, [purchasedThemeIdSet, user]);

  const ownedThemeCount = useMemo(() => {
    const ownedThemeIds = new Set([
      ...purchases.map((record) => record.themeId),
      ...downloads.map((record) => record.themeId),
    ]);

    return ownedThemeIds.size;
  }, [downloads, purchases]);

  if (!isLoaded || !user) {
    return null;
  }

  const hasHistory = purchases.length > 0 || downloads.length > 0;
  const latestActivity = getLatestActivityDate(purchases, downloads);

  const activeTab: MyPageTab =
    selectedTab ??
    (purchases.length === 0 && downloads.length > 0 ? "download" : "purchase");

  const currentRecords = activeTab === "purchase" ? purchases : downloads;

  return (
    <BoardLayout>
      <div className={styles.container}>
        <MyPageProfileCard
          user={user}
          purchaseCount={purchases.length}
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
                  <strong>{purchases.length}</strong>
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
