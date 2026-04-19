import type { Metadata } from "next";
import { Suspense } from "react";
import { MockPromptsInfinite, ModelFilter } from "@/features/prompts";

import type { PromptSort } from "@/features/prompts/types";
import { PROMPT_MODEL_OPTIONS } from "@/features/prompts";
import PromptsListSection from "@/features/prompts/components/prompts-list-section.server";
import PromptsListSkeleton from "@/features/prompts/components/prompts-list-skeleton";
import PromptsSearchForm from "@/features/prompts/components/prompts-search-form";
import PromptsResetButton from "@/features/prompts/components/prompts-reset-button";

export const metadata: Metadata = {
  title: "\uc804\uccb4 \ud504\ub86c\ud504\ud2b8",
  description:
    "AI \ud504\ub86c\ud504\ud2b8\ub97c \uac80\uc0c9\ub7a8\ud2f0\ub7ec\uc640 \uac80\uc0c9\uc21c \uc870\uc815\uc744 \ud1b5\ud574 \uc6d0\ud558\ub294 \ud504\ub86c\ud504\ud2b8\ub97c \ube60\ub974\uac8c \ucc3e\uc744 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
  openGraph: {
    title: "\uc804\uccb4 \ud504\ub86c\ud504\ud2b8 | Promptory",
    description:
      "AI \ud504\ub86c\ud504\ud2b8\ub97c \uac80\uc0c9\ub7a8\ud2f0\ub7ec\uc640 \uac80\uc0c9\uc21c \uc870\uc815\uc744 \ud1b5\ud574 \uc6d0\ud558\ub294 \ud504\ub86c\ud504\ud2b8\ub97c \ube60\ub974\uac8c \ucc3e\uc744 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
    url: "/prompts",
  },
  twitter: {
    title: "\uc804\uccb4 \ud504\ub86c\ud504\ud2b8 | Promptory",
    description:
      "AI \ud504\ub86c\ud504\ud2b8\ub97c \uac80\uc0c9\ub7a8\ud2f0\ub7ec\uc640 \uac80\uc0c9\uc21c \uc870\uc815\uc744 \ud1b5\ud574 \uc6d0\ud558\ub294 \ud504\ub86c\ud504\ud2b8\ub97c \ube60\ub974\uac8c \ucc3e\uc744 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
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

      <PromptsSearchForm
        sort={sort}
        query={queryValue}
        model={modelValue}
        perfTest={isPerfTest}
      />

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
            <PromptsResetButton
              disabled={!modelValue}
              href={buildHref({ sort, q: queryValue })}
            />
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
            <>
              <Suspense
                fallback={
                  <PromptsListSkeleton
                    sort={sort}
                    query={queryValue}
                    model={modelValue}
                  />
                }
              >
                <PromptsListSection
                  sort={sort}
                  query={queryValue}
                  model={modelValue}
                  pageSize={pageSize}
                />
              </Suspense>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
