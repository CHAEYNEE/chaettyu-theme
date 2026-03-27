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

const MOCK_ACCOUNTS = [
  {
    id: "mock-user-1",
    loginId: "chaettyu",
    password: "1234",
    email: "chae@example.com",
    nickname: "채뜌",
    profileImage: "/images/mock_profile.jpg",
    role: "user" as const,
  },
  {
    id: "mock-admin-1",
    loginId: "admin",
    password: "1234",
    email: "admin@chaettyu.theme",
    nickname: "관리자",
    profileImage: "/images/mock_profile.jpg",
    role: "admin" as const,
  },
];

export default function LoginPageClient({ redirect }: LoginPageClientProps) {
  const router = useRouter();

  const safeRedirect = useMemo(
    () => sanitizeRedirectPath(redirect),
    [redirect],
  );

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentUser = getMockUser();

    if (currentUser) {
      router.replace(safeRedirect);
    }
  }, [router, safeRedirect]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedLoginId = loginId.trim();
    const trimmedPassword = password.trim();

    if (!trimmedLoginId || !trimmedPassword) {
      setErrorMessage("아이디와 비밀번호를 입력해 주세요.");
      return;
    }

    const matchedAccount = MOCK_ACCOUNTS.find(
      (account) =>
        account.loginId === trimmedLoginId &&
        account.password === trimmedPassword,
    );

    if (!matchedAccount) {
      setErrorMessage("아이디 또는 비밀번호가 올바르지 않아요.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const nextUser: MockUser = {
      id: matchedAccount.id,
      loginId: matchedAccount.loginId,
      email: matchedAccount.email,
      nickname: matchedAccount.nickname,
      provider: "mock",
      createdAt: new Date().toISOString(),
      profileImage: matchedAccount.profileImage,
      role: matchedAccount.role,
    };

    setMockUser(nextUser);
    router.replace(safeRedirect);
  };

  return (
    <BoardLayout badgeText="채뜌">
      <section className={styles.wrapper}>
        <section className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <span className={styles.formBadge}>LOGIN</span>

            <div className={styles.testAccountList}>
              <p className={styles.testAccount}>
                일반 계정 · ID : chaettyu / PW : 1234
              </p>
              <p className={styles.testAccount}>
                관리자 계정 · ID : admin / PW : 1234
              </p>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span className={styles.label}>아이디</span>
              <input
                className={styles.input}
                type="text"
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
                placeholder="아이디를 입력해 주세요"
                autoComplete="username"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>비밀번호</span>
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호를 입력해 주세요"
                autoComplete="current-password"
              />
            </label>

            {errorMessage ? (
              <p className={styles.errorMessage}>{errorMessage}</p>
            ) : null}

            <div className={styles.buttonGroup}>
              <button
                className={styles.primaryButton}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "입장 중..." : "로그인하기"}
              </button>

              <Link className={styles.secondaryButton} href={safeRedirect}>
                돌아가기
              </Link>
            </div>
          </form>
        </section>
      </section>
    </BoardLayout>
  );
}
