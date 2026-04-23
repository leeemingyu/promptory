import "server-only";

import { PromptCard } from "@/features/prompts";
import { getRecommendedPromptsForPromptId } from "@/features/prompts/services/prompt-recommendations.server";

type RecommendedPromptsSectionProps = {
  promptId: string;
  count?: number;
};

export default async function RecommendedPromptsSection({
  promptId,
  count = 5,
}: RecommendedPromptsSectionProps) {
  const prompts = await getRecommendedPromptsForPromptId(promptId, count);
  if (prompts.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">추천 프롬프트</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {prompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            href={`/prompts/${prompt.id}`}
            showLike={false}
            showAuthor
          />
        ))}
      </div>
    </section>
  );
}

