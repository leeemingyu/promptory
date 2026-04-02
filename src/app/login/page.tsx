"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LoginFormData } from "@/types";
import { createClient } from "@/lib/supabase/client";
import {
  LOGIN_FAILED_MESSAGE,
  LOGIN_SUCCESS_MESSAGE,
  RATE_LIMIT_MESSAGE,
} from "@/lib/data/messages";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOauthLoading, setIsOauthLoading] = useState(false);
  const isEmailValid =
    formData.email.trim().length > 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isPasswordValid = formData.password.length >= 6;
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const showEmailError = hasSubmitted && !isEmailValid;
  const showPasswordError = hasSubmitted && !isPasswordValid;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const signInwithPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSubmitted(true);
    if (!isEmailValid || !isPasswordValid) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error || !data.user) {
        const message =
          error?.status === 429 ||
          error?.message?.toLowerCase().includes("too many")
            ? RATE_LIMIT_MESSAGE
            : (error?.message ?? LOGIN_FAILED_MESSAGE);
        throw new Error(message);
      }

      alert(LOGIN_SUCCESS_MESSAGE);
      router.push("/");
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : LOGIN_FAILED_MESSAGE;
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

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
        const message =
          error?.status === 429 ||
          error?.message?.toLowerCase().includes("too many")
            ? RATE_LIMIT_MESSAGE
            : (error?.message ?? LOGIN_FAILED_MESSAGE);
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
    <main className="mx-auto mt-20 max-w-md rounded-2xl border p-6 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">로그인</h1>
      <form onSubmit={signInwithPassword} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            이메일
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            placeholder="이메일"
            className={`w-full rounded-lg border p-3 outline-none focus:ring-2 ${
              showEmailError
                ? "border-rose-300 focus:ring-rose-200"
                : formData.email.length > 0
                  ? "border-emerald-300 focus:ring-emerald-200"
                  : "border-gray-300 focus:ring-black"
            }`}
            onChange={handleChange}
          />
          {showEmailError && (
            <p className="mt-2 text-xs text-rose-600">
              이메일 형식을 확인해주세요.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            placeholder="비밀번호 (6자 이상)"
            className={`w-full rounded-lg border p-3 outline-none focus:ring-2 ${
              showPasswordError
                ? "border-rose-300 focus:ring-rose-200"
                : formData.password.length > 0
                  ? "border-emerald-300 focus:ring-emerald-200"
                  : "border-gray-300 focus:ring-black"
            }`}
            onChange={handleChange}
          />
          {showPasswordError && (
            <p className="mt-2 text-xs text-rose-600">
              비밀번호는 6자 이상이어야 합니다.
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full rounded-lg p-3 font-semibold text-white transition ${
            isLoading
              ? "cursor-not-allowed bg-gray-400 opacity-70"
              : "cursor-pointer bg-black hover:bg-gray-800"
          }`}
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        또는
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <button
        type="button"
        onClick={handleKakaoLogin}
        disabled={isOauthLoading}
        className={`w-full rounded-lg p-3 text-sm font-semibold transition ${
          isOauthLoading
            ? "cursor-not-allowed bg-yellow-200 text-yellow-700"
            : "cursor-pointer bg-[#FEE500] text-[#3C1E1E] hover:brightness-95"
        }`}
      >
        {isOauthLoading ? "카카오 로그인 중..." : "카카오로 로그인"}
      </button>
    </main>
  );
}
