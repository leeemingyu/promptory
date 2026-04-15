"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { usePromptsNavigationSkeleton } from "@/features/prompts/hooks/use-prompts-navigation-skeleton";

type PromptsResetButtonProps = {
  href: string;
  disabled: boolean;
};

export default function PromptsResetButton({
  href,
  disabled,
}: PromptsResetButtonProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const startSkeleton = usePromptsNavigationSkeleton((s) => s.start);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        startSkeleton();
        startTransition(() => {
          router.push(href);
        });
      }}
      className={[
        "w-full rounded-lg border px-4 py-2 text-center text-sm font-semibold transition border-gray-300",
        disabled
          ? "text-gray-500 opacity-60"
          : "cursor-pointer text-gray-700 hover:bg-gray-50",
      ].join(" ")}
    >
      초기화
    </button>
  );
}

