import type { ReactNode } from "react";

import AdminGuard from "@/components/auth/AdminGuard/AdminGuard";
import AdminBoardLayout from "@/components/layout/AdminBoardLayout/AdminBoardLayout";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <AdminBoardLayout>{children}</AdminBoardLayout>
    </AdminGuard>
  );
}
