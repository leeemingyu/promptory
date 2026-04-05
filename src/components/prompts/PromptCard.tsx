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
    <div className="relative overflow-hidden rounded-xl shadow-sm transition hover:shadow-md">
      {showLike && (
        <div className="absolute left-2 top-2 z-10">
          <LikeButton promptId={prompt.id} initialLiked={liked} />
        </div>
      )}
      <Link href={href}>
        <div className="relative aspect-[3/4] bg-gray-100">
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
          <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
            {prompt.ai_model}
          </span>
        </div>

        <div className="p-4">
          <h2 className="truncate text-lg font-semibold">{prompt.title}</h2>

          <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
            <span>작성자 {prompt.nickname}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
