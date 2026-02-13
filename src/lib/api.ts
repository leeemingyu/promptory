import axios from "axios";
import { supabase } from "./supabase";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  AuthPayload,
  CreatePromptInput,
  Prompt,
  UpdatePromptInput,
} from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

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

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const isNotFoundError = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 404;

export const promptApi = {
  getAll: async (): Promise<Prompt[]> => {
    const res = await api.get("/prompts");
    return res.data;
  },

  getById: async (id: string): Promise<Prompt | null> => {
    try {
      const res = await api.get(`/prompts/${id}`);
      return res.data;
    } catch (error: unknown) {
      if (isNotFoundError(error)) return null;
      throw error;
    }
  },

  create: async (data: CreatePromptInput): Promise<Prompt> => {
    const res = await api.post("/prompts/create", data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/prompts/${id}`);
  },

  update: async (id: string, data: UpdatePromptInput): Promise<Prompt> => {
    const res = await api.put(`/prompts/${id}`, data);
    return res.data;
  },
};

export default api;
