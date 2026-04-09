import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { DbPromptsInfinite, MockPromptsInfinite, ModelFilter } from "@/features/prompts";


import type { PromptSort } from "@/features/prompts/types";
import {
  getCurrentUserId,
  getLikedPromptIds,
  getPromptsPage,
} from "@/features/prompts/services/prompts.server";
import { PROMPT_MODEL_OPTIONS } from "@/features/prompts";

export const metadata: Metadata = {
  title: "\uc804\uccb4 \ud504\ub86c\ud504\ud2b8",
  description: "AI \ud504\ub86c\ud504\ud2b8\ub97c \uac80\uc0c9\ub7a8\ud2f0\ub7ec\uc640 \uac80\uc0c9\uc21c \uc870\uc815\uc744 \ud1b5\ud574 \uc6d0\ud558\ub294 \ud504\ub86c\ud504\ud2b8\ub97c \ube60\ub974\uac8c \ucc3e\uc744 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
  openGraph: {
    title: "\uc804\uccb4 \ud504\ub86c\ud504\ud2b8 | Promptory",
    description: "AI \ud504\ub86c\ud504\ud2b8\ub97c \uac80\uc0c9\ub7a8\ud2f0\ub7ec\uc640 \uac80\uc0c9\uc21c \uc870\uc815\uc744 \ud1b5\ud574 \uc6d0\ud558\ub294 \ud504\ub86c\ud504\ud2b8\ub97c \ube60\ub974\uac8c \ucc3e\uc744 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
    url: "/prompts",
  },
  twitter: {
    title: "\uc804\uccb4 \ud504\ub86c\ud504\ud2b8 | Promptory",
    description: "AI \ud504\ub86c\ud504\ud2b8\ub97c \uac80\uc0c9\ub7a8\ud2f0\ub7ec\uc640 \uac80\uc0c9\uc21c \uc870\uc815\uc744 \ud1b5\ud574 \uc6d0\ud558\ub294 \ud504\ub86c\ud504\ud2b8\ub97c \ube60\ub974\uac8c \ucc3e\uc744 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
  },
};


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

  const pageSize = 20;
  let prompts: Awaited<ReturnType<typeof getPromptsPage>> = [];
  let currentUserId: string | null = null;
  let likedPromptIds: string[] = [];

  if (!isPerfTest) {
    [prompts, currentUserId] = await Promise.all([
      getPromptsPage({
        sort,
        query: queryValue || undefined,
        model: modelValue || undefined,
        page: 0,
        limit: pageSize,
      }),
      getCurrentUserId(),
    ]);

    likedPromptIds = currentUserId
      ? await getLikedPromptIds(currentUserId)
      : [];
  }

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
        <div className="relative w-full">
          <input
            type="text"
            name="q"
            defaultValue={queryValue}
            placeholder="검색어를 입력해주세요"
            className="w-full rounded-lg border border-gray-300 p-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-gray-500"
          />
          {queryValue && (
            <Link
              href={buildHref({ sort, q: "", model: modelValue })}
              aria-label="검색어 지우기"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Link>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 items-start gap-8 sm:grid-cols-4">
        <aside className="col-span-1 rounded-2xl bg-white sm:col-span-1">
          <h2 className="text-sm font-semibold text-gray-500">필터</h2>
          <div className="mt-5 space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              AI 모델
            </label>
            <ModelFilter
              options={PROMPT_MODEL_OPTIONS}
              value={modelValue}
              query={queryValue}
              sort={sort}
              perfTest={isPerfTest}
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
          {isPerfTest ? (
            <MockPromptsInfinite
              key={`perf-${sort}-${queryValue}-${modelValue}`}
              query={queryValue}
              model={modelValue}
              sort={sort}
              totalCount={1000}
              pageSize={pageSize}
            />
          ) : (
            <DbPromptsInfinite
              key={`${sort}-${queryValue}-${modelValue}`}
              initialPrompts={prompts}
              query={queryValue}
              model={modelValue}
              sort={sort}
              pageSize={pageSize}
              likedIds={likedPromptIds}
              showLike={true}
            />
          )}
        </section>
      </div>
    </main>
  );
}


