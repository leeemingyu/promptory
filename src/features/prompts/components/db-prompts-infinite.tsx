"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PromptCard from "./prompt-card";
import SortSelect from "./sort-select";
import type { PromptSort } from "../types";

type PromptListItem = {
  id: string;
  title: string;
  ai_model: string;
  sample_image_url: string | null;
  nickname: string;
};

type DbPromptsInfiniteProps = {
  initialPrompts: PromptListItem[];
  query: string;
  model: string;
  sort: PromptSort;
  pageSize?: number;
  likedIds: string[];
  showLike: boolean;
};

export default function DbPromptsInfinite({
  initialPrompts,
  query,
  model,
  sort,
  pageSize = 20,
  likedIds,
  showLike,
}: DbPromptsInfiniteProps) {
  const [items, setItems] = useState<PromptListItem[]>(initialPrompts);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPrompts.length === pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const likedSet = useMemo(() => new Set(likedIds), [likedIds]);
  const buildDetailHref = (id: string) => {
    const params = new URLSearchParams();
    if (sort !== "latest") params.set("sort", sort);
    if (query) params.set("q", query);
    if (model) params.set("model", model);
    const qs = params.toString();
    return qs ? `/prompts/${id}?${qs}` : `/prompts/${id}`;
  };

  useEffect(() => {
    setItems(initialPrompts);
    setPage(1);
    setHasMore(initialPrompts.length === pageSize);
  }, [initialPrompts, pageSize, query, model, sort]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(pageSize));
      if (sort && sort !== "latest") params.set("sort", sort);
      if (query) params.set("q", query);
      if (model) params.set("model", model);
      const response = await fetch(`/api/prompts?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load prompts");
      const { data } = (await response.json()) as { data: PromptListItem[] };
      setItems((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
      setHasMore(data.length === pageSize);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, model, page, pageSize, query, sort]);

  useEffect(() => {
    if (!hasMore) return;
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) void loadMore();
        });
      },
      { rootMargin: "200px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <>
      <div className="mb-4 flex w-full items-center justify-between">
        <p className="text-sm text-gray-500">{items.length}개 프롬프트</p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">정렬</span>
          <SortSelect value={sort} query={query} model={model} />
        </div>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-gray-500">
          조건에 맞는 프롬프트가 없습니다.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
            {items.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                href={buildDetailHref(prompt.id)}
                showLike={showLike}
                liked={likedSet.has(prompt.id)}
              />
            ))}
          </div>
          {hasMore && <div ref={sentinelRef} className="h-10" />}
        </>
      )}
    </>
  );
}
