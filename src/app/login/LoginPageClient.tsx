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

const MOCK_LOGIN_ID = "chaettyu";
const MOCK_LOGIN_PASSWORD = "1234";

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

    if (
      trimmedLoginId !== MOCK_LOGIN_ID ||
      trimmedPassword !== MOCK_LOGIN_PASSWORD
    ) {
      setErrorMessage("아이디 또는 비밀번호가 올바르지 않아요.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const nextUser: MockUser = {
      id: "mock-user-1",
      email: "chae@example.com",
      nickname: "채뜌",
      provider: "mock",
      createdAt: new Date().toISOString(),
    };

    setMockUser(nextUser);
    router.replace(safeRedirect);
  };

  return (
    <BoardLayout badgeText="채뜌" pillText="Theme Login">
      <section className={styles.wrapper}>
        <section className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <span className={styles.formBadge}>LOGIN</span>
            <p className={styles.testAccount}>
              테스트 계정 · ID : chaettyu / PW : 1234
            </p>
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
