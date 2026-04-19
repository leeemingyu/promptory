import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET = "prompt-images";

function inferExtFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return "";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ message: "invalid form" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "file required" }, { status: 400 });
  }

  const rawExt = file.name.split(".").pop()?.toLowerCase();
  const ext = rawExt || inferExtFromMime(file.type);
  if (!ext) {
    return NextResponse.json({ message: "invalid file type" }, { status: 400 });
  }

  const key = `${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const admin = createAdminClient();
  const { error } = await admin.storage.from(BUCKET).upload(key, bytes, {
    contentType: file.type || "application/octet-stream",
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("[api/uploads/prompt-image] upload failed", error);
    return NextResponse.json({ message: "upload failed" }, { status: 500 });
  }

  // DB에는 key(예: uuid.webp)만 저장합니다.
  return NextResponse.json({ key });
}

