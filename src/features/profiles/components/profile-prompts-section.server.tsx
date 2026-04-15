import "server-only";

import { PromptCard } from "@/features/prompts";
import {
  getLikedPromptIds,
  getPromptsByIdsPublic,
  getPromptsByUserPublic,
} from "@/features/prompts/services/prompts.server";

type ProfilePromptsSectionProps = {
  profileId: string;
  viewerUserId: string | null;
  isMine: boolean;
  activeTab: "posts" | "liked";
};

export default async function ProfilePromptsSection({
  profileId,
  viewerUserId,
  isMine,
  activeTab,
}: ProfilePromptsSectionProps) {
  if (activeTab === "liked" && isMine && viewerUserId) {
    const likedPromptIds = await getLikedPromptIds(viewerUserId);
    const likedPrompts = await getPromptsByIdsPublic(likedPromptIds);

    if (likedPrompts.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          좋아요한 프롬프트가 없습니다.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {likedPrompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            href={`/prompts/${prompt.id}`}
            showLike
            liked
            showAuthor={false}
          />
        ))}
      </div>
    );
  }

  const [prompts, likedPromptIds] = await Promise.all([
    getPromptsByUserPublic(profileId),
    viewerUserId ? getLikedPromptIds(viewerUserId) : Promise.resolve([] as string[]),
  ]);
  const likedSet = new Set(likedPromptIds);

  if (prompts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
        아직 작성한 프롬프트가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          href={`/prompts/${prompt.id}`}
          showLike
          liked={likedSet.has(prompt.id)}
          showAuthor={false}
        />
      ))}
    </div>
  );
}
