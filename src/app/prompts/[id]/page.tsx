import PromptActions from "@/app/prompts/[id]/PromptActions";
import LikeButton from "@/app/prompts/[id]/LikeButton";
import CopyButton from "@/app/prompts/[id]/CopyButton";
import {
  getCurrentUserId,
  getPromptById,
  isPromptLiked,
} from "@/lib/data/prompts.server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PromptDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PromptDetailPage({
  params,
}: PromptDetailPageProps) {
  const { id } = await params;

  const promptRow = await getPromptById(id);
  if (!promptRow) {
    notFound();
  }

  const prompt = promptRow;

  const currentUserId = await getCurrentUserId();
  const canEdit = Boolean(currentUserId && currentUserId === prompt.user_id);
  let initialLiked = false;
  if (currentUserId) {
    initialLiked = await isPromptLiked(id, currentUserId);
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="mb-3">
          <Link
            href="/prompts"
            className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            목록으로
          </Link>
        </div>
        <h1 className="text-3xl font-bold">{prompt.title}</h1>
        <div className="flex items-center gap-2 text-gray-500 mt-2">
          <span>
            작성자 <strong>{prompt.nickname}</strong>
          </span>
          <span>|</span>
          <span>{new Date(prompt.created_at).toLocaleDateString()}</span>
          <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {prompt.ai_model}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <LikeButton promptId={prompt.id} initialLiked={initialLiked} />
          <PromptActions promptId={prompt.id} canEdit={canEdit} />
        </div>
      </div>

      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 mb-8 border">
        {prompt.sample_image_url ? (
          <Image
            src={prompt.sample_image_url}
            alt={prompt.title}
            fill
            className="object-contain"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            이미지 없음
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-6 border relative mb-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
          프롬프트
        </h3>
        <div className="absolute right-4 top-4">
          <CopyButton text={prompt.prompt_text} />
        </div>
        <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
          {prompt.prompt_text}
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 border relative">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
          설명
        </h3>
        <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
          {prompt.description}
        </p>
      </div>
    </main>
  );
}
