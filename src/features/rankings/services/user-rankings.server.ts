import "server-only";

import { createClient as createPublicClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type { UserRankingRow } from "@/features/rankings/types/user-ranking";

type RankingSummaryRow = {
  rank: number;
  user_id: string | null;
  nickname: string | null;
  profile_image_url: string | null;
  total_likes: number | null;
  updated_at: string | null;
};

async function getUserRankings(): Promise<UserRankingRow[]> {
  // Rankings are global and identical for all users, so avoid cookies/session-based clients here.
  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase
    .from("ranking_summary")
    .select(
      "rank, user_id, nickname, profile_image_url, total_likes, updated_at",
    )
    .order("rank", { ascending: true })
    .limit(50);

  if (error) {
    console.error("[user-rankings] failed to load ranking_summary", error);
    return [];
  }

  return ((data ?? []) as RankingSummaryRow[])
    .filter((row) => typeof row.rank === "number")
    .map((row) => ({
      rank: row.rank,
      userId: row.user_id ?? null,
      nickname: row.nickname?.trim() || "user",
      profileImageUrl: row.profile_image_url ?? null,
      totalLikes: typeof row.total_likes === "number" ? row.total_likes : 0,
      updatedAt: row.updated_at ?? null,
    }));
}

export const getUserRankingsCached = unstable_cache(
  async () => getUserRankings(),
  ["user-rankings", "v2"],
  { revalidate: 60 },
);
