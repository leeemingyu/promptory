import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "prompt-images";

function toStoragePath(key: string) {
  return `${key}`;
}

function isSafeKey(key: string) {
  return Boolean(key) && !key.includes("/") && !key.includes("\\");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  let body: {
    title: string;
    prompt_text: string;
    description: string;
    ai_model: string;
    beforeImageKey: string | null;
    afterImageKey: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "invalid body" }, { status: 400 });
  }

  const { data: existing, error: loadError } = await supabase
    .from("prompts")
    .select("user_id, before_image_url, sample_image_url")
    .eq("id", id)
    .maybeSingle();

  if (loadError) {
    console.error("[api/prompts/:id] load failed", loadError);
    return NextResponse.json({ message: "load failed" }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }
  if (existing.user_id !== user.id) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const nextBefore = body.beforeImageKey ?? null;
  const nextAfter = body.afterImageKey ?? null;

  const { error: updateError } = await supabase
    .from("prompts")
    .update({
      title: body.title,
      prompt_text: body.prompt_text,
      description: body.description || null,
      ai_model: body.ai_model,
      before_image_url: nextBefore,
      sample_image_url: nextAfter,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("[api/prompts/:id] update failed", updateError);
    return NextResponse.json({ message: "update failed" }, { status: 500 });
  }

  const keysToRemove: string[] = [];
  if (existing.before_image_url && existing.before_image_url !== nextBefore) {
    keysToRemove.push(existing.before_image_url);
  }
  if (existing.sample_image_url && existing.sample_image_url !== nextAfter) {
    keysToRemove.push(existing.sample_image_url);
  }

  if (keysToRemove.length > 0) {
    try {
      const admin = createAdminClient();
      const paths = keysToRemove.filter(isSafeKey).map(toStoragePath);
      if (paths.length > 0) {
        const { error: removeError } = await admin.storage
          .from(BUCKET)
          .remove(paths);
        if (removeError) {
          console.error("[api/prompts/:id] storage remove failed", removeError);
        }
      }
    } catch (error) {
      console.error("[api/prompts/:id] admin client failed", error);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const { data: existing, error: loadError } = await supabase
    .from("prompts")
    .select("user_id, before_image_url, sample_image_url")
    .eq("id", id)
    .maybeSingle();

  if (loadError) {
    console.error("[api/prompts/:id] load failed", loadError);
    return NextResponse.json({ message: "load failed" }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }
  if (existing.user_id !== user.id) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const { error: deleteError } = await supabase
    .from("prompts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("[api/prompts/:id] delete failed", deleteError);
    return NextResponse.json({ message: "delete failed" }, { status: 500 });
  }

  const keysToRemove = [existing.before_image_url, existing.sample_image_url]
    .filter(Boolean)
    .filter(isSafeKey)
    .map(toStoragePath);

  if (keysToRemove.length > 0) {
    try {
      const admin = createAdminClient();
      const { error: removeError } = await admin.storage
        .from(BUCKET)
        .remove(keysToRemove);
      if (removeError) {
        console.error("[api/prompts/:id] storage remove failed", removeError);
      }
    } catch (error) {
      console.error("[api/prompts/:id] admin client failed", error);
    }
  }

  return NextResponse.json({ ok: true });
}
