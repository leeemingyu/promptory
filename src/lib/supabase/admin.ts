import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL 환경 변수가 필요해요.");
  }
  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY(또는 SUPABASE_SERVICE_KEY) 환경 변수가 필요해요.",
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

