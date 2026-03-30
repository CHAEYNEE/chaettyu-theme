"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog/AdminConfirmDialog";
import { useToast } from "@/components/common/Toast/ToastProvider";

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
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function openDialog() {
    if (isSubmitting) {
      return;
    }

    setIsDialogOpen(true);
  }

  function closeDialog() {
    if (isSubmitting) {
      return;
    }

    setIsDialogOpen(false);
  }

  async function handleDelete() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

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

      setIsDialogOpen(false);

      showToast(result?.message ?? `"${themeTitle}" 테마를 삭제했어요.`, {
        type: "success",
      });

      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "테마 삭제에 실패했어요.",
        { type: "error" },
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className={styles.wrap}>
        <button
          type="button"
          onClick={openDialog}
          disabled={isSubmitting}
          className={styles.button}
        >
          {isSubmitting ? "삭제 중..." : "삭제"}
        </button>
      </div>

      <AdminConfirmDialog
        open={isDialogOpen}
        title="테마를 삭제할까요?"
        description={`"${themeTitle}" 테마를 삭제하면 되돌릴 수 없어요.`}
        confirmText="삭제하기"
        cancelText="취소"
        tone="danger"
        isLoading={isSubmitting}
        onConfirm={handleDelete}
        onClose={closeDialog}
      />
    </>
  );
}
