"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { mapRegisterErrorMessage } from "@/lib/auth/error-mapping";
import { LOGIN_FAILED_MESSAGE } from "@/lib/data/messages";

export default function LoginPage() {
  const supabase = createClient();
  const [isOauthLoading, setIsOauthLoading] = useState(false);

  const handleKakaoLogin = async () => {
    setIsOauthLoading(true);
    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${origin}/auth/callback`,
          scopes: "account_email",
        },
      });

      if (error) {
        const message = mapRegisterErrorMessage(error, LOGIN_FAILED_MESSAGE);
        throw new Error(message);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : LOGIN_FAILED_MESSAGE;
      alert(message);
      setIsOauthLoading(false);
    }
  };

  return (
    <main className="mx-auto mt-20 max-w-md rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-bold">로그인</h1>
      <button
        type="button"
        onClick={handleKakaoLogin}
        disabled={isOauthLoading}
        className={`relative flex w-full items-center justify-center rounded-lg p-3 text-sm font-semibold transition ${
          isOauthLoading
            ? "cursor-not-allowed bg-yellow-200 text-yellow-700"
            : "cursor-pointer bg-[#FEE500] text-[#3C1E1E] hover:brightness-95"
        }`}
      >
        <span className="absolute left-4">
          <Image
            src="/icons/kakao.svg"
            alt=""
            width={20}
            height={20}
            aria-hidden="true"
          />
        </span>
        {isOauthLoading ? (
          "카카오 로그인 중..."
        ) : (
          <span className="w-full text-center">
            <span className="inline sm:hidden">로그인</span>
            <span className="hidden sm:inline">카카오 로그인</span>
          </span>
        )}
      </button>
    </main>
  );
}
