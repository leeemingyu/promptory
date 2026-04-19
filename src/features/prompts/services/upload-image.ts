"use client";

/**
 * Uploads an image via our server route (service role) and returns the DB key (e.g. `uuid.webp`).
 * This avoids Supabase Storage RLS issues on the browser.
 */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/uploads/prompt-image", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[uploadImage] failed", res.status, text);
    throw new Error("이미지 업로드에 실패했어요.");
  }

  const data = (await res.json().catch(() => null)) as { key?: string } | null;
  if (!data?.key) {
    throw new Error("이미지 업로드 응답이 올바르지 않아요.");
  }

  return data.key;
}

