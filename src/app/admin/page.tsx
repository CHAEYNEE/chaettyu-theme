import AdminDashboardGrid from "@/components/admin/AdminDashboardGrid/AdminDashboardGrid";
import AdminPageSection from "@/components/admin/AdminPageSection/AdminPageSection";

export default function AdminPage() {
  return (
    <AdminPageSection
      eyebrow="ADMIN HOME"
      title="관리자 대시보드"
      description="채뜌.theme 운영에 필요한 메뉴를 한눈에 보고 바로 이동할 수 있어요."
    >
      <AdminDashboardGrid />
    </AdminPageSection>
  );
}
