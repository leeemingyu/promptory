import "server-only";

import { Suspense } from "react";
import PromptCardGridSkeleton from "@/features/prompts/components/prompt-card-grid-skeleton";
import { getViewerUserId } from "@/features/profiles/services/viewer.server";
import ProfileTabs from "@/features/profiles/components/profile-tabs";
import ProfilePromptsSection from "@/features/profiles/components/profile-prompts-section.server";
import {
  getLikedPromptsCount,
  getPromptsCountByUserPublic,
} from "@/features/prompts/services/prompts.server";

type ProfileBodySectionProps = {
  profileId: string;
  requestedTab: string | undefined;
};

export default async function ProfileBodySection({
  profileId,
  requestedTab,
}: ProfileBodySectionProps) {
  const viewerUserId = await getViewerUserId();
  const isMine = Boolean(viewerUserId && viewerUserId === profileId);
  const activeTab =
    isMine && requestedTab === "liked" ? ("liked" as const) : ("posts" as const);

  const [postsCount, likedCount] = await Promise.all([
    getPromptsCountByUserPublic(profileId),
    isMine && viewerUserId ? getLikedPromptsCount(viewerUserId) : 0,
  ]);

  const gridFallback = (
    <PromptCardGridSkeleton
      showAuthor={false}
      gridClassName="grid grid-cols-2 gap-6 sm:grid-cols-3"
    />
  );

  if (isMine) {
    return (
      <ProfileTabs
        profileId={profileId}
        activeTab={activeTab}
        postsCount={postsCount}
        likedCount={likedCount}
      >
        <Suspense fallback={gridFallback}>
          <ProfilePromptsSection
            profileId={profileId}
            viewerUserId={viewerUserId}
            isMine={isMine}
            activeTab={activeTab}
          />
        </Suspense>
      </ProfileTabs>
    );
  }

  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">작성한 프롬프트</h2>
        <span className="text-sm text-gray-500">{postsCount}개</span>
      </div>

      <Suspense fallback={gridFallback}>
        <ProfilePromptsSection
          profileId={profileId}
          viewerUserId={viewerUserId}
          isMine={false}
          activeTab="posts"
        />
      </Suspense>
    </>
  );
}
