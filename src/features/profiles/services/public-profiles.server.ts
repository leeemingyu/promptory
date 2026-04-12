import "server-only";

import { unstable_cache } from "next/cache";
import { createClient as createPublicClient } from "@supabase/supabase-js";
import type { ProfileRow } from "@/features/profiles/types/profile";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function logServerError(action: string, error: unknown) {
  console.error(`[public-profiles.server] ${action}`, error);
}

async function getPublicProfileByUserId(userId: string): Promise<ProfileRow | null> {
  if (!UUID_REGEX.test(userId)) return null;

  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, nickname, profile_image_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    logServerError("getPublicProfileByUserId", error);
    return null;
  }

  return data ?? null;
}

export const getPublicProfileByUserIdCached = unstable_cache(
  async (userId: string) => getPublicProfileByUserId(userId),
  ["public-profile-by-id", "v1"],
  { revalidate: 600 },
);

