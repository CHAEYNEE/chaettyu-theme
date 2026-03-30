"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { signOutUser } from "@/lib/auth/signOutUser";
import type { AuthUser } from "@/types/authUser";
import { formatDate } from "@/utils/formatDate";

import styles from "./MyPageProfileCard.module.css";

type MyPageProfileCardProps = {
  user: AuthUser;
  purchaseCount: number;
  ownedThemeCount: number;
  latestActivity: string | null;
};

export default function MyPageProfileCard({
  user,
  purchaseCount,
  ownedThemeCount,
  latestActivity,
}: MyPageProfileCardProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOutUser();
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("logout failed:", error);
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.topActions}>
        <div className={styles.sticker}>MY</div>

        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>

      <div className={styles.profileRow}>
        <div className={styles.imageWrap}>
          {user.profileImage ? (
            <Image
              src={user.profileImage}
              alt={`${user.nickname} 프로필 이미지`}
              fill
              sizes="100px"
              className={styles.image}
            />
          ) : (
            <div className={styles.fallback}>{user.nickname.slice(0, 2)}</div>
          )}
        </div>

        <div className={styles.textGroup}>
          <p className={styles.eyebrow}>MY PAGE</p>
          <h1 className={styles.name}>{user.nickname}</h1>
          <p className={styles.meta}>@{user.loginId}</p>
          <p className={styles.meta}>{user.email}</p>
        </div>
      </div>

      <div className={styles.statGrid}>
        <div className={styles.statChip}>
          <span className={styles.statLabel}>구매 횟수</span>
          <strong className={styles.statValue}>{purchaseCount}</strong>
        </div>

        <div className={styles.statChip}>
          <span className={styles.statLabel}>보유 테마</span>
          <strong className={styles.statValue}>{ownedThemeCount}</strong>
        </div>

        <div className={styles.statChip}>
          <span className={styles.statLabel}>최근 활동</span>
          <strong className={styles.statValue}>
            {latestActivity ? formatDate(latestActivity) : "-"}
          </strong>
        </div>
      </div>
    </section>
  );
}
