import "server-only";

import { createClient } from "@/lib/supabase/server";
import { LOAD_FAILED_MESSAGE } from "@/utils/messages";
import { unstable_cache } from "next/cache";
import { createClient as createPublicClient } from "@supabase/supabase-js";
import type { PromptSort } from "@/features/prompts/types";

type PromptRow = {
  id: string;
  user_id: string;
  nickname: string;
  title: string;
  prompt_text: string;
  description: string | null;
  ai_model: string;
  before_image_url: string | null;
  sample_image_url: string | null;
  created_at: string;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function logServerError(action: string, error: unknown) {
  console.error(`[prompts.server] ${action}`, error);
}

function isAuthSessionMissing(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message =
    "message" in error && typeof error.message === "string"
      ? error.message
      : "";
  return message.includes("Auth session missing");
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    if (!isAuthSessionMissing(error)) {
      logServerError("getCurrentUserId", error);
    }
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
      "id, user_id, nickname, title, prompt_text, description, ai_model, before_image_url, sample_image_url, created_at",
    );

  if (query) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,prompt_text.ilike.%${query}%,description.ilike.%${query}%,nickname.ilike.%${query}%`,
    );
  }

  if (model) {
    queryBuilder = queryBuilder.eq("ai_model", model);
  }

  if (sort === "popular") {
    queryBuilder = queryBuilder
      .order("likes_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    queryBuilder = queryBuilder.order("created_at", {
      ascending: sort === "oldest",
    });
  }

  if (typeof limit === "number") {
    queryBuilder = queryBuilder.limit(limit);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    logServerError("getPrompts", error);
    throw new Error(LOAD_FAILED_MESSAGE);
  }

  return data ?? [];
}

export async function getPromptsPage(options: {
  sort?: PromptSort;
  query?: string;
  model?: string;
  page?: number;
  limit?: number;
}): Promise<PromptRow[]> {
  const sort = options.sort ?? "latest";
  const query = options.query?.trim();
  const model = options.model?.trim();
  const page = Math.max(0, options.page ?? 0);
  const limit = Math.max(1, options.limit ?? 20);
  const from = page * limit;
  const to = from + limit - 1;

  const supabase = await createClient();
  const selectFields =
    "id, user_id, nickname, title, prompt_text, description, ai_model, before_image_url, sample_image_url, created_at";

  let queryBuilder = supabase.from("prompts").select(selectFields);

  if (query) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,prompt_text.ilike.%${query}%,description.ilike.%${query}%,nickname.ilike.%${query}%`,
    );
  }

  if (model) {
    queryBuilder = queryBuilder.eq("ai_model", model);
  }

  if (sort === "popular") {
    queryBuilder = queryBuilder
      .order("likes_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    queryBuilder = queryBuilder.order("created_at", {
      ascending: sort === "oldest",
    });
  }

  const { data, error } = await queryBuilder.range(from, to);

  if (error) {
    logServerError("getPromptsPage", error);
    throw new Error(LOAD_FAILED_MESSAGE);
  }

  return data ?? [];
}

async function getPopularPromptsPublic(): Promise<PromptRow[]> {
  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase
    .from("prompts")
    .select(
      "id, user_id, nickname, title, prompt_text, description, ai_model, before_image_url, sample_image_url, created_at",
    )
    .order("likes_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    logServerError("getPopularPromptsPublic", error);
    return [];
  }

  return data ?? [];
}

export const getPopularPromptsCached = unstable_cache(
  async () => getPopularPromptsPublic(),
  ["popular-prompts", "v1"],
  { revalidate: 600 },
);

type PromptCardRow = Pick<
  PromptRow,
  | "id"
  | "user_id"
  | "nickname"
  | "title"
  | "ai_model"
  | "sample_image_url"
  | "created_at"
>;

export async function getPromptsByIdsPublic(
  ids: string[],
): Promise<PromptCardRow[]> {
  const unique = Array.from(new Set(ids)).filter((id) => UUID_REGEX.test(id));
  if (unique.length === 0) return [];

  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase
    .from("prompts")
    .select(
      "id, user_id, nickname, title, ai_model, sample_image_url, created_at",
    )
    .in("id", unique)
    .order("created_at", { ascending: false })
    .limit(Math.min(200, unique.length));

  if (error) {
    logServerError("getPromptsByIdsPublic", error);
    return [];
  }

  return (data ?? []) as PromptCardRow[];
}

export async function getPromptsByUserPublic(
  userId: string,
  limit = 60,
): Promise<PromptCardRow[]> {
  if (!UUID_REGEX.test(userId)) return [];

  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase
    .from("prompts")
    .select(
      "id, user_id, nickname, title, ai_model, sample_image_url, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(Math.max(1, Math.min(200, limit)));

  if (error) {
    logServerError("getPromptsByUserPublic", error);
    return [];
  }

  return (data ?? []) as PromptCardRow[];
}

export async function getPromptsCountByUserPublic(
  userId: string,
): Promise<number> {
  if (!UUID_REGEX.test(userId)) return 0;

  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { count, error } = await supabase
    .from("prompts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    logServerError("getPromptsCountByUserPublic", error);
    return 0;
  }

  return count ?? 0;
}

export async function getLikedPromptsCount(userId: string): Promise<number> {
  if (!UUID_REGEX.test(userId)) return 0;

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("prompt_likes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    logServerError("getLikedPromptsCount", error);
    return 0;
  }

  return count ?? 0;
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
  if (!UUID_REGEX.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompts")
    .select(
      "id, user_id, nickname, title, prompt_text, description, ai_model, before_image_url, sample_image_url, created_at",
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
