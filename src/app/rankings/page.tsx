import type { Metadata } from "next";
import { getUserRankingsCached, UserRankingTable } from "@/features/rankings";

export const metadata: Metadata = {
  title: "사용자 랭킹",
  description: "사용자별 받은 좋아요와 프롬프트 수를 기준으로 랭킹을 확인합니다.",
  openGraph: {
    title: "사용자 랭킹 | Promptory",
    url: "/rankings",
  },
  twitter: {
    title: "사용자 랭킹 | Promptory",
  },
};

export default async function RankingsPage() {
  const rows = await getUserRankingsCached();

  return (
    <main className="mx-auto max-w-7xl md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">사용자 랭킹</h1>
      </div>
      <UserRankingTable rows={rows} />
    </main>
  );
}

