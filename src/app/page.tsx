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
    <main className="mx-auto max-w-7xl md:p-6">
      <section className="mb-8 md:mb-11 rounded-2xl bg-white md:py-20 md:text-center">
        <h1 className="mt-4 break-keep text-3xl font-bold text-black sm:text-4xl">
          창작의 완성도를 높여줄 프롬프트 아카이브
        </h1>
        <p className="mx-auto mt-2 sm:mt-4 max-w-2xl break-keep text-3xl text-gray-500 sm:text-4xl font-bold">
          프롬프토리
        </p>
      </section>

      <div className="mb-6 flex flex-col items-start gap-10 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/prompts"
          className="order-1 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 sm:order-2"
        >
          전체 프롬프트
        </Link>
        <h1 className="order-2 text-3xl font-bold sm:order-1">인기 프롬프트</h1>
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
