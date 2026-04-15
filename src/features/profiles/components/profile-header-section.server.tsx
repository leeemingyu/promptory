import "server-only";

import { notFound } from "next/navigation";
import ProfileAvatar from "@/components/profile-avatar";
import ProfileEditButton from "@/features/profiles/components/profile-edit-button";
import { getPublicProfileByUserIdCached } from "@/features/profiles";
import { getCurrentUserProfile } from "@/features/profiles/services/profiles.server";
import { getViewerUserId } from "@/features/profiles/services/viewer.server";

type ProfileHeaderSectionProps = {
  profileId: string;
};

export default async function ProfileHeaderSection({
  profileId,
}: ProfileHeaderSectionProps) {
  const viewerUserId = await getViewerUserId();
  const isMine = Boolean(viewerUserId && viewerUserId === profileId);

  let profile = isMine
    ? await getCurrentUserProfile()
    : await getPublicProfileByUserIdCached(profileId);

  if (!profile && isMine) {
    profile = await getPublicProfileByUserIdCached(profileId);
  }

  if (!profile) notFound();

  return (
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
          profileId={profileId}
          initialNickname={profile.nickname ?? "user"}
          initialProfileImageUrl={profile.profile_image_url ?? "default"}
          lastNicknameUpdatedAt={profile.last_nickname_updated_at ?? null}
        />
      ) : null}
    </div>
  );
}

