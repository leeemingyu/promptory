"use client";

import { useRouter } from "next/navigation";
import { memo, useTransition } from "react";
import { usePromptsNavigationSkeleton } from "@/features/prompts/hooks/use-prompts-navigation-skeleton";

type SortSelectProps = {
  value: string;
  query: string;
  model: string;
  perfTest?: boolean;
};

function SortSelect({
  value,
  query,
  model,
  perfTest = false,
}: SortSelectProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const startSkeleton = usePromptsNavigationSkeleton((s) => s.start);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSort = event.target.value;
    const params = new URLSearchParams();
    if (perfTest) params.set("perf_test", "true");
    if (nextSort && nextSort !== "latest") params.set("sort", nextSort);
    if (query) params.set("q", query);
    if (model) params.set("model", model);
    const qs = params.toString();
    startSkeleton();
    startTransition(() => {
      router.push(qs ? `/prompts?${qs}` : "/prompts");
    });
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className="rounded-lg border border-gray-300 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-gray-500"
    >
      <option value="latest">최신순</option>
      <option value="popular">인기순</option>
      <option value="oldest">오래된순</option>
    </select>
  );
}

export default memo(SortSelect);
