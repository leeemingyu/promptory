import { createClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/features/profiles/types/profile";

function logClientError(action: string, error: unknown) {
  console.error(`[profiles.client] ${action}`, error);
}

export async function getProfileByUserId(
  userId: string,
): Promise<ProfileRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, nickname, profile_image_url")
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
  };
}

export async function getCurrentUserNickname(): Promise<string | null> {
  const profile = await getCurrentUserProfile();
  if (!profile) return null;

  return profile.nickname ?? profile.email?.split("@")[0] ?? "user";
}
