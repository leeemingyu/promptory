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

type PromptsPageProps = {
  searchParams?: Promise<{
    sort?: string;
    q?: string;
    model?: string;
    perf_test?: string;
  }>;
};

export default async function PromptsPage({ searchParams }: PromptsPageProps) {
  const resolvedParams = await searchParams;
  const sortParam = resolvedParams?.sort;
  const queryParam = resolvedParams?.q ?? "";
  const modelParam = resolvedParams?.model ?? "";
  const perfTestParam = resolvedParams?.perf_test;
  const isPerfTest = perfTestParam === "true";

  const queryValue = queryParam.trim();
  const modelValue = modelParam.trim();
  const sort: PromptSort =
    sortParam === "popular"
      ? "popular"
      : sortParam === "oldest"
        ? "oldest"
        : "latest";

  let prompts: MockPrompt[] | Awaited<ReturnType<typeof getPrompts>>;
  let currentUserId: string | null = null;
  let likedSet = new Set<string>();

  if (isPerfTest) {
    const allPrompts = generateMockPrompts(100);
    const filtered = allPrompts.filter((prompt) => {
      if (modelValue && prompt.ai_model !== modelValue) return false;
      if (!queryValue) return true;
      const lower = queryValue.toLowerCase();
      return (
        prompt.title.toLowerCase().includes(lower) ||
        prompt.description.toLowerCase().includes(lower)
      );
    });

    prompts =
      sort === "popular"
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
  } else {
    [prompts, currentUserId] = await Promise.all([
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
    likedSet = new Set(likedPromptIds);
  }

  const hasFilters = Boolean(queryValue || modelValue || sort !== "latest");

  const buildHref = (next: {
    sort?: PromptSort;
    q?: string;
    model?: string;
  }) => {
    const params = new URLSearchParams();
    if (isPerfTest) params.set("perf_test", "true");
    if (next.sort && next.sort !== "latest") params.set("sort", next.sort);
    if (next.q) params.set("q", next.q);
    if (next.model) params.set("model", next.model);
    const qs = params.toString();
    return qs ? `/prompts?${qs}` : "/prompts";
  };

  const buildDetailHref = (id: string) => {
    if (isPerfTest)
      return buildHref({ sort, q: queryValue, model: modelValue });
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
        {isPerfTest && <input type="hidden" name="perf_test" value="true" />}
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
              options={MODEL_OPTIONS}
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
