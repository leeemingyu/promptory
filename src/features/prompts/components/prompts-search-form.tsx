"use client";

import { useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { PromptSort } from "@/features/prompts/types";
import { usePromptsNavigationSkeleton } from "@/features/prompts/hooks/use-prompts-navigation-skeleton";

type PromptsSearchFormProps = {
  sort: PromptSort;
  query: string;
  model: string;
  perfTest: boolean;
};

export default function PromptsSearchForm({
  sort,
  query,
  model,
  perfTest,
}: PromptsSearchFormProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const startSkeleton = usePromptsNavigationSkeleton((s) => s.start);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const buildHref = (next: { sort?: PromptSort; q?: string; model?: string }) => {
    const params = new URLSearchParams();
    if (perfTest) params.set("perf_test", "true");
    if (next.sort && next.sort !== "latest") params.set("sort", next.sort);
    if (next.q) params.set("q", next.q);
    if (next.model) params.set("model", next.model);
    const qs = params.toString();
    return qs ? `/prompts?${qs}` : "/prompts";
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = (inputRef.current?.value ?? "").trim();
    startSkeleton();
    startTransition(() => {
      router.push(buildHref({ sort, q: nextQuery, model }), { scroll: false });
    });
  };

  const clearHref = buildHref({ sort, q: "", model });

  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 flex flex-wrap items-center gap-3 justify-between rounded-2xl bg-white py-4"
    >
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          name="q"
          defaultValue={query}
          placeholder="검색어를 입력해주세요"
          className="w-full rounded-lg border border-gray-300 p-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-gray-500"
        />
        {query ? (
          <Link
            href={clearHref}
            aria-label="검색어 지우기"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:text-gray-700"
            onClick={() => {
              startSkeleton();
            }}
          >
            <X className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </form>
  );
}
