import { Prompt } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authApi = {
  // 회원가입
  register: async (data: any) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  // 로그인
  login: async (data: any) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

// 프롬프트 관련 API
export const promptApi = {
  // 전체 목록 조회
  getAll: async () => {
    const res = await fetch(`${API_URL}/prompts`, { cache: "no-store" });
    if (!res.ok) throw new Error("목록을 불러오지 못했습니다.");
    return res.json();
  },

  // 상세 조회 (새로 추가)
  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/prompts/${id}`, { cache: "no-store" });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("상세 정보를 불러오지 못했습니다.");
    }
    return res.json();
  },
};
