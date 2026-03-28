import AdminPageSection from "@/components/admin/AdminPageSection/AdminPageSection";
import AdminThemeForm from "@/components/admin/AdminThemeForm/AdminThemeForm";
import { themes } from "@/data/themes";

export default function AdminNewThemePage() {
  return (
    <AdminPageSection
      eyebrow="NEW THEME"
      title="새 테마 등록"
      description="정보를 입력해서 테마를 등록해보세요."
    >
      <AdminThemeForm baseThemes={themes} />
    </AdminPageSection>
  );
}
