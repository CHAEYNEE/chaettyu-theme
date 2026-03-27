import AdminEmptyState from "@/components/admin/AdminEmptyState/AdminEmptyState";
import AdminPageSection from "@/components/admin/AdminPageSection/AdminPageSection";

export default function AdminMembersPage() {
  return (
    <AdminPageSection
      title="회원 관리"
      description="회원 목록과 권한 상태를 확인하는 화면이에요."
    >
      <AdminEmptyState
        title="회원 관리 화면 준비 중"
        description="다음 단계에서 mock 사용자 데이터와 연결할 예정이에요."
      />
    </AdminPageSection>
  );
}
