"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { toggleLike } from "@/lib/data/prompts.client";
import { LIKE_FAILED_MESSAGE } from "@/lib/data/messages";

interface LikeButtonProps {
  promptId: string;
  initialLiked?: boolean;
  variant?: "default" | "icon";
}

export default function LikeButton({
  promptId,
  initialLiked = false,
  variant = "default",
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  const handleToggle = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (isLoading) return;
    setIsLoading(true);

    try {
      const nextLiked = !liked;
      setLiked(nextLiked);

      await toggleLike(promptId, nextLiked);
    } catch (error: unknown) {
      setLiked((prev) => !prev);
      const message =
        error instanceof Error ? error.message : LIKE_FAILED_MESSAGE;
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      aria-pressed={liked}
      aria-label="좋아요"
      className={`relative inline-flex cursor-pointer items-center justify-center transition ${
        variant === "icon"
          ? `group rounded-full p-2 ${
              liked ? "text-rose-600" : "text-gray-500 hover:text-rose-500"
            }`
          : `gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${
              liked
                ? "border-rose-500 bg-rose-50 text-rose-600"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`
      } ${isLoading ? "cursor-not-allowed opacity-70" : ""}`}
    >
      {variant === "icon" && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
          {liked ? "좋아요 목록에서 제거" : "좋아요 목록에 추가"}
        </span>
      )}
      <Heart
        className="h-4 w-4"
        strokeWidth={2}
        fill={liked ? "currentColor" : "none"}
      />
      {variant === "default" ? "좋아요" : null}
    </button>
  );
}
