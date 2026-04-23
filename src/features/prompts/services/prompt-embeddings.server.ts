import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";
const EMBEDDING_DIM = 384;

type EmbeddingSource = {
  id: string;
  title: string;
  prompt_text: string;
  description: string | null;
  ai_model: string;
  embedding: unknown;
};

type TransformerEmbedding = {
  data: Float32Array | number[];
};

let extractorPromise: Promise<
  (text: string, options?: Record<string, unknown>) => Promise<TransformerEmbedding>
> | null = null;

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const { pipeline, env } = await import("@xenova/transformers");

      env.allowLocalModels = false;
      env.useBrowserCache = false;

      // Vercel Serverless에서 임시 디렉토리를 활용해 모델 캐시를 최대한 재사용합니다.
      env.cacheDir = process.env.TRANSFORMERS_CACHE_DIR ?? "/tmp/transformers";

      return pipeline("feature-extraction", MODEL_ID, {
        quantized: true,
      });
    })();
  }
  return extractorPromise;
}

function buildEmbeddingText(source: Pick<
  EmbeddingSource,
  "title" | "prompt_text" | "description" | "ai_model"
>): string {
  const parts = [
    source.title?.trim(),
    source.ai_model?.trim(),
    source.description?.trim(),
    source.prompt_text?.trim(),
  ].filter((v): v is string => Boolean(v && v.trim()));

  return parts.join("\n\n");
}

function toVectorLiteral(values: readonly number[]) {
  return `[${values.join(",")}]`;
}

function normalizeVectorValue(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && value.every((v) => typeof v === "number")) {
    return toVectorLiteral(value);
  }
  return null;
}

async function embedText(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  const arr = Array.from(output.data as Float32Array | number[]);

  if (arr.length !== EMBEDDING_DIM) {
    throw new Error(
      `[prompt-embeddings] 임베딩 차원이 맞지 않습니다. expected=${EMBEDDING_DIM}, actual=${arr.length}`,
    );
  }

  return arr;
}

export async function getOrCreatePromptEmbeddingVectorLiteral(
  source: EmbeddingSource,
): Promise<string> {
  const existing = normalizeVectorValue(source.embedding);
  if (existing) return existing;

  const text = buildEmbeddingText(source);
  if (!text.trim()) {
    throw new Error("[prompt-embeddings] 임베딩 생성 텍스트가 비어있습니다.");
  }

  const vector = await embedText(text);
  const literal = toVectorLiteral(vector);

  const admin = createAdminClient();
  const { error } = await admin
    .from("prompts")
    .update({ embedding: literal })
    .eq("id", source.id);

  if (error) {
    console.error("[prompt-embeddings] DB 업데이트 실패", error);
    throw new Error("[prompt-embeddings] 임베딩 저장에 실패했습니다.");
  }

  return literal;
}

