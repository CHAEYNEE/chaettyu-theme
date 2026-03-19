type ThemeDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ThemeDetailPage({
  params,
}: ThemeDetailPageProps) {
  const { id } = await params;

  return <main>테마 상세 페이지: {id}</main>;
}
