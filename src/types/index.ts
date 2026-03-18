import type { Session } from "@supabase/supabase-js";

export interface Prompt {
  id: string;
  title: string;
  prompt_text: string;
  description?: string | null;
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
  canEdit: boolean;
}

export interface AuthPayload {
  user: User | null;
  session: Session | null;
}
