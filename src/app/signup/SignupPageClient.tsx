"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import BoardLayout from "@/components/layout/BoardLayout/BoardLayout";
import { useToast } from "@/components/common/Toast/ToastProvider";
import { sanitizeRedirectPath } from "@/lib/auth/mockAuthStorage";
import { supabaseClient } from "@/lib/supabase/client";

import styles from "./signup.module.css";

type SignupPageClientProps = {
  redirect: string;
};

function normalizeLoginId(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_-]/g, "");
}

export default function SignupPageClient({ redirect }: SignupPageClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const safeRedirect = useMemo(
    () => sanitizeRedirectPath(redirect),
    [redirect],
  );

  const [loginId, setLoginId] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!isMounted) return;

      if (user) {
        router.replace(safeRedirect);
      }
    };

    checkUser();

    return () => {
      isMounted = false;
    };
  }, [router, safeRedirect]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedLoginId = normalizeLoginId(loginId.trim());
    const trimmedNickname = nickname.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedPasswordConfirm = passwordConfirm.trim();

    if (!trimmedLoginId || !trimmedNickname || !trimmedEmail) {
      const message = "아이디, 닉네임, 이메일을 모두 입력해 주세요.";
      setErrorMessage(message);
      showToast(message, { type: "error" });
      return;
    }

    if (trimmedLoginId.length < 4) {
      const message = "아이디는 4자 이상으로 입력해 주세요.";
      setErrorMessage(message);
      showToast(message, { type: "error" });
      return;
    }

    if (trimmedPassword.length < 6) {
      const message = "비밀번호는 6자 이상으로 입력해 주세요.";
      setErrorMessage(message);
      showToast(message, { type: "error" });
      return;
    }

    if (trimmedPassword !== trimmedPasswordConfirm) {
      const message = "비밀번호 확인이 일치하지 않아요.";
      setErrorMessage(message);
      showToast(message, { type: "error" });
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const { error } = await supabaseClient.auth.signUp({
      email: trimmedEmail,
      password: trimmedPassword,
      options: {
        data: {
          login_id: trimmedLoginId,
          nickname: trimmedNickname,
        },
      },
    });

    if (error) {
      setIsSubmitting(false);

      const rawMessage = (error.message ?? "").toLowerCase();

      console.error("signup error:", error);
      console.error("signup error message:", error.message);

      let message = "회원가입 중 문제가 생겼어요.";

      if (rawMessage.includes("email rate limit exceeded")) {
        message = "인증 메일 요청이 너무 많아요. 잠시 후 다시 시도해 주세요.";
      } else if (
        rawMessage.includes("already registered") ||
        rawMessage.includes("already exists") ||
        rawMessage.includes("user already registered")
      ) {
        message = "이미 가입된 이메일이에요.";
      } else if (
        rawMessage.includes("profiles_login_id_unique") ||
        rawMessage.includes("duplicate key value violates unique constraint") ||
        rawMessage.includes("duplicate key") ||
        rawMessage.includes("duplicate")
      ) {
        message = "이미 사용 중인 아이디예요.";
      } else if (
        rawMessage.includes("invalid email") ||
        rawMessage.includes("email address is invalid")
      ) {
        message = "이메일 형식을 다시 확인해 주세요.";
      } else if (
        rawMessage.includes("password should be at least") ||
        rawMessage.includes("weak password")
      ) {
        message = "비밀번호 형식을 다시 확인해 주세요.";
      } else if (
        rawMessage.includes("database error saving new user") ||
        rawMessage.includes("unexpected_failure")
      ) {
        message =
          "회원가입은 시도됐지만 프로필 저장 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.";
      }

      setErrorMessage(message);
      showToast(message, { type: "error" });
      return;
    }

    showToast("회원가입이 완료되었어요! 로그인해 주세요.", {
      type: "success",
    });

    window.setTimeout(() => {
      router.replace(`/login?redirect=${encodeURIComponent(safeRedirect)}`);
      router.refresh();
    }, 180);
  };

  return (
    <BoardLayout badgeText="채뜌">
      <section className={styles.wrapper}>
        <section className={styles.signupCard}>
          <div className={styles.cardHeader}>
            <span className={styles.formBadge}>SIGN UP</span>
            <p className={styles.guideText}>
              사용할 아이디와 이메일, 비밀번호를 입력해 주세요.
            </p>
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
              <span className={styles.hint}>
                영문 소문자, 숫자, 밑줄(_), 하이픈(-) 사용 가능
              </span>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>닉네임</span>
              <input
                className={styles.input}
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="닉네임을 입력해 주세요"
                autoComplete="nickname"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>이메일</span>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="이메일을 입력해 주세요"
                autoComplete="email"
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
                autoComplete="new-password"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>비밀번호 확인</span>
              <input
                className={styles.input}
                type="password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                placeholder="비밀번호를 한 번 더 입력해 주세요"
                autoComplete="new-password"
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
                {isSubmitting ? "가입 중..." : "회원가입하기"}
              </button>

              <Link
                className={styles.secondaryButton}
                href={`/login?redirect=${encodeURIComponent(safeRedirect)}`}
              >
                로그인으로
              </Link>
            </div>
          </form>
        </section>
      </section>
    </BoardLayout>
  );
}
