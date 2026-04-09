"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();

  // Supabase나 Next Auth에서 전달하는 에러 메시지/코드를 가져옵니다.
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-md text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            인증 에러 발생 ⚠️
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            로그인 진행 중 문제가 발생했습니다.
          </p>
        </div>

        {/* 개발 시 확인용 에러 메시지 박스 */}
        <div className="rounded-md bg-red-50 p-4 text-left">
          <p className="text-xs font-mono text-red-800 break-all">
            <strong>Error:</strong> {error || "unknown_error"}
          </p>
          {errorDescription && (
            <p className="mt-1 text-xs font-mono text-red-700 break-all">
              <strong>Description:</strong>{" "}
              {decodeURIComponent(errorDescription)}
            </p>
          )}
        </div>

        <div className="flex flex-col space-y-3">
          <Link
            href="/login"
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
          >
            로그인 페이지로 돌아가기
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-indigo-500"
          >
            메인 화면으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthCodeErrorPage() {
  return (
    // useSearchParams를 사용하므로 Suspense로 감싸줍니다.
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          로딩 중...
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
