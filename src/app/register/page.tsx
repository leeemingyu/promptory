"use client";

import { useState } from "react";
import { signUp } from "@/lib/api"; // supabase auth 로직이 포함된 api.ts
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. signUp 함수 호출 (email, password, username 전달)
      // 이전 단계에서 수정한 signUp 형식을 따릅니다.
      const data = await signUp(
        formData.email,
        formData.password,
        formData.username,
      );

      // 2. Supabase는 가입 성공 시 data.user 객체를 반환합니다.
      if (data.user) {
        alert("회원가입 성공! 로그인해주세요.");
        router.push("/login");
      }
    } catch (error: any) {
      // 3. 에러 처리 (이미 가입된 이메일 등)
      alert(error.message || "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto mt-20 p-6 border rounded-2xl shadow-sm">
      <h1 className="text-2xl font-bold mb-6">회원가입</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="사용자 이름"
          value={formData.username}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
        />
        <input
          type="email"
          placeholder="이메일"
          value={formData.email}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={formData.password}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <button
          disabled={isLoading}
          className={`w-full bg-black text-white p-3 rounded-lg font-semibold hover:bg-gray-800 transition ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "가입 중..." : "가입하기"}
        </button>
      </form>
    </main>
  );
}
