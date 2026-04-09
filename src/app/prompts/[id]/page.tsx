import type { Metadata } from "next";
import { LikeButton, PromptActions } from "@/features/prompts";

import { CopyButton, PromptText } from "@/features/prompts";

import {
  getCurrentUserId,
  getPromptById,
  isPromptLiked,
} from "@/features/prompts/services/prompts.server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface PromptDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const prompt = await getPromptById(id);
  if (!prompt) {
    return {
      title: "\ud504\ub86c\ud504\ud2b8 \uc0c1\uc138",
      openGraph: {
        title: "\ud504\ub86c\ud504\ud2b8 \uc0c1\uc138 | Promptory",
        url: `/prompts/${id}`,
        images: ["/og.png"],
      },
      twitter: {
        title: "\ud504\ub86c\ud504\ud2b8 \uc0c1\uc138 | Promptory",
        images: ["/og.png"],
      },
    };
  }

  return {
    title: `${prompt.title} | Promptory`,
    openGraph: {
      title: `${prompt.title} | Promptory`,
      url: `/prompts/${prompt.id}`,
      images: [prompt.sample_image_url || "/og.png"],
    },
    twitter: {
      title: `${prompt.title} | Promptory`,
      images: [prompt.sample_image_url || "/og.png"],
    },
  };
}

export default async function PromptDetailPage({
  params,
  searchParams,
}: PromptDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const browseParams = new URLSearchParams();
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      browseParams.set(key, value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => browseParams.append(key, item));
    }
  });
  const browseHref = browseParams.toString()
    ? `/prompts?${browseParams.toString()}`
    : "/prompts";

  const promptRow = await getPromptById(id);
  if (!promptRow) {
    notFound();
  }

  const prompt = promptRow;

  const currentUserId = await getCurrentUserId();
  const canEdit = Boolean(currentUserId && currentUserId === prompt.user_id);
  let initialLiked = false;
  if (currentUserId) {
    initialLiked = await isPromptLiked(id, currentUserId);
  }

  return (
    <main className="mx-auto max-w-6xl md:p-6">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={browseHref}
            className="inline-flex items-center rounded-lg text-gray-700 border border-gray-200 px-3 py-2 text-sm font-semibold transition hover:bg-gray-50"
          >
            <ChevronLeft size={18} />
            모든 프롬프트 둘러보기
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative aspect-3/4 w-full max-h-140 overflow-hidden rounded-2xl bg-gray-100">
          {prompt.sample_image_url ? (
            <Image
              src={prompt.sample_image_url}
              alt={prompt.title}
              fill
              className="object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              이미지 없음
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{prompt.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-gray-500">
              <span>
                작성자 <strong>{prompt.nickname}</strong>
              </span>
              <span>|</span>
              <span>{new Date(prompt.created_at).toLocaleDateString()}</span>
              <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {prompt.ai_model}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <LikeButton promptId={prompt.id} initialLiked={initialLiked} />
              <PromptActions promptId={prompt.id} canEdit={canEdit} />
            </div>
          </div>

          {prompt.description && (
            <div className="rounded-xl bg-gray-50 p-6">
              <h3 className="mb-3 text-sm font-semibold uppercase text-gray-400">
                설명
              </h3>
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-800">
                {prompt.description}
              </p>
            </div>
          )}
          <div className="relative rounded-xl bg-gray-50 p-6 pb-3">
            <h3 className="mb-3 text-sm font-semibold uppercase text-gray-400">
              프롬프트
            </h3>
            <div className="absolute right-4 top-4">
              <CopyButton text={prompt.prompt_text} />
            </div>
            <PromptText text={prompt.prompt_text} />
          </div>
        </div>
      </div>
    </main>
  );
}


