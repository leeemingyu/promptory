import "server-only";

import { createClient } from "@/lib/supabase/server";
import { LOAD_FAILED_MESSAGE } from "@/lib/data/messages";

type PromptRow = {
  id: string;
  user_id: string;
  nickname: string;
  title: string;
  prompt_text: string;
  description: string | null;
  ai_model: string;
  sample_image_url: string | null;
  created_at: string;
};

export type PromptSort = "latest" | "oldest" | "popular";

function logServerError(action: string, error: unknown) {
  console.error(`[prompts.server] ${action}`, error);
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    logServerError("getCurrentUserId", error);
    return null;
  }
  return data.user?.id ?? null;
}

export async function getPrompts(options?: {
  sort?: PromptSort;
  query?: string;
  model?: string;
  limit?: number;
}): Promise<PromptRow[]> {
  const sort = options?.sort ?? "latest";
  const query = options?.query?.trim();
  const model = options?.model?.trim();
  const limit = options?.limit;
  const supabase = await createClient();
  let queryBuilder = supabase
    .from("prompts")
    .select(
      "id, user_id, nickname, title, prompt_text, description, ai_model, sample_image_url, created_at",
    )
    .order("created_at", { ascending: sort === "oldest" });

  if (query) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,prompt_text.ilike.%${query}%,description.ilike.%${query}%,nickname.ilike.%${query}%`,
    );
  }

  if (model) {
    queryBuilder = queryBuilder.eq("ai_model", model);
  }

  if (sort !== "popular" && typeof limit === "number") {
    queryBuilder = queryBuilder.limit(limit);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    logServerError("getPrompts", error);
    throw new Error(LOAD_FAILED_MESSAGE);
  }

  let prompts = data ?? [];
  if (sort !== "popular") {
    return prompts;
  }

  if (prompts.length === 0) {
    return prompts;
  }

  const promptIds = prompts.map((prompt) => prompt.id);
  const { data: likeRows, error: likeError } = await supabase
    .from("prompt_likes")
    .select("prompt_id")
    .in("prompt_id", promptIds);

  if (likeError) {
    logServerError("getPrompts/likeCounts", likeError);
    return prompts;
  }

  const likeCountById = new Map<string, number>();
  for (const row of likeRows ?? []) {
    const promptId = row.prompt_id;
    if (typeof promptId !== "string") continue;
    likeCountById.set(promptId, (likeCountById.get(promptId) ?? 0) + 1);
  }

  prompts = [...prompts].sort((a, b) => {
    const aLikes = likeCountById.get(a.id) ?? 0;
    const bLikes = likeCountById.get(b.id) ?? 0;
    if (bLikes !== aLikes) return bLikes - aLikes;
    return (
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });

  if (typeof limit === "number") {
    return prompts.slice(0, limit);
  }

  return prompts;
}

export async function getPromptModels(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("prompts").select("ai_model");

  if (error) {
    logServerError("getPromptModels", error);
    return [];
  }

  const models = new Set<string>();
  for (const row of data ?? []) {
    if (typeof row.ai_model === "string" && row.ai_model.trim()) {
      models.add(row.ai_model);
    }
  }

  return Array.from(models).sort((a, b) => a.localeCompare(b));
}

export async function getPromptById(id: string): Promise<PromptRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompts")
    .select(
      "id, user_id, nickname, title, prompt_text, description, ai_model, sample_image_url, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logServerError("getPromptById", error);
    throw new Error(LOAD_FAILED_MESSAGE);
  }

  return data ?? null;
}

export async function isPromptLiked(
  promptId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompt_likes")
    .select("id")
    .eq("prompt_id", promptId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    logServerError("isPromptLiked", error);
    return false;
  }

  return Boolean(data);
}

export async function getLikedPromptIds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompt_likes")
    .select("prompt_id")
    .eq("user_id", userId);

  if (error) {
    logServerError("getLikedPromptIds", error);
    return [];
  }

  return (data ?? [])
    .map((row) => row.prompt_id)
    .filter((promptId): promptId is string => typeof promptId === "string");
}
