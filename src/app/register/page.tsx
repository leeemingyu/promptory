"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/api";
import type { RegisterFormData } from "@/types";

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await signUp(
        formData.email,
        formData.password,
        formData.username,
      );

      if (data.user) {
        alert("회원가입이 완료되었습니다. 로그인해주세요.");
        router.push("/login");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "회원가입에 실패했습니다. 다시 시도해주세요.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto mt-20 max-w-md rounded-2xl border p-6 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">회원가입</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="사용자 이름"
          value={formData.username}
          className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-black"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="이메일"
          value={formData.email}
          className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-black"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={formData.password}
          className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-black"
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full rounded-lg bg-black p-3 font-semibold text-white transition hover:bg-gray-800 ${
            isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          {isLoading ? "가입 중..." : "가입하기"}
        </button>
      </form>
    </main>
  );
}
