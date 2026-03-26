"use client";

import type { ReactNode } from "react";

import ToastProvider from "@/components/common/Toast/ToastProvider";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return <ToastProvider>{children}</ToastProvider>;
}
