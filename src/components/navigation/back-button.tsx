"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

type BackButtonProps = {
  className?: string;
  confirmMessage?: string;
  children?: ReactNode;
};

export default function BackButton({
  className,
  confirmMessage,
  children = "뒤로",
}: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (confirmMessage && !confirm(confirmMessage)) return;
        router.back();
      }}
      className={[
        "inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <ChevronLeft size={18} />
      {children}
    </button>
  );
}
