import PromptActions from "@/app/prompts/[id]/PromptActions";
import { promptApiClient } from "@/lib/api.client";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { notFound } from "next/navigation";

interface PromptDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PromptDetailPage({
  params,
}: PromptDetailPageProps) {
  const { id } = await params;

  const prompt = await promptApiClient.getById(id);

  if (!prompt) {
    notFound();
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const currentUserId = data.user?.id ?? null;
  const canEdit = Boolean(currentUserId && currentUserId === prompt.user_id);
  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{prompt.title}</h1>
        <div className="flex items-center gap-2 text-gray-500 mt-2">
          <span>
            By <strong>{prompt.nickname}</strong>
          </span>
          <span>•</span>
          <span>{new Date(prompt.created_at).toLocaleDateString()}</span>
          <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {prompt.ai_model}
          </span>
        </div>

        {/* 🔽 수정/삭제 버튼 영역 */}
        <PromptActions promptId={prompt.id} canEdit={canEdit} />
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
      <div className="bg-gray-50 rounded-xl p-6 border relative mb-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
          Prompt
        </h3>
        <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
          {prompt.prompt_text}
        </p>

        {/* 복사 버튼 등을 나중에 여기에 추가하면 좋습니다 */}
      </div>

      {/* 설명 섹션 */}
      <div className="bg-gray-50 rounded-xl p-6 border relative">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
          Description
        </h3>
        <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
          {prompt.description}
        </p>

        {/* 복사 버튼 등을 나중에 여기에 추가하면 좋습니다 */}
      </div>
    </main>
  );
}
