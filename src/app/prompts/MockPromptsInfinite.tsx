"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PromptCard from "@/components/prompts/PromptCard";
import SortSelect from "@/app/prompts/SortSelect";
import type { PromptSort } from "@/lib/data/prompts.server";

const MODEL_OPTIONS = [
  "GPT-4",
  "Midjourney",
  "Stable Diffusion",
  "DALL-E 3",
  "Claude 3",
  "Etc",
];

type MockPrompt = {
  id: string;
  title: string;
  prompt_text: string;
  description: string;
  ai_model: string;
  sample_image_url: string;
  created_at: string;
  nickname: string;
  like_count: number;
};

type MockPromptsInfiniteProps = {
  query: string;
  model: string;
  sort: PromptSort;
  totalCount?: number;
  pageSize?: number;
};

const generateMockPrompts = (count: number): MockPrompt[] =>
  Array.from({ length: count }, (_, index) => {
    const order = index + 1;
    const model = MODEL_OPTIONS[index % MODEL_OPTIONS.length];
    const createdAt = new Date(
      Date.now() - index * 1000 * 60 * 60,
    ).toISOString();

    return {
      id: `mock-${order}`,
      title: `샘플 프롬프트 ${order}`,
      prompt_text: `샘플 프롬프트 ${order}번입니다.`,
      description: `테스트 데이터 ${order}번 설명입니다.`,
      ai_model: model,
      sample_image_url: `https://picsum.photos/seed/prompt-${order}/600/800`,
      created_at: createdAt,
      nickname: `Creator ${((order - 1) % 20) + 1}`,
      like_count: Math.max(0, 1000 - order * 3),
    };
  });

export default function MockPromptsInfinite({
  query,
  model,
  sort,
  totalCount = 100,
  pageSize = 20,
}: MockPromptsInfiniteProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(1);

  const filteredPrompts = useMemo(() => {
    const allPrompts = generateMockPrompts(totalCount);
    const lowerQuery = query.toLowerCase();

    const filtered = allPrompts.filter((prompt) => {
      if (model && prompt.ai_model !== model) return false;
      if (!lowerQuery) return true;
      return (
        prompt.title.toLowerCase().includes(lowerQuery) ||
        prompt.description.toLowerCase().includes(lowerQuery)
      );
    });

    return sort === "popular"
      ? filtered.sort((a, b) => b.like_count - a.like_count)
      : sort === "oldest"
        ? filtered.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          )
        : filtered.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );
  }, [model, query, sort, totalCount]);

  const visibleCount = Math.min(page * pageSize, filteredPrompts.length);
  const visiblePrompts = filteredPrompts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPrompts.length;

  useEffect(() => {
    if (!hasMore) return;
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setPage((prev) => prev + 1);
          }
        });
      },
      { rootMargin: "200px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [filteredPrompts.length, hasMore, pageSize]);

  const buildHref = (next: {
    sort?: PromptSort;
    q?: string;
    model?: string;
  }) => {
    const params = new URLSearchParams();
    params.set("perf_test", "true");
    if (next.sort && next.sort !== "latest") params.set("sort", next.sort);
    if (next.q) params.set("q", next.q);
    if (next.model) params.set("model", next.model);
    const qs = params.toString();
    return `/prompts?${qs}`;
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between w-full">
        <p className="text-sm text-gray-500">
          {filteredPrompts.length}개 프롬프트
        </p>
        <div className="flex gap-2 items-center">
          <span className="text-xs font-semibold text-gray-500">정렬</span>
          <SortSelect value={sort} query={query} model={model} perfTest />
        </div>
      </div>

      {filteredPrompts.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-gray-500">
          조건에 맞는 프롬프트가 없습니다.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {visiblePrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                href={buildHref({ sort, q: query, model })}
                showLike={true}
                liked={false}
              />
            ))}
          </div>
          {hasMore && <div ref={sentinelRef} className="h-10" />}
        </>
      )}
    </>
  );
}
