export interface CreatePromptInput {
  title: string;
  prompt_text: string;
  description: string;
  ai_model: string;
  before_image_url: string;
  after_image_url: string;
}

export type UpdatePromptInput = Partial<CreatePromptInput>;
