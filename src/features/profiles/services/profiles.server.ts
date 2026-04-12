import "server-only";

import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import type { ProfileRow } from "@/features/profiles/types/profile";

function logServerError(action: string, error: unknown) {
  console.error(`[profiles.server] ${action}`, error);
}

function isAuthSessionMissing(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message =
    "message" in error && typeof error.message === "string"
      ? error.message
      : "";
  return message.includes("Auth session missing");
}

export const getProfileByUserId = cache(
  async (userId: string): Promise<ProfileRow | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, nickname, profile_image_url")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      logServerError("getProfileByUserId", error);
      return null;
    }

    return data ?? null;
  },
);

export const getCurrentUserProfile = cache(
  async (): Promise<ProfileRow | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      if (error && !isAuthSessionMissing(error)) {
        logServerError("getCurrentUserProfile", error);
      }
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
  },
);

export const getCurrentUserNickname = cache(async (): Promise<string | null> => {
  const profile = await getCurrentUserProfile();
  if (!profile) return null;

  return profile.nickname ?? profile.email?.split("@")[0] ?? "user";
});
