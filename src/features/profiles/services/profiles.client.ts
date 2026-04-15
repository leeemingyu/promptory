import { createClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/features/profiles/types/profile";
import {
  LOGIN_REQUIRED_MESSAGE,
  UPDATE_FAILED_MESSAGE,
} from "@/utils/messages";

function logClientError(action: string, error: unknown) {
  console.error(`[profiles.client] ${action}`, error);
}

const NICKNAME_COOLDOWN_MS = 60 * 24 * 60 * 60 * 1000; // 60 days
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function formatNicknameCooldown(remainingMs: number) {
  if (remainingMs > DAY_MS) {
    const days = Math.max(1, Math.ceil(remainingMs / DAY_MS));
    return `닉네임은 ${days}일 뒤에 바꿀 수 있어요.`;
  }

  if (remainingMs > HOUR_MS) {
    const hours = Math.max(1, Math.ceil(remainingMs / HOUR_MS));
    return `닉네임은 ${hours}시간 뒤에 바꿀 수 있어요.`;
  }

  const minutes = Math.max(1, Math.ceil(remainingMs / MINUTE_MS));
  return `닉네임은 ${minutes}분 뒤에 바꿀 수 있어요.`;
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
    profile_image_url: "default",
    last_nickname_updated_at: null,
  };
}

export async function getCurrentUserNickname(): Promise<string | null> {
  const profile = await getCurrentUserProfile();
  if (!profile) return null;

  return profile.nickname ?? profile.email?.split("@")[0] ?? "user";
}

export async function updateMyNickname(nextNickname: string): Promise<void> {
  await updateMyProfile({ nickname: nextNickname });
}

export async function updateMyProfile(input: {
  nickname?: string;
  profileImageUrl?: string | null;
}): Promise<void> {
  const nickname = typeof input.nickname === "string" ? input.nickname.trim() : undefined;
  const profileImageUrlRaw =
    typeof input.profileImageUrl === "string" ? input.profileImageUrl : input.profileImageUrl === null ? "default" : undefined;

  if (nickname !== undefined && !nickname) {
    throw new Error(UPDATE_FAILED_MESSAGE);
  }

  const supabase = createClient();
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) {
    if (userError) logClientError("updateMyProfile/getUser", userError);
    throw new Error(LOGIN_REQUIRED_MESSAGE);
  }

  const { data: current, error: profileError } = await supabase
    .from("profiles")
    .select("nickname, profile_image_url, last_nickname_updated_at")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    logClientError("updateMyProfile/loadProfile", profileError);
    throw new Error(UPDATE_FAILED_MESSAGE);
  }

  const updates: Record<string, unknown> = {};

  const currentNickname =
    typeof current?.nickname === "string" ? (current.nickname as string) : null;
  const currentProfileImageUrl =
    typeof current?.profile_image_url === "string"
      ? (current.profile_image_url as string)
      : null;

  if (nickname !== undefined && nickname !== (currentNickname ?? "")) {
    const last = current?.last_nickname_updated_at as string | null | undefined;
    if (typeof last === "string" && last) {
      const lastMs = new Date(last).getTime();
      if (Number.isFinite(lastMs)) {
        const elapsedMs = Date.now() - lastMs;
        if (elapsedMs < NICKNAME_COOLDOWN_MS) {
          const remainingMs = Math.max(0, NICKNAME_COOLDOWN_MS - elapsedMs);
          throw new Error(formatNicknameCooldown(remainingMs));
        }
      }
    }

    updates.nickname = nickname;
  }

  if (
    profileImageUrlRaw !== undefined &&
    profileImageUrlRaw !== (currentProfileImageUrl ?? "default")
  ) {
    updates.profile_image_url = profileImageUrlRaw;
  }

  if (Object.keys(updates).length === 0) return;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", data.user.id);

  if (error) {
    logClientError("updateMyProfile/update", error);
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
