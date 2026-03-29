"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { toggleLike } from "@/lib/data/prompts.client";
import { LIKE_FAILED_MESSAGE } from "@/lib/data/messages";

interface LikeButtonProps {
  promptId: string;
  initialLiked?: boolean;
}

export default function LikeButton({
  promptId,
  initialLiked = false,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
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
      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        liked
          ? "border-rose-500 bg-rose-50 text-rose-600"
          : "border-gray-200 text-gray-600 hover:bg-gray-50"
      } ${isLoading ? "cursor-not-allowed opacity-70" : ""}`}
    >
      <Heart
        className="h-4 w-4"
        strokeWidth={2}
        fill={liked ? "currentColor" : "none"}
      />
      좋아요
    </button>
  );
}
