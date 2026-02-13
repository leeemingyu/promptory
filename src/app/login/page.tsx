"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { LoginFormData } from "@/types";

export default function LoginPage() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const data = await signIn(formData.email, formData.password);

      if (data.session) {
        setAuth(data.user, data.session.access_token);
        alert("로그인되었습니다.");
        router.push("/");
        router.refresh();
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "로그인에 실패했습니다. 다시 시도해주세요.";
      alert(message);
    }
  };

  return (
    <main className="mx-auto mt-20 max-w-md rounded-2xl border p-6 shadow-sm">
      <h1 className="mb-6 text-center text-2xl font-bold">로그인</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">이메일</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            placeholder="example@email.com"
            className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">비밀번호</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="비밀번호를 입력하세요"
            className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700"
        >
          로그인
        </button>
      </form>
    </main>
  );
}
