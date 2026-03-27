import AdminShell from "@/components/admin/AdminShell/AdminShell";

export default function AdminThemeNewPage() {
  return (
    <AdminShell
      title="새 테마 등록"
      description="여기는 등록 폼이 들어갈 자리예요. 지금은 필드 틀만 만들기 전 단계!"
    >
      <div style={{ display: "grid", gap: "12px" }}>
        <p>테마명 입력 필드 자리</p>
        <p>slug / id 입력 필드 자리</p>
        <p>type / purchaseMode 선택 필드 자리</p>
        <p>다운로드 파일 연결 섹션 자리</p>
      </div>
    </AdminShell>
  );
}
