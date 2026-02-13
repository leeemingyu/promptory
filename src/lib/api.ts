import axios from "axios";
import { supabase } from "./supabase";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  AuthPayload,
  CreatePromptInput,
  Prompt,
  UpdatePromptInput,
} from "@/types";

// 1. Axios 인스턴스 생성
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// 2. 인증 관련 (Supabase Auth)
export const signUp = async (
  email: string,
  password: string,
  name: string,
): Promise<AuthPayload> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: name,
      },
    },
  });
  if (error) throw error;
  return data as AuthPayload;
};

export const signIn = async (
  email: string,
  password: string,
): Promise<AuthPayload> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data as AuthPayload;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// 3. Axios 인터셉터: 모든 요청에 토큰 자동 포함
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 4. 프롬프트 관련 API (Axios 사용)
export const promptApi = {
  // 전체 목록 조회
  getAll: async (): Promise<Prompt[]> => {
    const res = await api.get("/prompts");
    return res.data;
  },

  // 상세 조회
  getById: async (id: string): Promise<Prompt | null> => {
    try {
      const res = await api.get(`/prompts/${id}`);
      return res.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  },

  // 프롬프트 등록 (이제 token 인자가 필요 없음!)
  create: async (data: CreatePromptInput): Promise<Prompt> => {
    const res = await api.post("/prompts/create", data);
    return res.data;
  },

  // 삭제
  delete: async (id: string): Promise<void> => {
    await api.delete(`/prompts/${id}`);
  },

  // 수정
  update: async (id: string, data: UpdatePromptInput): Promise<Prompt> => {
    const res = await api.put(`/prompts/${id}`, data);
    return res.data;
  },
};

export default api;
