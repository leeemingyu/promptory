import "server-only";

import DbPromptsInfinite from "@/features/prompts/components/db-prompts-infinite";
import type { PromptSort } from "@/features/prompts/types";
import {
  getCurrentUserId,
  getLikedPromptIds,
  getPromptsPage,
} from "@/features/prompts/services/prompts.server";

type PromptsListSectionProps = {
  sort: PromptSort;
  query: string;
  model: string;
  pageSize: number;
};

export default async function PromptsListSection({
  sort,
  query,
  model,
  pageSize,
}: PromptsListSectionProps) {
  const [prompts, currentUserId] = await Promise.all([
    getPromptsPage({
      sort,
      query: query || undefined,
      model: model || undefined,
      page: 0,
      limit: pageSize,
    }),
    getCurrentUserId(),
  ]);

  const likedPromptIds = currentUserId
    ? await getLikedPromptIds(currentUserId)
    : [];

  return (
    <DbPromptsInfinite
      key={`${sort}-${query}-${model}`}
      initialPrompts={prompts}
      query={query}
      model={model}
      sort={sort}
      pageSize={pageSize}
      likedIds={likedPromptIds}
      showLike={false}
    />
  );
}
