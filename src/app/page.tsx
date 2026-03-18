import type { Prompt } from "@/types";
import Image from "next/image";
import Link from "next/link";

async function getPrompts(): Promise<Prompt[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prompts`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("프롬프트 목록을 불러오지 못했습니다.");
  }

  return (await res.json()) as Prompt[];
}

export default async function HomePage() {
  const prompts = await getPrompts();

  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="mb-8 text-3xl font-bold">인기 AI 프롬프트</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="overflow-hidden rounded-xl border shadow-sm transition hover:shadow-md"
          >
            <Link href={`/prompts/${prompt.id}`}>
              <div className="relative aspect-video bg-gray-100">
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
                    No Image
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
                  <span>By {prompt.username}</span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
