"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./AdminPublishToggleButton.module.css";

type AdminPublishToggleButtonProps = {
  themeId: string;
  status: "published" | "draft";
};

type PublishResponse = {
  message?: string;
  error?: string;
  isPublished?: boolean;
};

export default function AdminPublishToggleButton({
  themeId,
  status,
}: AdminPublishToggleButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const nextIsPublished = status !== "published";
  const buttonLabel = status === "published" ? "비공개로 전환" : "공개로 전환";

  async function handleClick() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/themes/${themeId}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPublished: nextIsPublished,
        }),
      });

      const result = (await response
        .json()
        .catch(() => null)) as PublishResponse | null;

      if (!response.ok) {
        throw new Error(result?.error ?? "발행 상태 변경에 실패했어요.");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "발행 상태 변경에 실패했어요.",
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
        className={`${styles.button} ${
          status === "published" ? styles.buttonPublished : styles.buttonDraft
        }`}
      >
        {isSubmitting ? "변경 중..." : buttonLabel}
      </button>

      {errorMessage ? <p className={styles.errorText}>{errorMessage}</p> : null}
    </div>
  );
}
