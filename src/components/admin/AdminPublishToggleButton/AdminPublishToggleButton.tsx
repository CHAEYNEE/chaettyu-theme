"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/common/Toast/ToastProvider";

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
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextIsPublished = status !== "published";
  const buttonLabel = status === "published" ? "비공개로 전환" : "공개로 전환";

  async function handleClick() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

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

      showToast(
        result?.message ??
          (nextIsPublished
            ? "테마를 공개했어요."
            : "테마를 비공개로 전환했어요."),
        { type: "success" },
      );

      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "발행 상태 변경에 실패했어요.",
        { type: "error" },
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
    </div>
  );
}
