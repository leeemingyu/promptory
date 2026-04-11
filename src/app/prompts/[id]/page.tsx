import type { Metadata } from "next";
import {
  CopyButton,
  LikeButton,
  LocalRelativeTime,
  PromptMoreMenu,
  PromptText,
} from "@/features/prompts";

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
            프롬프트 목록
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
          <div className="flex justify-between items-center gap-4">
            <h1 className="text-3xl leading-normal font-bold">
              {prompt.title}
            </h1>
            <LikeButton
              promptId={prompt.id}
              initialLiked={initialLiked}
              size="lg"
            />
          </div>
          <div className="mt-4 flex items-center">
            <Link
              href={`/prompts?model=${encodeURIComponent(prompt.ai_model)}`}
              className="bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-gray-200 transition cursor-pointer"
            >
              {prompt.ai_model}
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex flex-col gap-1 text-gray-500">
              <span className="font-bold text-gray-600">{prompt.nickname}</span>
              <LocalRelativeTime value={prompt.created_at} />
            </div>
            {canEdit ? (
              <PromptMoreMenu promptId={prompt.id} canEdit={canEdit} />
            ) : null}
          </div>

          <div className="relative rounded-xl bg-gray-100 p-6 pb-3">
            <h3 className="mb-3 text-sm font-semibold uppercase text-gray-400">
              프롬프트
            </h3>
            <div className="absolute right-4 top-4">
              <CopyButton text={prompt.prompt_text} />
            </div>
            <PromptText text={prompt.prompt_text} />
          </div>
          {prompt.description && (
            <div className="">
              <h3 className="mb-3 text-sm font-semibold uppercase text-gray-400"></h3>
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-800">
                {prompt.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
