import Image from "next/image";
import Link from "next/link";
import LikeButton from "@/app/prompts/[id]/LikeButton";
import {
  getCurrentUserId,
  getLikedPromptIds,
  getPrompts,
  type PromptSort,
} from "@/lib/data/prompts.server";

type HomePageProps = {
  searchParams?: Promise<{ sort?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const sortParam = resolvedParams?.sort;
  const sort: PromptSort =
    sortParam === "popular"
      ? "popular"
      : sortParam === "oldest"
        ? "oldest"
        : "latest";

  const prompts = await getPrompts(sort);
  const currentUserId = await getCurrentUserId();
  const likedPromptIds = currentUserId
    ? await getLikedPromptIds(currentUserId)
    : [];
  const likedSet = new Set(likedPromptIds);
  const filters = [
    { key: "latest", label: "최신순", href: "/" },
    { key: "popular", label: "인기순", href: "/?sort=popular" },
    { key: "oldest", label: "오래된순", href: "/?sort=oldest" },
  ] as const;

  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="mb-6 text-3xl font-bold">프롬프트 리스트</h1>
      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = sort === filter.key;
          return (
            <Link
              key={filter.key}
              href={filter.href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                isActive
                  ? "border-black bg-black text-white"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

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
    </main>
  );
}
