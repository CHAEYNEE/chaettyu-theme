import BoardLayout from "@/components/layout/BoardLayout/BoardLayout";
import ThemeListSection from "@/components/theme/ThemeListSection/ThemeListSection";
import { themes } from "@/data/themes";

export default function FreeThemesPage() {
  const freeThemes = themes.filter((theme) => theme.type === "free");

  return (
    <BoardLayout>
      <ThemeListSection
        title="무료 테마"
        description="채뜌.theme에서 자유롭게 다운로드할 수 있는 무료 카카오톡 테마를 모아봤어요."
        type="free"
        items={freeThemes}
      />
    </BoardLayout>
  );
}
