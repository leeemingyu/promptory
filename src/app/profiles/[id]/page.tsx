import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProfileByUserIdCached } from "@/features/profiles";
import ProfileEditButton from "@/features/profiles/components/profile-edit-button";
import { getCurrentUserProfile } from "@/features/profiles/services/profiles.server";
import ProfileAvatar from "@/components/profile-avatar";
import { Suspense } from "react";
import ProfilePromptsSection from "@/features/profiles/components/profile-prompts-section.server";
import ProfileTabs from "@/features/profiles/components/profile-tabs";
import {
  getCurrentUserId,
  getLikedPromptsCount,
  getPromptsCountByUserPublic,
} from "@/features/prompts/services/prompts.server";
import PromptCardGridSkeleton from "@/features/prompts/components/prompt-card-grid-skeleton";

type ProfilePageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "프로필",
  robots: { index: false, follow: false },
};

export default async function ProfilePage({
  params,
  searchParams,
}: ProfilePageProps) {
  const { id } = await params;
  const currentUserId = await getCurrentUserId();
  const isMine = Boolean(currentUserId && currentUserId === id);

  const profile = isMine
    ? await getCurrentUserProfile()
    : await getPublicProfileByUserIdCached(id);
  if (!profile) notFound();

  const resolvedSearchParams = (await searchParams) ?? {};
  const tabRaw = resolvedSearchParams.tab;
  const tabValue =
    typeof tabRaw === "string"
      ? tabRaw
      : Array.isArray(tabRaw)
        ? tabRaw[0]
        : undefined;
  const activeTab = isMine && tabValue === "liked" ? "liked" : "posts";

  const [postsCount, likedCount] = await Promise.all([
    getPromptsCountByUserPublic(id),
    isMine && currentUserId ? getLikedPromptsCount(currentUserId) : 0,
  ]);

  return (
    <main className="mx-auto max-w-3xl mt-3 sm:mt-7">
      <div className="flex justify-between gap-4 flex-col sm:flex-row">
        <div className="flex gap-4">
          <ProfileAvatar
            imageUrl={profile.profile_image_url ?? null}
            wrapperClassName="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gray-200 p-1"
            fallbackVariant="box"
            fallbackClassName="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gray-200"
            imgClassName="h-full w-full rounded-full object-cover"
            iconClassName="h-8 w-8 sm:h-12 sm:w-12 text-gray-400"
          />

          <div className="min-w-0 flex flex-col justify-center">
            <h1 className="truncate sm:text-2xl font-bold text-gray-900">
              {profile.nickname ?? "user"}
            </h1>
            {isMine ? (
              <p className="mt-1 truncate text-sm text-gray-500">
                {profile.email ?? "—"}
              </p>
            ) : null}
          </div>
        </div>

        {isMine ? (
          <ProfileEditButton
            profileId={id}
            initialNickname={profile.nickname ?? "user"}
            initialProfileImageUrl={profile.profile_image_url ?? "default"}
            lastNicknameUpdatedAt={profile.last_nickname_updated_at ?? null}
          />
        ) : null}
      </div>
      <section className="mt-10">
        {isMine ? (
          <ProfileTabs
            profileId={id}
            activeTab={activeTab}
            postsCount={postsCount}
            likedCount={likedCount}
          >
            <Suspense
              fallback={
                <PromptCardGridSkeleton
                  showAuthor={false}
                  gridClassName="grid grid-cols-2 gap-6 sm:grid-cols-3"
                />
              }
            >
              <ProfilePromptsSection
                profileId={id}
                viewerUserId={currentUserId}
                isMine={isMine}
                activeTab={activeTab}
              />
            </Suspense>
          </ProfileTabs>
        ) : (
          <>
            <div className="mb-5 flex items-end justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-900">
                작성한 프롬프트
              </h2>
              <span className="text-sm text-gray-500">{postsCount}개</span>
            </div>

            <Suspense
              fallback={
                <PromptCardGridSkeleton
                  showAuthor={false}
                  gridClassName="grid grid-cols-2 gap-6 sm:grid-cols-3"
                />
              }
            >
              <ProfilePromptsSection
                profileId={id}
                viewerUserId={currentUserId}
                isMine={isMine}
                activeTab={activeTab}
              />
            </Suspense>
          </>
        )}
      </section>
    </main>
  );
}
