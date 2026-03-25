"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import BoardLayout from "@/components/layout/BoardLayout/BoardLayout";
import type { MockUser } from "@/types/mockUser";
import {
  getMockUser,
  sanitizeRedirectPath,
  setMockUser,
} from "@/lib/auth/mockAuthStorage";

import styles from "./login.module.css";

type LoginPageClientProps = {
  redirect: string;
};

export default function LoginPageClient({ redirect }: LoginPageClientProps) {
  const router = useRouter();

  const safeRedirect = useMemo(
    () => sanitizeRedirectPath(redirect),
    [redirect],
  );

  const [nickname, setNickname] = useState("채뜌");
  const [email, setEmail] = useState("chae@example.com");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentUser = getMockUser();

    if (currentUser) {
      router.replace(safeRedirect);
    }
  }, [router, safeRedirect]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedNickname = nickname.trim();

    if (!trimmedEmail) return;

    setIsSubmitting(true);

    const nextUser: MockUser = {
      id: crypto.randomUUID(),
      email: trimmedEmail,
      nickname: trimmedNickname || trimmedEmail.split("@")[0] || "게스트",
      provider: "mock",
      createdAt: new Date().toISOString(),
    };

    setMockUser(nextUser);
    router.replace(safeRedirect);
  };

  return (
    <BoardLayout badgeText="채뜌" pillText="Mock Login">
      <div className={styles.wrap}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>WELCOME BACK</p>
          <h1 className={styles.title}>로그인</h1>
          <p className={styles.description}>
            지금은 mock 로그인 단계야.
            <br />
            로그인하면 원래 보던 페이지로 다시 돌아가도록 연결해둘게.
          </p>
        </div>

        <section className={styles.card}>
          <div className={styles.cardTop}>
            <h2 className={styles.cardTitle}>테스트 계정으로 입장</h2>
            <p className={styles.cardSub}>
              현재 redirect 경로:
              <span className={styles.redirectPath}>{safeRedirect}</span>
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span className={styles.label}>닉네임</span>
              <input
                className={styles.input}
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="채뜌"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>이메일</span>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="chae@example.com"
                required
              />
            </label>

            <div className={styles.actions}>
              <button
                className={styles.primaryButton}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "로그인 중..." : "로그인하기"}
              </button>

              <Link className={styles.secondaryButton} href={safeRedirect}>
                돌아가기
              </Link>
            </div>
          </form>

          <div className={styles.helperBox}>
            <p>
              지금 단계에서는 서버 인증 없이 localStorage에 사용자 정보를
              저장해.
            </p>
            <p>
              나중에 Firebase / Supabase / 실제 인증으로 갈아끼울 때는
              mockAuthStorage 쪽만 바꾸면 돼.
            </p>
          </div>
        </section>
      </div>
    </BoardLayout>
  );
}
