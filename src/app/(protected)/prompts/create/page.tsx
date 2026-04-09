"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPrompt, requireCurrentUser } from "@/lib/data/prompts.client";
import {
  CREATE_FAILED_MESSAGE,
  LOGIN_REQUIRED_MESSAGE,
  IMAGE_REQUIRED_MESSAGE,
} from "@/lib/data/messages";
import { uploadImage } from "@/lib/uploadImage";
import type { CreatePromptInput } from "@/types";

const MODEL_OPTIONS = [
  "Gemini",
  "GPT",
  "Midjourney",
  "Stable Diffusion",
  "DALL-E",
  "Claude",
  "Etc",
] as const;

const TITLE_MAX = 20;
const DESCRIPTION_MAX = 200;

type PromptFormEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

export default function CreatePromptPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showImageError, setShowImageError] = useState(false);
  const [formData, setFormData] = useState<CreatePromptInput>({
    title: "",
    prompt_text: "",
    description: "",
    ai_model: "GPT-4",
  });

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setShowImageError(false);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleChange = (e: PromptFormEvent) => {
    const { name, value } = e.target;
    if (name === "title") {
      setFormData((prev) => ({
        ...prev,
        title: value.slice(0, TITLE_MAX),
      }));
      return;
    }
    if (name === "description") {
      setFormData((prev) => ({
        ...prev,
        description: value.slice(0, DESCRIPTION_MAX),
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!imageFile) {
      setShowImageError(true);
      return;
    }

    setIsLoading(true);

    try {
      const user = await requireCurrentUser();

      let finalImageUrl = "";
      if (imageFile) finalImageUrl = await uploadImage(imageFile);

      await createPrompt(formData, {
        imageUrl: finalImageUrl || null,
        user,
      });

      router.push("/prompts");
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error && error.message === LOGIN_REQUIRED_MESSAGE) {
        alert(LOGIN_REQUIRED_MESSAGE);
        router.push("/login");
        return;
      }
      const message =
        error instanceof Error ? error.message : CREATE_FAILED_MESSAGE;
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto mb-20 mt-10 max-w-2xl px-4">
      <h1 className="mb-8 text-3xl font-bold text-black">프롬프트 작성</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block font-semibold text-gray-700">제목</label>
            <span className="text-xs text-gray-500">
              {formData.title.length}/{TITLE_MAX}
            </span>
          </div>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            type="text"
            placeholder="제목을 입력해주세요"
            maxLength={TITLE_MAX}
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-gray-500"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold text-gray-700">
            AI 모델
          </label>
          <select
            name="ai_model"
            value={formData.ai_model}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:ring-2 focus:ring-gray-500"
          >
            {MODEL_OPTIONS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold text-gray-700">
            프롬프트
          </label>
          <textarea
            name="prompt_text"
            value={formData.prompt_text}
            onChange={handleChange}
            placeholder="프롬프트를 입력해주세요"
            className="h-30 w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-gray-500"
            required
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block font-semibold text-gray-700">
              설명 (선택)
            </label>
            <span className="text-xs text-gray-500">
              {formData.description.length}/{DESCRIPTION_MAX}
            </span>
          </div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="프롬프트 설명을 입력해주세요"
            maxLength={DESCRIPTION_MAX}
            className="h-40 w-full resize-none rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div className="rounded-xl border-2 border-dashed border-gray-200 p-6">
          <label className="mb-2 block font-semibold text-gray-700">
            결과 이미지
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
            className="block w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-800"
          />
          {showImageError && !previewUrl && (
            <p className="mt-2 text-xs text-rose-600">
              {IMAGE_REQUIRED_MESSAGE}
            </p>
          )}
          {previewUrl && (
            <div className="relative mt-4 h-40 w-40">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                unoptimized
                className="rounded-lg border object-cover"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full cursor-pointer rounded-xl py-4 text-lg font-bold text-white transition ${
            isLoading
              ? "cursor-not-allowed bg-gray-400"
              : "bg-black shadow-lg hover:bg-gray-800"
          }`}
        >
          {isLoading ? "생성 중..." : "프롬프트 작성"}
        </button>
      </form>
    </main>
  );
}
