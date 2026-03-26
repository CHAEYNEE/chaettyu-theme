"use client";

import { useEffect, useMemo } from "react";
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

import styles from "./MyPageClient.module.css";

export default function MyPageClient() {
  const router = useRouter();
  const { user, isLoaded } = useMockUser();

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

  const downloads = useMemo(() => {
    if (!user) return [];
    return getUserThemeDownloads(user.id);
  }, [user]);

  if (!isLoaded || !user) {
    return null;
  }

  const hasHistory = purchases.length > 0 || downloads.length > 0;

  return (
    <BoardLayout>
      <div className={styles.container}>
        <MyPageProfileCard user={user} />

        {hasHistory ? (
          <div className={styles.sections}>
            <MyPageHistorySection
              title="구매 내역"
              type="purchase"
              records={purchases}
              emptyText="아직 구매한 테마가 없어요."
            />

            <MyPageHistorySection
              title="다운로드 내역"
              type="download"
              records={downloads}
              emptyText="아직 다운로드한 무료 테마가 없어요."
            />
          </div>
        ) : (
          <MyPageEmptyState />
        )}
      </div>
    </BoardLayout>
  );
}
