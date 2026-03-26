import Image from "next/image";

import type { MockUser } from "@/types/mockUser";

import styles from "./MyPageProfileCard.module.css";

type MyPageProfileCardProps = {
  user: MockUser;
  purchaseCount: number;
  downloadCount: number;
  latestActivity: string | null;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export default function MyPageProfileCard({
  user,
  purchaseCount,
  downloadCount,
  latestActivity,
}: MyPageProfileCardProps) {
  return (
    <section className={styles.card}>
      <div className={styles.sticker}>MY</div>

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
          <span className={styles.statLabel}>구매</span>
          <strong className={styles.statValue}>{purchaseCount}</strong>
        </div>

        <div className={styles.statChip}>
          <span className={styles.statLabel}>다운로드</span>
          <strong className={styles.statValue}>{downloadCount}</strong>
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
