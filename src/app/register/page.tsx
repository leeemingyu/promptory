"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await authApi.register(formData);
    if (result.id) {
      alert("회원가입 성공! 로그인해주세요.");
      router.push("/login");
    } else {
      alert(result.error || "회원가입에 실패했습니다.");
    }
  };

  return (
    <main className="max-w-md mx-auto mt-20 p-6 border rounded-2xl shadow-sm">
      <h1 className="text-2xl font-bold mb-6">회원가입</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="사용자 이름"
          className="w-full p-3 border rounded-lg"
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
        />
        <input
          type="email"
          placeholder="이메일"
          className="w-full p-3 border rounded-lg"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="w-full p-3 border rounded-lg"
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <button className="w-full bg-black text-white p-3 rounded-lg font-semibold hover:bg-gray-800">
          가입하기
        </button>
      </form>
    </main>
  );
}
