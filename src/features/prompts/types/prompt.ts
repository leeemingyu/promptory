export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  prompt_text: string;
  description?: string | null;
  ai_model: string;
  username: string;
  before_image_url?: string | null;
  sample_image_url?: string | null;
  likes_count?: number | null;
  created_at: string;
  instagram_url?: string | null;
  nickname: string;
  is_liked?: boolean;
}
