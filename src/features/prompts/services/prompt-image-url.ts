const BUCKET = "prompt-images";

function trimTrailingSlash(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getPromptImagePublicUrl(value?: string | null): string | null {
  if (!value) return null;

  // Local assets like "/og.png" should pass through.
  if (value.startsWith("/")) return value;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  const base = trimTrailingSlash(supabaseUrl);

  // Keys are filenames (no slashes). Encode to be safe with spaces/special chars.
  return `${base}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(value)}`;
}
