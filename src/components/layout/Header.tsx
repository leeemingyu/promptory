import Link from "next/link";
import LogoutButton from "@/components/layout/LogoutButton";
import MobileMenu from "@/components/layout/MobileMenu";
import { getCurrentUserProfile } from "@/lib/data/profiles.server";

export default async function Header() {
  const profile = await getCurrentUserProfile();
  const nickname = profile?.nickname ?? profile?.email?.split("@")[0] ?? "";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-black">
          PROMPTORY
        </Link>

        <Link
          href="/prompts"
          className="absolute left-1/2 hidden -translate-x-1/2 text-sm font-semibold text-gray-800 hover:text-black sm:inline-flex"
        >
          전체 프롬프트
        </Link>

        <div className="hidden items-center gap-4 sm:flex">
          {profile ? (
            <>
              <span className="text-sm font-medium">{nickname}</span>
              <Link
                href="/prompts/create"
                className="rounded bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-800"
              >
                작성
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-black"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
        <div className="sm:hidden">
          <MobileMenu isAuthed={Boolean(profile)} nickname={nickname} />
        </div>
      </div>
    </header>
  );
}
