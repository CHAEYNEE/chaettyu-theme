import type { ReactNode } from "react";

import AdminBoardLayout from "@/components/layout/AdminBoardLayout/AdminBoardLayout";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requireAdmin({ redirectTo: "/admin" });

  return <AdminBoardLayout>{children}</AdminBoardLayout>;
}
