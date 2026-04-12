import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleUser } from "lucide-react";
import { getPublicProfileByUserIdCached } from "@/features/profiles";
import { PromptCard } from "@/features/prompts";
import Link from "next/link";
import {
  getCurrentUserId,
  getLikedPromptIds,
  getPromptsByIdsPublic,
  getPromptsByUserPublic,
} from "@/features/prompts/services/prompts.server";

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
  const profile = await getPublicProfileByUserIdCached(id);
  if (!profile) notFound();

  const currentUserId = await getCurrentUserId();
  const isMine = Boolean(currentUserId && currentUserId === id);

  const resolvedSearchParams = (await searchParams) ?? {};
  const tabRaw = resolvedSearchParams.tab;
  const tabValue =
    typeof tabRaw === "string"
      ? tabRaw
      : Array.isArray(tabRaw)
        ? tabRaw[0]
        : undefined;
  const activeTab = isMine && tabValue === "liked" ? "liked" : "posts";

  const prompts = await getPromptsByUserPublic(id);
  const likedPromptIds = currentUserId
    ? await getLikedPromptIds(currentUserId)
    : [];
  const likedSet = new Set(likedPromptIds);
  const likedPrompts =
    isMine && activeTab === "liked"
      ? await getPromptsByIdsPublic(likedPromptIds)
      : [];

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-4">
          {profile.profile_image_url ? (
            // Use <img> to avoid Next Image host restrictions.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.profile_image_url}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <CircleUser
                className="h-10 w-10 text-gray-400"
                aria-hidden="true"
              />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-gray-900">
              {profile.nickname ?? "user"}
            </h1>
            {isMine ? (
              <p className="mt-1 truncate text-sm text-gray-500">
                {profile.email ?? "—"}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <section className="mt-10">
        {isMine ? (
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1 text-sm">
              <Link
                href={`/profiles/${id}?tab=posts`}
                scroll={false}
                className={[
                  "rounded-full px-4 py-2 font-semibold transition",
                  activeTab === "posts"
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100",
                ].join(" ")}
              >
                작성한 글
                <span className="ml-2 text-xs font-bold opacity-80">
                  {prompts.length}
                </span>
              </Link>
              <Link
                href={`/profiles/${id}?tab=liked`}
                scroll={false}
                className={[
                  "rounded-full px-4 py-2 font-semibold transition",
                  activeTab === "liked"
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100",
                ].join(" ")}
              >
                좋아요
                <span className="ml-2 text-xs font-bold opacity-80">
                  {likedPromptIds.length}
                </span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mb-5 flex items-end justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900">작성한 프롬프트</h2>
            <span className="text-sm text-gray-500">{prompts.length}개</span>
          </div>
        )}

        {activeTab === "liked" ? (
          likedPrompts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              좋아요한 프롬프트가 없습니다.
            </div>
          ) : (
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
          )
        ) : prompts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
            아직 작성한 프롬프트가 없습니다.
          </div>
        ) : (
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
        )}
      </section>
    </main>
  );
}
