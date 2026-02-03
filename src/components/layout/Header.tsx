"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/api";

export default function Header() {
  // Zustand 스토어의 상태 명칭이 setAuth, clearAuth 등으로 바뀌었는지 확인하세요!
  const { user, token, clearAuth, _hasHydrated } = useAuthStore();
  const router = useRouter();

  // 로그인 여부 판단 (토큰 존재 여부)
  const isLoggedIn = !!token;

  const handleLogout = async () => {
    try {
      await signOut(); // 1. Supabase 세션 종료
      clearAuth(); // 2. Zustand 상태 초기화
      router.push("/");
      router.refresh(); // 페이지 상태 갱신
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
    }
  };

  // 하이드레이션 전(로컬스토리지 읽기 전) 깜빡임 방지
  if (!_hasHydrated) {
    return (
      <header className="border-b bg-white h-16 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <Link href="/" className="font-bold text-xl">
            PROMPTORY
          </Link>
        </div>
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
              {/* Supabase 유저 객체는 보통 email을 ID로 씁니다. */}
              <span className="text-sm font-medium">
                {user?.email?.split("@")[0]}님
              </span>
              <Link
                href="/prompts/create"
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
