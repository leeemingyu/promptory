import Image from "next/image";
import Link from "next/link";
import LikeButton from "@/app/prompts/[id]/LikeButton";
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

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">전체 프롬프트</h1>
        <p className="mt-1 text-sm text-gray-500">
          {prompts.length}개 프롬프트
        </p>
      </div>

      <form
        method="get"
        action="/prompts"
        className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4"
      >
        {modelValue && <input type="hidden" name="model" value={modelValue} />}
        <input
          type="text"
          name="q"
          defaultValue={queryValue}
          placeholder="검색어를 입력해주세요"
          className="w-full max-w-sm rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
        />
        <select
          name="sort"
          defaultValue={sort}
          className="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
        >
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
          <option value="oldest">오래된순</option>
        </select>
        <button
          type="submit"
          className="cursor-pointer rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          검색
        </button>
        {hasFilters && (
          <Link
            href="/prompts"
            className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            초기화
          </Link>
        )}
      </form>

      <div className="grid items-start gap-8 grid-cols-4">
        <aside className="rounded-2xl border bg-white p-5 col-span-1">
          <h2 className="text-sm font-semibold text-gray-500">필터</h2>
          <form method="get" action="/prompts" className="mt-5 space-y-3">
            {queryValue && <input type="hidden" name="q" value={queryValue} />}
            {sort !== "latest" && (
              <input type="hidden" name="sort" value={sort} />
            )}
            <label className="block text-sm font-semibold text-gray-900">
              AI 모델
            </label>
            <select
              name="model"
              defaultValue={modelValue}
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">전체</option>
              {modelOptions.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full cursor-pointer rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              적용
            </button>
          </form>
        </aside>

        <section className="col-span-3">
          {prompts.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-gray-500">
              조건에 맞는 프롬프트가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="relative overflow-hidden rounded-xl shadow-sm transition hover:shadow-md"
                >
                  {currentUserId && (
                    <div className="absolute left-2 top-2 z-10">
                      <LikeButton
                        promptId={prompt.id}
                        initialLiked={likedSet.has(prompt.id)}
                      />
                    </div>
                  )}
                  <Link href={`/prompts/${prompt.id}`}>
                    <div className="relative aspect-[3/4] bg-gray-100">
                      {prompt.sample_image_url ? (
                        <Image
                          src={prompt.sample_image_url}
                          alt={prompt.title}
                          fill
                          className="h-full w-full object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          이미지 없음
                        </div>
                      )}
                      <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                        {prompt.ai_model}
                      </span>
                    </div>

                    <div className="p-4">
                      <h2 className="truncate text-lg font-semibold">
                        {prompt.title}
                      </h2>

                      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                        <span>작성자 {prompt.nickname}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
