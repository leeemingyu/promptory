import SortSelect from "@/features/prompts/components/sort-select";
import type { PromptSort } from "@/features/prompts/types";
import PromptCardGridSkeleton from "@/features/prompts/components/prompt-card-grid-skeleton";

type PromptsListSkeletonProps = {
  sort: PromptSort;
  query: string;
  model: string;
};

export default function PromptsListSkeleton({
  sort,
  query,
  model,
}: PromptsListSkeletonProps) {
  return (
    <>
      <div className="mb-4 flex w-full items-center justify-between">
        <p className="text-sm text-gray-500">프롬프트</p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">정렬</span>
          <SortSelect value={sort} query={query} model={model} />
        </div>
      </div>

      <PromptCardGridSkeleton
        count={9}
        showAuthor
        gridClassName="grid grid-cols-2 gap-6 lg:grid-cols-3"
      />
    </>
  );
}
