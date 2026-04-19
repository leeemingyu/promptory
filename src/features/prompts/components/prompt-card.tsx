import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

import type { Prompt } from "@/features/prompts/types";
import LikeButton from "./like-button";
import { getPromptImagePublicUrl } from "@/features/prompts/services/prompt-image-url";

type PromptCardProps = {
  prompt: Pick<
    Prompt,
    | "id"
    | "title"
    | "ai_model"
    | "sample_image_url"
    | "nickname"
    | "likes_count"
  > & { user_id?: string | null };
  href: string;
  showLike?: boolean;
  liked?: boolean;
  showAuthor?: boolean;
};

export default function PromptCard({
  prompt,
  href,
  showLike = false,
  liked = false,
  showAuthor = true,
}: PromptCardProps) {
  const imageSrc = getPromptImagePublicUrl(prompt.sample_image_url);
  const likesCount = Math.max(0, prompt.likes_count ?? 0);

  return (
    <div className="group relative rounded-xl bg-white transition">
      {/* Full-card link. Author/Like are rendered above this with higher z-index. */}
      <Link
        href={href}
        aria-label={`${prompt.title} 상세로 이동`}
        className="absolute inset-0 z-10 rounded-xl"
      >
        <span className="sr-only">{prompt.title}</span>
      </Link>

      <div className="relative">
        <div className="relative block aspect-3/4 overflow-hidden rounded-xl bg-gray-100">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={prompt.title}
              fill
              className="h-full w-full object-cover transition group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              이미지 없음
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <h2 className="p-2 pb-0 min-w-0 flex-1 truncate font-semibold md:text-lg">
            {prompt.title}
          </h2>

          {showLike ? (
            <div className="relative z-20 p-2 pb-0">
              <LikeButton
                promptId={prompt.id}
                initialLiked={liked}
                initialCount={likesCount}
                showCount
                size="sm"
              />
            </div>
          ) : null}
        </div>

        {showAuthor ? (
          <div className="pointer-events-none flex items-center justify-between text-xs text-gray-400">
            {prompt.user_id ? (
              <Link
                href={`/profiles/${prompt.user_id}`}
                className="p-2 pointer-events-auto relative z-20 truncate hover:text-gray-600 hover:underline"
              >
                {prompt.nickname}
              </Link>
            ) : (
              <span className="truncate">{prompt.nickname}</span>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
