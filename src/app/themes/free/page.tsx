import BoardLayout from "@/components/layout/BoardLayout/BoardLayout";
import ThemeListSection from "@/components/theme/ThemeListSection/ThemeListSection";
import { getPublicThemesByType } from "@/lib/theme/getPublicThemes";

export default async function FreeThemesPage() {
  const freeThemes = await getPublicThemesByType("free");

  return (
    <BoardLayout>
      <ThemeListSection
        title="무료 테마"
        description="자유롭게 다운로드할 수 있는 무료 카카오톡 테마 🫶"
        type="free"
        items={freeThemes}
      />
    </BoardLayout>
  );
}
