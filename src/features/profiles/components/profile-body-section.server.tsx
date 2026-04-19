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
    isMine && requestedTab === "liked"
      ? ("liked" as const)
      : ("posts" as const);

  const [postsCount, likedCount] = await Promise.all([
    getPromptsCountByUserPublic(profileId),
    isMine && viewerUserId ? getLikedPromptsCount(viewerUserId) : 0,
  ]);

  const gridFallback = (
    <PromptCardGridSkeleton
      showAuthor={false}
      gridClassName="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3"
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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2 bg-white p-1 text-sm">
          <div className="rounded-full px-4 py-2 font-semibold transition bg-white text-gray-700">
            작성한 글
            <span className="ml-1 text-xs font-bold opacity-80">
              {postsCount}
            </span>
          </div>
        </div>
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
