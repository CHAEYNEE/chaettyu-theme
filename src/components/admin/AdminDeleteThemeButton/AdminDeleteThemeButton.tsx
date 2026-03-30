"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./AdminDeleteThemeButton.module.css";

type AdminDeleteThemeButtonProps = {
  themeId: string;
  themeTitle: string;
};

type DeleteResponse = {
  message?: string;
  error?: string;
};

export default function AdminDeleteThemeButton({
  themeId,
  themeTitle,
}: AdminDeleteThemeButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleClick() {
    if (isSubmitting) {
      return;
    }

    const confirmed = window.confirm(
      `"${themeTitle}" 테마를 삭제할까요?\n삭제 후 되돌릴 수 없어요.`,
    );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/themes/${themeId}/delete`, {
        method: "DELETE",
      });

      const result = (await response
        .json()
        .catch(() => null)) as DeleteResponse | null;

      if (!response.ok) {
        throw new Error(result?.error ?? "테마 삭제에 실패했어요.");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "테마 삭제에 실패했어요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isSubmitting}
        className={styles.button}
      >
        {isSubmitting ? "삭제 중..." : "삭제"}
      </button>

      {errorMessage ? <p className={styles.errorText}>{errorMessage}</p> : null}
    </div>
  );
}
