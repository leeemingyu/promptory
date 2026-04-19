import type { Metadata } from "next";
import { Suspense } from "react";
import ProfileHeaderSection from "@/features/profiles/components/profile-header-section.server";
import ProfileHeaderSkeleton from "@/features/profiles/components/profile-header-skeleton";
import ProfileBodySection from "@/features/profiles/components/profile-body-section.server";
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

  const resolvedSearchParams = (await searchParams) ?? {};
  const tabRaw = resolvedSearchParams.tab;
  const tabValue =
    typeof tabRaw === "string"
      ? tabRaw
      : Array.isArray(tabRaw)
        ? tabRaw[0]
        : undefined;

  return (
    <main className="mx-auto max-w-3xl mt-3 sm:mt-7">
      <Suspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeaderSection profileId={id} />
      </Suspense>

      <section className="mt-10">
        <Suspense
          fallback={
            <PromptCardGridSkeleton
              showAuthor={false}
              gridClassName="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3"
            />
          }
        >
          <ProfileBodySection profileId={id} requestedTab={tabValue} />
        </Suspense>
      </section>
    </main>
  );
}
