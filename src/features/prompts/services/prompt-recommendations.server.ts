import "server-only";

import { unstable_cache } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { getPopularPromptsCached } from "@/features/prompts/services/prompts.server";
import { getOrCreatePromptEmbeddingVectorLiteral } from "@/features/prompts/services/prompt-embeddings.server";

type PromptCardRow = {
  id: string;
  user_id: string;
  nickname: string;
  title: string;
  ai_model: string;
  sample_image_url: string | null;
  likes_count: number | null;
};

const DEFAULT_THRESHOLD = 0.3;
const MAX_MATCH_COUNT = 50;

type PopularPromptRow = {
  id: string;
  user_id: string;
  nickname: string;
  title: string;
  ai_model: string;
  sample_image_url: string | null;
  likes_count: number | null;
};

type PromptEmbeddingSourceRow = {
  id: string;
  title: string;
  prompt_text: string;
  description: string | null;
  ai_model: string;
  embedding: unknown;
};

function uniqById(rows: PromptCardRow[]): PromptCardRow[] {
  const seen = new Set<string>();
  const out: PromptCardRow[] = [];
  for (const row of rows) {
    if (!row?.id) continue;
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

function toPromptCardRow(row: unknown): PromptCardRow | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;

  if (typeof r.id !== "string") return null;
  if (typeof r.user_id !== "string") return null;
  if (typeof r.nickname !== "string") return null;
  if (typeof r.title !== "string") return null;
  if (typeof r.ai_model !== "string") return null;

  return {
    id: r.id,
    user_id: r.user_id,
    nickname: r.nickname,
    title: r.title,
    ai_model: r.ai_model,
    sample_image_url:
      typeof r.sample_image_url === "string" ? r.sample_image_url : null,
    likes_count: typeof r.likes_count === "number" ? r.likes_count : null,
  };
}

export const getRecommendedPromptsForPromptId = unstable_cache(
  async (promptId: string, count = 5): Promise<PromptCardRow[]> => {
    const safeCount = Math.max(1, Math.min(12, count));
    const admin = createAdminClient();

    const { data: source, error: sourceError } = await admin
      .from("prompts")
      .select("id, title, prompt_text, description, ai_model, embedding")
      .eq("id", promptId)
      .maybeSingle();

    if (sourceError) {
      console.error(
        "[prompt-recommendations] 원본 프롬프트 조회 실패",
        sourceError,
      );
      return [];
    }
    if (!source) return [];

    const typedSource = source as PromptEmbeddingSourceRow;

    let queryEmbedding: string;
    try {
      queryEmbedding = await getOrCreatePromptEmbeddingVectorLiteral({
        id: typedSource.id,
        title: typedSource.title,
        prompt_text: typedSource.prompt_text,
        description: typedSource.description ?? null,
        ai_model: typedSource.ai_model,
        embedding: typedSource.embedding,
      });
    } catch (error) {
      console.error("[prompt-recommendations] 임베딩 생성/저장 실패", error);
      return [];
    }

    const matchCount = Math.min(
      MAX_MATCH_COUNT,
      Math.max(safeCount + 8, safeCount),
    );

    const { data: matchesRaw, error: matchError } = await admin.rpc(
      "match_prompts",
      {
        query_embedding: queryEmbedding,
        match_threshold: DEFAULT_THRESHOLD,
        match_count: matchCount,
      },
    );

    if (matchError) {
      console.error("[prompt-recommendations] match_prompts 실패", matchError);
    }

    const matches = (matchesRaw ?? []) as unknown[];

    const recommended = uniqById(
      matches
        .map(toPromptCardRow)
        .filter((row): row is PromptCardRow => Boolean(row))
        .filter((row) => row.id !== promptId),
    ).slice(0, safeCount);

    if (recommended.length >= safeCount) return recommended;

    const popular = (await getPopularPromptsCached()) as PopularPromptRow[];
    const fill = uniqById([
      ...recommended,
      ...(popular ?? [])
        .map((row) =>
          toPromptCardRow({
            id: row.id,
            user_id: row.user_id,
            nickname: row.nickname,
            title: row.title,
            ai_model: row.ai_model,
            sample_image_url: row.sample_image_url,
            likes_count: row.likes_count,
          }),
        )
        .filter((row): row is PromptCardRow => Boolean(row))
        .filter((row) => row.id !== promptId),
    ]);

    return fill.slice(0, safeCount);
  },
  ["recommended-prompts", "v1"],
  { revalidate: 600 },
);
