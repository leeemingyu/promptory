"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, isLoggedIn, logout, _hasHydrated } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Zustand가 로컬스토리지 데이터를 읽기 전에는 기본 로고만 보여줌
  if (!_hasHydrated) {
    return (
      <header className="border-b bg-white h-16 flex items-center px-4">
        <Link href="/" className="font-bold text-xl">
          PROMPTORY
        </Link>
      </header>
    );
  }

  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-black">
          PROMPTORY
        </Link>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <span className="text-sm font-medium">{user?.username}님</span>
              <Link
                href="/create"
                className="text-sm bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800"
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
                className="text-sm border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50"
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
