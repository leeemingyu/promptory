export interface CreatePromptInput {
  title: string;
  prompt_text: string;
  description: string;
  ai_model: string;
  sample_image_url?: string | null;
}

export type UpdatePromptInput = Partial<CreatePromptInput>;
