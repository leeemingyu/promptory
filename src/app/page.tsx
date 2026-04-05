import Link from "next/link";
import PromptCard from "@/components/prompts/PromptCard";
import {
  getCurrentUserId,
  getLikedPromptIds,
  getPopularPromptsCached,
} from "@/lib/data/prompts.server";

export default async function HomePage() {
  const prompts = await getPopularPromptsCached();
  const currentUserId = await getCurrentUserId();
  const likedPromptIds = currentUserId
    ? await getLikedPromptIds(currentUserId)
    : [];
  const likedSet = new Set(likedPromptIds);

  return (
    <main className="mx-auto max-w-7xl p-6">
      <section className="mb-11 rounded-2xl bg-white md:py-20 md:text-center">
        <h1 className="mt-4 break-keep text-3xl font-bold text-black sm:text-4xl">
          창작의 완성도를 높여줄 프롬프트 아카이브
        </h1>
        <p className="mx-auto mt-4 max-w-2xl break-keep text-sm text-gray-500 sm:text-4xl font-bold">
          프롬프토리
        </p>
      </section>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">인기 프롬프트</h1>
        <Link
          href="/prompts"
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          전체 프롬프트 보기
        </Link>
      </div>

      {prompts.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-gray-500">
          아직 인기 프롬프트가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              href={`/prompts/${prompt.id}`}
              showLike={Boolean(currentUserId)}
              liked={likedSet.has(prompt.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
