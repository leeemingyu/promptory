import PromptActions from "@/app/prompts/[id]/PromptActions";
import { promptApi } from "@/lib/api";
import Image from "next/image";
import { notFound } from "next/navigation";

interface PromptDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PromptDetailPage({
  params,
}: PromptDetailPageProps) {
  const { id } = await params;

  const prompt = await promptApi.getById(id);

  if (!prompt) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{prompt.title}</h1>
        <div className="flex items-center gap-2 text-gray-500 mt-2">
          <span>
            By <strong>{prompt.username}</strong>
          </span>
          <span>•</span>
          <span>{new Date(prompt.created_at).toLocaleDateString()}</span>
          <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {prompt.ai_model}
          </span>
        </div>

        {/* 🔽 수정/삭제 버튼 영역 */}
        <PromptActions promptId={prompt.id} owner={prompt.username} />
      </div>

      {/* 이미지 섹션 */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 mb-8 border">
        {prompt.sample_image_url ? (
          <Image
            src={prompt.sample_image_url}
            alt={prompt.title}
            fill
            className="object-contain" // 상세페이지에선 원본 비율 보존을 위해 contain 권장
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* 프롬프트 내용 섹션 */}
      <div className="bg-gray-50 rounded-xl p-6 border relative">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
          Prompt
        </h3>
        <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
          {prompt.prompt_text}
        </p>

        {/* 복사 버튼 등을 나중에 여기에 추가하면 좋습니다 */}
      </div>

      {/* 인스타그램 링크 등이 있다면 추가 */}
      {prompt.instagram_url && (
        <div className="mt-6">
          <a
            href={prompt.instagram_url}
            target="_blank"
            className="text-pink-600 hover:underline font-medium"
          >
            📸 Instagram에서 결과물 보기 →
          </a>
        </div>
      )}
    </main>
  );
}
