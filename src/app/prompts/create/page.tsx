"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { promptApi } from "@/lib/api";
import { uploadImage } from "@/lib/uploadImage";
import type { CreatePromptInput } from "@/types";

const MODEL_OPTIONS = [
  "GPT-4",
  "Midjourney",
  "Stable Diffusion",
  "DALL-E 3",
  "Claude 3",
  "Etc",
] as const;

type PromptFormEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

export default function CreatePromptPage() {
  const router = useRouter();
  const { isLoggedIn, _hasHydrated } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [formData, setFormData] = useState<CreatePromptInput>({
    title: "",
    prompt_text: "",
    description: "",
    ai_model: "GPT-4",
  });

  useEffect(() => {
    if (_hasHydrated && !isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      router.push("/login");
    }
  }, [_hasHydrated, isLoggedIn, router]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return URL.createObjectURL(file);
    });
  };

  const handleChange = (e: PromptFormEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);

    try {
      let finalImageUrl = "";
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const submitData: CreatePromptInput = {
        ...formData,
        sample_image_url: finalImageUrl,
      };

      await promptApi.create(submitData);

      alert("성공적으로 등록되었습니다.");
      router.push("/");
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "등록에 실패했습니다.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!_hasHydrated || !isLoggedIn) return null;

  return (
    <main className="mx-auto mt-10 mb-20 max-w-2xl px-4">
      <h1 className="mb-8 text-3xl font-bold text-black">프롬프트 공유하기</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block font-semibold text-gray-700">제목</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            type="text"
            placeholder="프롬프트 제목을 입력해주세요"
            className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold text-gray-700">AI 모델</label>
          <select
            name="ai_model"
            value={formData.ai_model}
            onChange={handleChange}
            className="w-full rounded-lg border bg-white p-3 outline-none focus:ring-2 focus:ring-black"
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
            프롬프트 내용
          </label>
          <textarea
            name="prompt_text"
            value={formData.prompt_text}
            onChange={handleChange}
            placeholder="AI에게 입력한 명령어를 붙여넣어주세요."
            className="h-40 w-full resize-none rounded-lg border bg-gray-50 p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold text-gray-700">
            설명 (선택)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="프롬프트 팁이나 사용법을 적어주세요."
            className="h-24 w-full resize-none rounded-lg border p-3 outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="rounded-xl border-2 border-dashed border-gray-200 p-6">
          <label className="mb-2 block font-semibold text-gray-700">
            결과물 이미지
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-800"
          />
          {previewUrl && (
            <div className="relative mt-4 h-40 w-40">
              <Image
                src={previewUrl}
                alt="미리보기"
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
          className={`w-full rounded-xl py-4 text-lg font-bold text-white transition ${
            isLoading
              ? "cursor-not-allowed bg-gray-400"
              : "bg-black shadow-lg hover:bg-gray-800"
          }`}
        >
          {isLoading ? "업로드 중..." : "프롬프트 등록하기"}
        </button>
      </form>
    </main>
  );
}
