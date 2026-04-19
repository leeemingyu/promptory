export const PROMPT_MODEL_OPTIONS = [
  "GPT",
  "GEMINI",
  "GROK",
  "Seedream",
  "Hunyuan",
  "Wan",
  "Flux",
  "Qwen",
  "Reve",
  "Kling",
  "Etc",
] as const;

export type PromptModel = (typeof PROMPT_MODEL_OPTIONS)[number];

export const DEFAULT_PROMPT_MODEL: PromptModel = "GPT";
