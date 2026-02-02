import { Prompt } from "@/types";
import Image from "next/image";
import Link from "next/link";

async function getPrompts(): Promise<Prompt[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prompts`, {
    cache: "no-store", // 실시간 데이터 확인을 위해 캐시 방지
  });
  if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
  return res.json();
}

export default async function HomePage() {
  const prompts = await getPrompts();

  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">🔥 인기 AI 프롬프트</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
          >
            <Link href={`/prompts/${prompt.id}`}>
              {/* 이미지 영역 */}
              <div className="aspect-video bg-gray-100 relative">
                {prompt.sample_image_url ? (
                  <Image
                    src={prompt.sample_image_url}
                    alt={prompt.title}
                    fill
                    className="object-cover w-full h-full"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
                <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {prompt.ai_model}
                </span>
              </div>

              {/* 컨텐츠 영역 */}
              <div className="p-4">
                <h2 className="font-semibold text-lg truncate">
                  {prompt.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {prompt.prompt_text}
                </p>
                <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
                  <span>By {prompt.username}</span>
                  <span>
                    {new Date(prompt.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
