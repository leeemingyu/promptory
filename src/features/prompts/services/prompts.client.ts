import { createClient } from "@/lib/supabase/client";
import type { CreatePromptInput } from "@/features/prompts/types";
import type { User } from "@supabase/supabase-js";
import { getProfileByUserId } from "@/features/profiles/services/profiles.client";
import {
  CREATE_FAILED_MESSAGE,
  DELETE_FAILED_MESSAGE,
  LIKE_FAILED_MESSAGE,
  LOAD_FAILED_MESSAGE,
  LOGIN_REQUIRED_MESSAGE,
  UPDATE_FAILED_MESSAGE,
} from "@/utils/messages";

type PromptEditRow = {
  id: string;
  user_id: string;
  title: string;
  prompt_text: string;
  description: string | null;
  ai_model: string;
  before_image_url: string | null;
  sample_image_url: string | null;
};

function logClientError(action: string, error: unknown) {
  console.error(`[prompts.client] ${action}`, error);
}

export async function requireCurrentUser(): Promise<User> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    logClientError("requireCurrentUser", error);
  }
  if (!data.user) {
    throw new Error(LOGIN_REQUIRED_MESSAGE);
  }
  return data.user;
}

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const user = await requireCurrentUser();
    return user.id;
  } catch {
    return null;
  }
}

export async function getPromptForEdit(
  promptId: string,
): Promise<PromptEditRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("prompts")
    .select(
      "id, user_id, title, prompt_text, description, ai_model, before_image_url, sample_image_url",
    )
    .eq("id", promptId)
    .maybeSingle();

  if (error) {
    logClientError("getPromptForEdit", error);
    throw new Error(LOAD_FAILED_MESSAGE);
  }

  return data ?? null;
}

export async function createPrompt(
  input: CreatePromptInput,
  options?: { beforeImageUrl: string; afterImageUrl: string; user?: User },
) {
  const supabase = createClient();
  const user = options?.user ?? (await requireCurrentUser());

  const profile = await getProfileByUserId(user.id);
  const nickname =
    profile?.nickname ??
    (user.user_metadata?.nickname as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "user";

  const { error } = await supabase.from("prompts").insert({
    user_id: user.id,
    nickname,
    title: input.title,
    prompt_text: input.prompt_text,
    description: input.description || null,
    ai_model: input.ai_model,
    sample_image_url: options?.afterImageUrl,
    before_image_url: options?.beforeImageUrl,
  });

  if (error) {
    logClientError("createPrompt", error);
    throw new Error(CREATE_FAILED_MESSAGE);
  }
}

export async function updatePrompt(
  promptId: string,
  input: CreatePromptInput,
  options?: {
    beforeImageUrl?: string | null;
    afterImageUrl?: string | null;
    userId?: string;
  },
) {
  const supabase = createClient();
  const userId = options?.userId ?? (await requireCurrentUser()).id;

  const payload: Record<string, unknown> = {
    title: input.title,
    prompt_text: input.prompt_text,
    description: input.description || null,
    ai_model: input.ai_model,
  };
  if (options && "beforeImageUrl" in options) {
    payload.before_image_url = options.beforeImageUrl ?? null;
  }
  if (options && "afterImageUrl" in options) {
    payload.sample_image_url = options.afterImageUrl ?? null;
  }

  const { error } = await supabase
    .from("prompts")
    .update(payload)
    .eq("id", promptId)
    .eq("user_id", userId);

  if (error) {
    logClientError("updatePrompt", error);
    throw new Error(UPDATE_FAILED_MESSAGE);
  }
}

export async function deletePrompt(promptId: string, userId?: string) {
  const supabase = createClient();
  const resolvedUserId = userId ?? (await requireCurrentUser()).id;

  const { error } = await supabase
    .from("prompts")
    .delete()
    .eq("id", promptId)
    .eq("user_id", resolvedUserId);

  if (error) {
    logClientError("deletePrompt", error);
    throw new Error(DELETE_FAILED_MESSAGE);
  }
}

export async function toggleLike(promptId: string, nextLiked: boolean) {
  const supabase = createClient();
  const userId = (await requireCurrentUser()).id;

  if (nextLiked) {
    const { error } = await supabase.from("prompt_likes").insert({
      prompt_id: promptId,
      user_id: userId,
    });
    if (error) {
      logClientError("toggleLike/insert", error);
      throw new Error(LIKE_FAILED_MESSAGE);
    }
  } else {
    const { error } = await supabase
      .from("prompt_likes")
      .delete()
      .eq("prompt_id", promptId)
      .eq("user_id", userId);
    if (error) {
      logClientError("toggleLike/delete", error);
      throw new Error(LIKE_FAILED_MESSAGE);
    }
  }
}
