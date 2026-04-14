import { createClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/features/profiles/types/profile";
import {
  LOGIN_REQUIRED_MESSAGE,
  NICKNAME_COOLDOWN_MESSAGE,
  UPDATE_FAILED_MESSAGE,
} from "@/utils/messages";

function logClientError(action: string, error: unknown) {
  console.error(`[profiles.client] ${action}`, error);
}

export async function getProfileByUserId(
  userId: string,
): Promise<ProfileRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, nickname, profile_image_url, last_nickname_updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    logClientError("getProfileByUserId", error);
    return null;
  }

  return data ?? null;
}

export async function getCurrentUserProfile(): Promise<ProfileRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    if (error) logClientError("getCurrentUserProfile", error);
    return null;
  }

  const profile = await getProfileByUserId(data.user.id);
  if (profile) return profile;

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    nickname:
      (data.user.user_metadata?.nickname as string | undefined) ||
      data.user.email?.split("@")[0] ||
      "user",
    profile_image_url: null,
    last_nickname_updated_at: null,
  };
}

export async function getCurrentUserNickname(): Promise<string | null> {
  const profile = await getCurrentUserProfile();
  if (!profile) return null;

  return profile.nickname ?? profile.email?.split("@")[0] ?? "user";
}

export async function updateMyNickname(nextNickname: string): Promise<void> {
  const nickname = nextNickname.trim();
  if (!nickname) {
    throw new Error(UPDATE_FAILED_MESSAGE);
  }

  const COOLDOWN_MS = 5 * 60 * 1000;

  const supabase = createClient();
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) {
    if (userError) logClientError("updateMyNickname/getUser", userError);
    throw new Error(LOGIN_REQUIRED_MESSAGE);
  }

  const { data: current, error: profileError } = await supabase
    .from("profiles")
    .select("last_nickname_updated_at")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    logClientError("updateMyNickname/loadProfile", profileError);
    throw new Error(UPDATE_FAILED_MESSAGE);
  }

  const last = current?.last_nickname_updated_at as string | null | undefined;
  if (typeof last === "string" && last) {
    const lastMs = new Date(last).getTime();
    if (Number.isFinite(lastMs) && Date.now() - lastMs < COOLDOWN_MS) {
      throw new Error(NICKNAME_COOLDOWN_MESSAGE);
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ nickname })
    .eq("id", data.user.id);

  if (error) {
    logClientError("updateMyNickname/update", error);
    throw new Error(UPDATE_FAILED_MESSAGE);
  }
}

export async function isNicknameTaken(
  nicknameInput: string,
  options?: { excludeUserId?: string },
): Promise<boolean> {
  const nickname = nicknameInput.trim();
  if (!nickname) return false;

  const supabase = createClient();
  let query = supabase
    .from("profiles")
    .select("id")
    .ilike("nickname", nickname)
    .limit(1);

  if (options?.excludeUserId) {
    query = query.neq("id", options.excludeUserId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    logClientError("isNicknameTaken", error);
    throw error;
  }

  return Boolean(data?.id);
}
