import HomeBoard from "@/components/home/HomeBoard/HomeBoard";
import BoardLayout from "@/components/layout/BoardLayout/BoardLayout";
import { fetchHomeThemes } from "@/lib/theme/fetchHomeThemes";

export default async function HomePage() {
  const { freeThemes, signatureThemes } = await fetchHomeThemes();

  return (
    <BoardLayout>
      <HomeBoard freeThemes={freeThemes} signatureThemes={signatureThemes} />
    </BoardLayout>
  );
}
