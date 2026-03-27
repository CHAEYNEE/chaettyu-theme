import type { ReactNode } from "react";

import AdminGuard from "@/components/auth/AdminGuard/AdminGuard";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminGuard>{children}</AdminGuard>;
}
