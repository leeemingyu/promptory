"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { mapRegisterErrorMessage } from "@/features/auth";
import { LOGIN_FAILED_MESSAGE } from "@/utils/messages";

export default function LoginPage() {
  const supabase = createClient();
  const [isKakaoOauthLoading, setIsKakaoOauthLoading] = useState(false);
  const [isGoogleOauthLoading, setIsGoogleOauthLoading] = useState(false);

  const handleKakaoLogin = async () => {
    setIsKakaoOauthLoading(true);
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
      setIsKakaoOauthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleOauthLoading(true);
    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
          scopes: "https://www.googleapis.com/auth/userinfo.email",
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
      setIsGoogleOauthLoading(false);
    }
  };

  return (
    <main className="mx-auto mt-20 max-w-md rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-bold">로그인</h1>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleKakaoLogin}
          disabled={isKakaoOauthLoading}
          className={`relative flex w-full items-center justify-center rounded-lg py-2.5 px-3 text-sm font-semibold transition ${
            isKakaoOauthLoading
              ? "cursor-not-allowed bg-yellow-200 text-yellow-700"
              : "cursor-pointer bg-[#FEE500] text-[#3C1E1E] hover:brightness-95"
          }`}
        >
          <span className="absolute left-3">
            <Image
              src="/icons/kakao.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
            />
          </span>
          {isKakaoOauthLoading ? (
            "카카오 로그인 중..."
          ) : (
            <span className="w-full text-center">
              <span className="inline sm:hidden">로그인</span>
              <span className="hidden sm:inline">카카오 로그인</span>
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleOauthLoading}
          className={`relative flex w-full items-center justify-center rounded-lg py-2.5 px-3 text-sm font-semibold transition ${
            isGoogleOauthLoading
              ? "cursor-not-allowed bg-gray-50 text-gray-400"
              : "cursor-pointer bg-[#F2F2F2] text-[#3C1E1E] hover:brightness-95"
          }`}
        >
          <span className="absolute left-3">
            <Image
              src="/icons/google.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
            />
          </span>
          {isGoogleOauthLoading ? (
            "Google 계정으로 로그인 중..."
          ) : (
            <span className="w-full text-center">
              <span className="inline sm:hidden">로그인</span>
              <span className="hidden sm:inline">Google 계정으로 로그인</span>
            </span>
          )}
        </button>
      </div>
    </main>
  );
}
