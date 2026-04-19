"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { toggleLike } from "@/features/prompts/services/prompts.client";
import { LIKE_FAILED_MESSAGE } from "@/utils/messages";

type LikeButtonProps = {
  promptId: string;
  initialLiked?: boolean;
  initialCount?: number;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
};

export default function LikeButton({
  promptId,
  initialLiked = false,
  initialCount = 0,
  showCount = false,
  size = "md",
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(Math.max(0, initialCount));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  useEffect(() => {
    setCount(Math.max(0, initialCount));
  }, [initialCount]);

  const handleToggle = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (isLoading) return;
    setIsLoading(true);

    const prevLiked = liked;
    const prevCount = count;

    try {
      const nextLiked = !liked;
      const nextCount = Math.max(0, count + (nextLiked ? 1 : -1));

      setLiked(nextLiked);
      setCount(nextCount);

      await toggleLike(promptId, nextLiked);
    } catch (error: unknown) {
      setLiked(prevLiked);
      setCount(prevCount);
      const message =
        error instanceof Error ? error.message : LIKE_FAILED_MESSAGE;
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const iconSizeClass =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-5 w-5" : "h-4 w-4";

  const buttonSizeClass = showCount
    ? size === "sm"
      ? "px-2 py-1.5"
      : size === "lg"
        ? "px-3.5 py-2.5"
        : "px-3 py-2"
    : size === "sm"
      ? "p-1.5"
      : size === "lg"
        ? "p-2.5"
        : "p-2";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      aria-pressed={liked}
      aria-label="좋아요"
      className={`relative inline-flex cursor-pointer items-center justify-center hover:bg-gray-100 transition ${`group rounded-lg ${buttonSizeClass}  ${
        liked ? "text-rose-600" : "text-gray-500"
      }`} ${isLoading ? "cursor-not-allowed opacity-70" : ""}`}
    >
      <Heart
        className={iconSizeClass}
        strokeWidth={2}
        fill={liked ? "currentColor" : "none"}
      />
      {showCount ? (
        <span className="ml-1 text-xs font-bold tabular-nums text-current">
          {count.toLocaleString()}
        </span>
      ) : null}
    </button>
  );
}
