"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/api";

export default function LoginPage() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password } = formData;

    try {
      const data = await signIn(email, password);

      if (data.session) {
        // Zustand에 유저 정보와 액세스 토큰 저장
        setAuth(data.user, data.session.access_token);

        alert("로그인 성공!");
        router.push("/");
        router.refresh(); // 세션 반영을 위해 페이지 새로고침 권장
      }
    } catch (error) {
      // Supabase 에러 메시지를 보여줍니다.
      alert("로그인 실패: " + error);
    }
  };

  return (
    <main className="max-w-md mx-auto mt-20 p-6 border rounded-2xl shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">로그인</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">이메일</label>
          <input
            type="email"
            value={formData.email} // 상태와 연결 (Controlled Input)
            placeholder="example@email.com"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">비밀번호</label>
          <input
            type="password"
            value={formData.password} // 상태와 연결
            placeholder="비밀번호를 입력하세요"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          로그인
        </button>
      </form>
    </main>
  );
}
