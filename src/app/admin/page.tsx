import Link from "next/link";

import AdminShell from "@/components/admin/AdminShell/AdminShell";

export default function AdminPage() {
  return (
    <AdminShell
      title="관리자 페이지"
      description="테마 등록, 구매 내역, 회원 정보를 관리하는 공간이에요."
    >
      <div style={{ display: "grid", gap: "12px" }}>
        <Link href="/admin/themes">테마 관리로 이동</Link>
        <Link href="/admin/purchases">구매 내역으로 이동</Link>
        <Link href="/admin/members">회원 관리로 이동</Link>
      </div>
    </AdminShell>
  );
}
