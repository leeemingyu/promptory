"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { RegisterFormData } from "@/types";
import { createClient } from "@/lib/supabase/client";
import {
  REGISTER_FAILED_MESSAGE,
  REGISTER_SUCCESS_MESSAGE,
  RATE_LIMIT_MESSAGE,
} from "@/lib/data/messages";

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(
    null,
  );
  const [emailMessage, setEmailMessage] = useState("");
  const [lastCheckedEmail, setLastCheckedEmail] = useState("");
  const router = useRouter();
  const supabase = createClient();
  const isEmailValid =
    formData.email.trim().length > 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isPasswordValid = formData.password.length >= 6;
  const showEmailError = formData.email.length > 0 && !isEmailValid;
  const showPasswordError = formData.password.length > 0 && !isPasswordValid;
  const canSubmit =
    isEmailValid && isEmailAvailable === true && isPasswordValid;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "email") {
      setIsEmailAvailable(null);
      setEmailMessage("");
    }
  };

  const checkEmail = async (email: string) => {
    const trimmed = email.trim();
    if (!trimmed || !isEmailValid) {
      setIsEmailAvailable(false);
      setEmailMessage("이메일을 확인해주세요.");
      return false;
    }

    if (trimmed === lastCheckedEmail && isEmailAvailable !== null) {
      return isEmailAvailable;
    }

    setIsCheckingEmail(true);
    setIsEmailAvailable(null);
    setEmailMessage("중복 확인 중...");

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", trimmed)
        .limit(1);

      if (error) {
        setIsEmailAvailable(false);
        setEmailMessage("이메일 확인 중 오류가 발생했습니다.");
        return false;
      }

      if (data && data.length > 0) {
        setIsEmailAvailable(false);
        setEmailMessage("이미 사용 중인 이메일입니다.");
        return false;
      }

      setIsEmailAvailable(true);
      setEmailMessage("사용 가능한 이메일입니다.");
      setLastCheckedEmail(trimmed);
      return true;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  useEffect(() => {
    const email = formData.email.trim();
    if (!email || !isEmailValid) return;

    const timeoutId = window.setTimeout(() => {
      void checkEmail(email);
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [formData.email, isEmailValid]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const emailOk = await checkEmail(formData.email);
      if (!emailOk) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: "http://localhost:3000/welcome",
        },
      });

      if (error || !data.user) {
        const message =
          error?.status === 429 ||
          error?.message?.toLowerCase().includes("too many")
            ? RATE_LIMIT_MESSAGE
            : (error?.message ?? REGISTER_FAILED_MESSAGE);
        throw new Error(message);
      }

      alert(REGISTER_SUCCESS_MESSAGE);
      router.push("/login");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : REGISTER_FAILED_MESSAGE;
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto mt-20 max-w-md rounded-2xl border p-6 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">회원가입</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={formData.email}
            className={`w-full rounded-lg border p-3 outline-none focus:ring-2 ${
              showEmailError || isEmailAvailable === false
                ? "border-rose-300 focus:ring-rose-200"
                : isEmailAvailable === true
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
          {emailMessage && !showEmailError && (
            <p
              className={`mt-2 text-xs ${
                isCheckingEmail
                  ? "text-gray-500"
                  : isEmailAvailable
                    ? "text-emerald-600"
                    : "text-rose-600"
              }`}
            >
              {emailMessage}
            </p>
          )}
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="비밀번호 (6자 이상)"
            value={formData.password}
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
          disabled={isLoading || isCheckingEmail || !canSubmit}
          className={`w-full rounded-lg p-3 font-semibold text-white transition ${
            isLoading || isCheckingEmail
              ? "cursor-not-allowed bg-gray-400 opacity-70"
              : canSubmit
                ? "cursor-pointer bg-black hover:bg-gray-800"
                : "cursor-not-allowed bg-gray-300"
          }`}
        >
          {isLoading ? "가입 중..." : "가입하기"}
        </button>
      </form>
    </main>
  );
}
