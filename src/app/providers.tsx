"use client";

import type { ReactNode } from "react";

import ToastProvider from "@/components/common/Toast/ToastProvider";
import { CartProvider } from "@/providers/CartProvider";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <ToastProvider>
      <CartProvider>{children}</CartProvider>
    </ToastProvider>
  );
}
