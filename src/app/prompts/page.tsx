import Link from "next/link";
import PromptCard from "@/components/prompts/PromptCard";
import ModelFilter from "@/app/prompts/ModelFilter";
import SortSelect from "@/app/prompts/SortSelect";
import {
  getCurrentUserId,
  getLikedPromptIds,
  getPrompts,
  type PromptSort,
} from "@/lib/data/prompts.server";

type PromptsPageProps = {
  searchParams?: Promise<{ sort?: string; q?: string; model?: string }>;
};

export default async function PromptsPage({ searchParams }: PromptsPageProps) {
  const resolvedParams = await searchParams;
  const sortParam = resolvedParams?.sort;
  const queryParam = resolvedParams?.q ?? "";
  const modelParam = resolvedParams?.model ?? "";

  const queryValue = queryParam.trim();
  const modelValue = modelParam.trim();
  const sort: PromptSort =
    sortParam === "popular"
      ? "popular"
      : sortParam === "oldest"
        ? "oldest"
        : "latest";

  const [prompts, currentUserId] = await Promise.all([
    getPrompts({
      sort,
      query: queryValue || undefined,
      model: modelValue || undefined,
    }),
    getCurrentUserId(),
  ]);

  const likedPromptIds = currentUserId
    ? await getLikedPromptIds(currentUserId)
    : [];
  const likedSet = new Set(likedPromptIds);
  const hasFilters = Boolean(queryValue || modelValue || sort !== "latest");

  const modelOptions = [
    "GPT-4",
    "Midjourney",
    "Stable Diffusion",
    "DALL-E 3",
    "Claude 3",
    "Etc",
  ];

  const buildHref = (next: {
    sort?: PromptSort;
    q?: string;
    model?: string;
  }) => {
    const params = new URLSearchParams();
    if (next.sort && next.sort !== "latest") params.set("sort", next.sort);
    if (next.q) params.set("q", next.q);
    if (next.model) params.set("model", next.model);
    const qs = params.toString();
    return qs ? `/prompts?${qs}` : "/prompts";
  };

  const buildDetailHref = (id: string) => {
    const params = new URLSearchParams();
    if (sort !== "latest") params.set("sort", sort);
    if (queryValue) params.set("q", queryValue);
    if (modelValue) params.set("model", modelValue);
    const qs = params.toString();
    return qs ? `/prompts/${id}?${qs}` : `/prompts/${id}`;
  };

  return (
    <main className="mx-auto max-w-7xl md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">전체 프롬프트</h1>
      </div>

      <form
        method="get"
        action="/prompts"
        className="mb-6 flex flex-wrap items-center gap-3 justify-between rounded-2xl bg-white py-4"
      >
        {modelValue && <input type="hidden" name="model" value={modelValue} />}
        {sort !== "latest" && <input type="hidden" name="sort" value={sort} />}
        <input
          type="text"
          name="q"
          defaultValue={queryValue}
          placeholder="검색어를 입력해주세요"
          className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:ring-2 focus:ring-black"
        />
      </form>

      <div className="grid grid-cols-1 items-start gap-8 sm:grid-cols-4">
        <aside className="col-span-1 rounded-2xl bg-white sm:col-span-1">
          <h2 className="text-sm font-semibold text-gray-500">필터</h2>
          <div className="mt-5 space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              AI 모델
            </label>
            <ModelFilter
              options={modelOptions}
              value={modelValue}
              query={queryValue}
              sort={sort}
            />
            <Link
              href={buildHref({ sort, q: queryValue })}
              aria-disabled={!modelValue}
              className={`w-full rounded-lg border  px-4 py-2 text-center text-sm font-semibold transition border-gray-300 ${
                modelValue
                  ? "cursor-pointer text-gray-700 hover:bg-gray-50"
                  : "pointer-events-none text-gray-500 opacity-60"
              }`}
            >
              초기화
            </Link>
          </div>
        </aside>

        <section className="col-span-1 sm:col-span-3">
          <div className="mb-4 flex items-center justify-between w-full">
            <p className="text-sm text-gray-500">{prompts.length}개 프롬프트</p>
            <div className="flex gap-2 items-center">
              <span className="text-xs font-semibold text-gray-500">정렬</span>
              <SortSelect value={sort} query={queryValue} model={modelValue} />
            </div>
          </div>
          {prompts.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-gray-500">
              조건에 맞는 프롬프트가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {prompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  href={buildDetailHref(prompt.id)}
                  showLike={Boolean(currentUserId)}
                  liked={likedSet.has(prompt.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
