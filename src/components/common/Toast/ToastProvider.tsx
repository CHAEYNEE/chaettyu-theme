"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import styles from "./ToastProvider.module.css";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
};

type ToastOptions = {
  type?: ToastType;
  duration?: number;
};

type ToastContextValue = {
  showToast: (message: string, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

type ToastProviderProps = {
  children: ReactNode;
};

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = ++idRef.current;

      const nextToast: ToastItem = {
        id,
        type: options?.type ?? "info",
        message,
        duration: options?.duration ?? 2200,
      };

      setToasts((prev) => [...prev, nextToast]);

      window.setTimeout(() => {
        removeToast(id);
      }, nextToast.duration);
    },
    [removeToast],
  );

  const value = useMemo(
    () => ({
      showToast,
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {toasts.length > 0 ? (
        <div className={styles.viewport} aria-live="polite" aria-atomic="true">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`${styles.toast} ${styles[toast.type]}`}
              role="status"
            >
              <div className={styles.icon} aria-hidden="true">
                {toast.type === "success" && "✓"}
                {toast.type === "error" && "!"}
                {toast.type === "info" && "i"}
              </div>

              <p className={styles.message}>{toast.message}</p>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => removeToast(toast.id)}
                aria-label="토스트 닫기"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
