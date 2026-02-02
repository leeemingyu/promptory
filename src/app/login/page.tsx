"use client";

import { useState } from "react"; // 1. useState 임포트 확인
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  // 2. 이 부분을 추가하세요! (formData와 setFormData 정의)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await authApi.login(formData);

      if (result.token) {
        login(result.token, result.user);
        router.push("/");
      } else {
        alert(result.error || "로그인 정보를 다시 확인해주세요.");
      }
    } catch (error) {
      alert("로그인 중 서버 오류가 발생했습니다.");
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
            placeholder="example@email.com"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            // 3. onChange에서 setFormData 사용
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
            placeholder="비밀번호를 입력하세요"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
        </div>
        <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          로그인
        </button>
      </form>
    </main>
  );
}
