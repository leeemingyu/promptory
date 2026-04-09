export const PROMPT_MODEL_OPTIONS = [
  "GEMINI",
  "GPT",
  "Claude",
  "Midjourney",
  "Stable Diffusion",
  "DALL-E",
  "Etc",
] as const;

export type PromptModel = (typeof PROMPT_MODEL_OPTIONS)[number];

export const DEFAULT_PROMPT_MODEL: PromptModel = "GPT";
