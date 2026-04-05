import Image from "next/image";
import Link from "next/link";
import LikeButton from "@/app/prompts/[id]/LikeButton";
import type { Prompt } from "@/types";

type PromptCardProps = {
  prompt: Pick<
    Prompt,
    "id" | "title" | "ai_model" | "sample_image_url" | "nickname"
  >;
  href: string;
  showLike?: boolean;
  liked?: boolean;
};

export default function PromptCard({
  prompt,
  href,
  showLike = false,
  liked = false,
}: PromptCardProps) {
  return (
    <div className="relative rounded-xl bg-white transition">
      <Link href={href}>
        <div className="group relative aspect-3/4 overflow-hidden rounded-xl bg-gray-100">
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
          <div className="pointer-events-none absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-30" />
          <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
            {prompt.ai_model}
          </span>
        </div>

        <div className="px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="truncate text-lg font-semibold">{prompt.title}</h2>
            {showLike && (
              <LikeButton
                promptId={prompt.id}
                initialLiked={liked}
                variant="icon"
              />
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span>{prompt.nickname}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
