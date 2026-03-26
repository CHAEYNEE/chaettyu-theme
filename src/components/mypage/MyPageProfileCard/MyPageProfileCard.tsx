import Image from "next/image";

import type { MockUser } from "@/types/mockUser";

import styles from "./MyPageProfileCard.module.css";

type MyPageProfileCardProps = {
  user: MockUser;
};

export default function MyPageProfileCard({ user }: MyPageProfileCardProps) {
  return (
    <section className={styles.card}>
      <div className={styles.profileRow}>
        <div className={styles.imageWrap}>
          {user.profileImage ? (
            <Image
              src={user.profileImage}
              alt={`${user.nickname} 프로필 이미지`}
              fill
              sizes="96px"
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
    </section>
  );
}
