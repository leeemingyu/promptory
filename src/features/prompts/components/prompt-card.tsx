import Image from "next/image";
import Link from "next/link";
import type { Prompt } from "@/features/prompts/types";
import LikeButton from "./like-button";

type PromptCardProps = {
  prompt: Pick<
    Prompt,
    "id" | "title" | "ai_model" | "sample_image_url" | "nickname"
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
  return (
    <div className="relative rounded-xl bg-white transition">
      <Link
        href={href}
        className="group relative block aspect-3/4 overflow-hidden rounded-xl bg-gray-100"
      >
        {prompt.sample_image_url ? (
          <Image
            src={prompt.sample_image_url}
            alt={prompt.title}
            fill
            className="h-full w-full object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            이미지 없음
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-30" />
        <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
          {prompt.ai_model}
        </span>
      </Link>

      <div className="px-2 py-2">
        <div className="flex items-center justify-between gap-2">
          <Link href={href} className="min-w-0 flex-1">
            <h2 className="truncate font-semibold md:text-lg">
              {prompt.title}
            </h2>
          </Link>
          {showLike && <LikeButton promptId={prompt.id} initialLiked={liked} />}
        </div>

        {showAuthor ? (
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            {prompt.user_id ? (
              <Link
                href={`/profiles/${prompt.user_id}`}
                className="truncate hover:text-gray-600 hover:underline"
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
