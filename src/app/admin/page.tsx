import Link from "next/link";

import AdminPageSection from "@/components/admin/AdminPageSection/AdminPageSection";

export default function AdminPage() {
  return (
    <AdminPageSection
      title="관리자 대시보드"
      description="관리자 작업 현황과 주요 이동 경로를 확인하는 공간이에요."
    >
      <div style={{ display: "grid", gap: "14px" }}>
        <Link href="/admin/themes">테마 관리로 이동</Link>
        <Link href="/admin/purchases">구매 내역으로 이동</Link>
        <Link href="/admin/members">회원 관리로 이동</Link>
      </div>
    </AdminPageSection>
  );
}
