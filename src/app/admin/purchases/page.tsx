import AdminShell from "@/components/admin/AdminShell/AdminShell";
import AdminEmptyState from "@/components/admin/AdminEmptyState/AdminEmptyState";

export default function AdminPurchasesPage() {
  return (
    <AdminShell
      title="구매 내역"
      description="유료 테마 구매 내역 관리 화면이에요."
    >
      <AdminEmptyState
        title="구매 내역 화면 준비 중"
        description="다음 단계에서 purchase history 데이터와 연결할 예정이에요."
      />
    </AdminShell>
  );
}
