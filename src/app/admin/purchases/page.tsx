import AdminEmptyState from "@/components/admin/AdminEmptyState/AdminEmptyState";
import AdminPageSection from "@/components/admin/AdminPageSection/AdminPageSection";

export default function AdminPurchasesPage() {
  return (
    <AdminPageSection
      title="구매 내역"
      description="유료 테마 구매 내역과 결제 흐름을 관리하는 화면이에요."
    >
      <AdminEmptyState
        title="구매 내역 화면 준비 중"
        description="다음 단계에서 purchase history 데이터와 연결할 예정이에요."
      />
    </AdminPageSection>
  );
}
