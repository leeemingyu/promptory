import type { Session, User } from "@supabase/supabase-js";

export interface Prompt {
  id: string;
  title: string;
  prompt_text: string;
  ai_model: string;
  username: string;
  sample_image_url?: string | null;
  created_at: string;
  instagram_url?: string | null;
}

export interface CreatePromptInput {
  title: string;
  prompt_text: string;
  description: string;
  ai_model: string;
  sample_image_url?: string | null;
}

export type UpdatePromptInput = Partial<CreatePromptInput>;

export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface PromptActionsProps {
  promptId: string;
  owner: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  _hasHydrated: boolean;
  setAuth: (user: User | null, token: string | null) => void;
  clearAuth: () => void;
  setHasHydrated: (state: boolean) => void;
}

export interface AuthPayload {
  user: User | null;
  session: Session | null;
}
