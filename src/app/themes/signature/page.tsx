import BoardLayout from "@/components/layout/BoardLayout/BoardLayout";
import ThemeListSection from "@/components/theme/ThemeListSection/ThemeListSection";
import { themes } from "@/data/themes";

export default function SignatureThemesPage() {
  const signatureThemes = themes.filter((theme) => theme.type === "signature");

  return (
    <BoardLayout>
      <ThemeListSection
        title="유료 테마"
        description="조금 더 특별하고 완성도 높은 시그니처 테마를 만나보세요."
        type="signature"
        items={signatureThemes}
      />
    </BoardLayout>
  );
}
