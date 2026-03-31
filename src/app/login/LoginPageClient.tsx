"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import BoardLayout from "@/components/layout/BoardLayout/BoardLayout";
import { useToast } from "@/components/common/Toast/ToastProvider";
import { sanitizeRedirectPath } from "@/lib/auth/authStorage";
import { supabaseClient } from "@/lib/supabase/client";

import styles from "./login.module.css";

type LoginPageClientProps = {
  redirect: string;
};

function normalizeLoginId(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_-]/g, "");
}

export default function LoginPageClient({ redirect }: LoginPageClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const safeRedirect = useMemo(
    () => sanitizeRedirectPath(redirect),
    [redirect],
  );

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedLoginId = normalizeLoginId(loginId.trim());
    const trimmedPassword = password.trim();

    if (!trimmedLoginId || !trimmedPassword) {
      const message = "아이디와 비밀번호를 입력해 주세요.";
      setErrorMessage(message);
      showToast(message, { type: "error" });
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const resolveResponse = await fetch("/api/auth/resolve-login-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loginId: trimmedLoginId,
        }),
      });

      const resolveResult = (await resolveResponse.json()) as {
        email?: string;
        error?: string;
      };

      if (!resolveResponse.ok || !resolveResult.email) {
        throw new Error(
          resolveResult.error || "아이디 또는 비밀번호가 올바르지 않아요.",
        );
      }

      const { error } = await supabaseClient.auth.signInWithPassword({
        email: resolveResult.email,
        password: trimmedPassword,
      });

      if (error) {
        throw new Error("아이디 또는 비밀번호가 올바르지 않아요.");
      }

      showToast("로그인되었어요!", { type: "success" });

      router.replace(safeRedirect);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "로그인 중 문제가 생겼어요.";

      setErrorMessage(message);
      showToast(message, { type: "error" });
      setIsSubmitting(false);
    }
  };

  return (
    <BoardLayout badgeText="채뜌">
      <section className={styles.wrapper}>
        <section className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <span className={styles.formBadge}>LOGIN</span>

            <div className={styles.testAccountList}>
              <p className={styles.testAccount}>테스트용 관리자 계정</p>
              <p className={styles.testAccount}>
                아이디 : <strong>chaettyu</strong>
              </p>
              <p className={styles.testAccount}>
                비밀번호 : <strong>123456</strong>
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
                onChange={(event) =>
                  setLoginId(normalizeLoginId(event.target.value))
                }
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

            <Link
              className={styles.signupButton}
              href={`/signup?redirect=${encodeURIComponent(safeRedirect)}`}
            >
              회원가입하기
            </Link>
          </form>
        </section>
      </section>
    </BoardLayout>
  );
}
