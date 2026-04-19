"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import PromptCardGridSkeleton from "@/features/prompts/components/prompt-card-grid-skeleton";

type ProfileTabsProps = {
  profileId: string;
  activeTab: "posts" | "liked";
  postsCount: number;
  likedCount: number;
  children: React.ReactNode;
};

export default function ProfileTabs({
  profileId,
  activeTab,
  postsCount,
  likedCount,
  children,
}: ProfileTabsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingTab, setPendingTab] = useState<"posts" | "liked" | null>(null);

  const effectiveTab =
    pendingTab !== null && pendingTab !== activeTab ? pendingTab : activeTab;

  const go = (nextTab: "posts" | "liked") => {
    if (nextTab === effectiveTab) return;

    const href = `/profiles/${profileId}?tab=${nextTab}`;
    setPendingTab(nextTab);
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  };

  const showSkeleton =
    isPending || (pendingTab !== null && pendingTab !== activeTab);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2 bg-white p-1 text-sm">
          <button
            type="button"
            onClick={() => go("posts")}
            aria-current={effectiveTab === "posts" ? "page" : undefined}
            className={[
              "rounded-full px-4 py-2 font-semibold transition",
              effectiveTab === "posts"
                ? "bg-gray-100 text-gray-700"
                : "text-gray-700 hover:bg-gray-100",
            ].join(" ")}
          >
            작성한 글
            <span className="ml-1 text-xs font-bold opacity-80">
              {postsCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => go("liked")}
            aria-current={effectiveTab === "liked" ? "page" : undefined}
            className={[
              "rounded-full px-4 py-2 font-semibold transition",
              effectiveTab === "liked"
                ? "bg-gray-100 text-gray-700"
                : "text-gray-700 hover:bg-gray-100",
            ].join(" ")}
          >
            좋아요
            <span className="ml-1 text-xs font-bold opacity-80">
              {likedCount}
            </span>
          </button>
        </div>
      </div>

      {showSkeleton ? (
        <PromptCardGridSkeleton
          showAuthor={false}
          gridClassName="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3"
        />
      ) : (
        children
      )}
    </>
  );
}
