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

export async function getPrompts(): Promise<PromptRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompts")
    .select(
      "id, user_id, nickname, title, prompt_text, description, ai_model, sample_image_url, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    logServerError("getPrompts", error);
    throw new Error(LOAD_FAILED_MESSAGE);
  }

  return data ?? [];
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
