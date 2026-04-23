import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreatePromptEmbeddingVectorLiteral } from "@/features/prompts/services/prompt-embeddings.server";

export const runtime = "nodejs";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

function isAuthorized(request: Request) {
  const secret = process.env.ADMIN_BACKFILL_SECRET;
  if (!secret) return false;
  return request.headers.get("x-admin-secret") === secret;
}

export async function POST(request: Request) {
  if (!process.env.ADMIN_BACKFILL_SECRET) {
    return NextResponse.json(
      { message: "ADMIN_BACKFILL_SECRET 설정이 필요합니다." },
      { status: 500 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  let body: { limit?: number } | null = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const rawLimit = typeof body?.limit === "number" ? body.limit : DEFAULT_LIMIT;
  const limit = Math.max(1, Math.min(MAX_LIMIT, Math.floor(rawLimit)));

  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("prompts")
    .select("id, title, prompt_text, description, ai_model, embedding")
    .is("embedding", null)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[admin/backfill-prompt-embeddings] 조회 실패", error);
    return NextResponse.json({ message: "load failed" }, { status: 500 });
  }

  const results: Array<{ id: string; ok: boolean; error?: string }> = [];

  for (const row of rows ?? []) {
    try {
      await getOrCreatePromptEmbeddingVectorLiteral({
        id: row.id,
        title: row.title,
        prompt_text: row.prompt_text,
        description: row.description ?? null,
        ai_model: row.ai_model,
        embedding: (row as any).embedding,
      });
      results.push({ id: row.id, ok: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error";
      console.error("[admin/backfill-prompt-embeddings] 처리 실패", row.id, err);
      results.push({ id: row.id, ok: false, error: message });
    }
  }

  return NextResponse.json({
    requested: limit,
    found: rows?.length ?? 0,
    success: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}

