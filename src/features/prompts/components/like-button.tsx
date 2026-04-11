"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { toggleLike } from "@/features/prompts/services/prompts.client";
import { LIKE_FAILED_MESSAGE } from "@/utils/messages";

type LikeButtonProps = {
  promptId: string;
  initialLiked?: boolean;
  size?: "sm" | "md" | "lg";
};

export default function LikeButton({
  promptId,
  initialLiked = false,
  size = "md",
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

  const iconSizeClass =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-5 w-5" : "h-4 w-4";

  const buttonSizeClass =
    size === "sm" ? "p-1.5" : size === "lg" ? "p-2.5" : "p-2";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      aria-pressed={liked}
      aria-label="좋아요"
      className={`relative inline-flex cursor-pointer items-center justify-center transition ${`group rounded-full ${buttonSizeClass} ${
        liked ? "text-rose-600" : "text-gray-500 hover:text-rose-500"
      }`} ${isLoading ? "cursor-not-allowed opacity-70" : ""}`}
    >
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        {liked ? "좋아요 목록에서 제거" : "좋아요 목록에 추가"}
      </span>
      <Heart
        className={iconSizeClass}
        strokeWidth={2}
        fill={liked ? "currentColor" : "none"}
      />
    </button>
  );
}
