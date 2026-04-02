import Image from "next/image";
import Link from "next/link";
import LikeButton from "@/app/prompts/[id]/LikeButton";
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
    </main>
  );
}
