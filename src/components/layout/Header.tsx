"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

export default function Header() {
  const { user, token, clearAuth, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const isLoggedIn = !!token;
  const username =
    typeof user?.user_metadata?.username === "string"
      ? user.user_metadata.username
      : user?.email ?? "";

  const handleLogout = async () => {
    try {
      await signOut();
      clearAuth();
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!_hasHydrated) {
    return (
      <header className="flex h-16 items-center border-b bg-white px-4">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            PROMPTORY
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-black">
          PROMPTORY
        </Link>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <span className="text-sm font-medium">{username.split("@")[0]}님</span>
              <Link
                href="/prompts/create"
                className="rounded bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-800"
              >
                등록
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                로그아웃
              </button>
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
      </div>
    </header>
  );
}
