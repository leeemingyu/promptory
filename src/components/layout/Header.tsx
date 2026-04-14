import Link from "next/link";
import ProfileDropdown from "@/components/layout/ProfileDropdown";
import MobileMenu from "@/components/layout/MobileMenu";
import { getCurrentUserProfile } from "@/features/profiles/services/profiles.server";

export default async function Header() {
  const profile = await getCurrentUserProfile();
  const nickname = profile?.nickname ?? profile?.email?.split("@")[0] ?? "";

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="relative mx-auto flex h-13 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-black">
            PROMPTORY
          </Link>

          <nav className="hidden items-center sm:flex">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800"
            >
              홈
            </Link>
            <Link
              href="/prompts"
              className="px-3 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800"
            >
              프롬프트
            </Link>
            <Link
              href="/rankings"
              className="px-3 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800"
            >
              랭킹
            </Link>
          </nav>
        </div>

        <div className="hidden items-center gap-4 sm:flex">
          {profile ? (
            <>
              <Link
                href="/prompts/create"
                className="flex items-center justify-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800"
              >
                작성
              </Link>

              <ProfileDropdown
                profileId={profile.id}
                nickname={nickname}
                profileImageUrl={profile.profile_image_url}
              />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-500 hover:text-gray-800"
              >
                로그인
              </Link>
            </>
          )}
        </div>
        <div className="sm:hidden">
          <MobileMenu
            isAuthed={Boolean(profile)}
            profileId={profile?.id ?? null}
          />
        </div>
      </div>
    </header>
  );
}
