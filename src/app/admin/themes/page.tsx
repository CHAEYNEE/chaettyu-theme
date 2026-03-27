import Link from "next/link";

import AdminEmptyState from "@/components/admin/AdminEmptyState/AdminEmptyState";
import AdminPageSection from "@/components/admin/AdminPageSection/AdminPageSection";
import AdminThemeList, {
  type AdminThemeRow,
} from "@/components/admin/AdminThemeList/AdminThemeList";

const mockThemeRows: AdminThemeRow[] = [
  {
    id: "merry-pink",
    title: "메리 핑크",
    type: "signature",
    purchaseMode: "single",
    status: "published",
  },
  {
    id: "soda-cat",
    title: "소다캣",
    type: "free",
    purchaseMode: "set",
    status: "draft",
  },
];

export default function AdminThemesPage() {
  return (
    <AdminPageSection
      title="테마 관리"
      description="등록된 테마를 확인하고 다음 단계에서 수정 및 등록 기능을 연결할 거예요."
      actions={<Link href="/admin/themes/new">+ 새 테마 등록</Link>}
    >
      {mockThemeRows.length > 0 ? (
        <AdminThemeList items={mockThemeRows} />
      ) : (
        <AdminEmptyState
          title="등록된 테마가 아직 없어요"
          description="새 테마 등록 버튼으로 첫 테마를 준비해보자."
        />
      )}
    </AdminPageSection>
  );
}
