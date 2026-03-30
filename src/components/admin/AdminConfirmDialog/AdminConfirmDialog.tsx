"use client";

import { useEffect } from "react";

import styles from "./AdminConfirmDialog.module.css";

type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "default" | "danger";
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function AdminConfirmDialog({
  open,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  tone = "default",
  isLoading = false,
  onConfirm,
  onClose,
}: AdminConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isLoading, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      onClick={isLoading ? undefined : onClose}
      role="presentation"
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-dialog-title"
        aria-describedby="admin-confirm-dialog-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.badge} aria-hidden="true">
          !
        </div>

        <div className={styles.content}>
          <h3 id="admin-confirm-dialog-title" className={styles.title}>
            {title}
          </h3>
          <p
            id="admin-confirm-dialog-description"
            className={styles.description}
          >
            {description}
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={styles.cancelButton}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`${styles.confirmButton} ${
              tone === "danger" ? styles.confirmDanger : ""
            }`}
          >
            {isLoading ? "처리 중..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
