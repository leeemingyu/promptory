"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  getCurrentUserId,
  getPromptForEdit,
  requireCurrentUser,
  updatePrompt,
} from "@/lib/data/prompts.client";
import {
  LOGIN_REQUIRED_MESSAGE,
  UPDATE_SUCCESS_MESSAGE,
  UPDATE_FAILED_MESSAGE,
} from "@/lib/data/messages";
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

const PERMISSION_DENIED_MESSAGE = "본인 프롬프트만 수정할 수 있습니다.";
const NOT_FOUND_MESSAGE = "프롬프트를 찾을 수 없습니다.";
export default function EditPromptPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const promptId = params.id ?? "";

  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("");
  const [formData, setFormData] = useState<CreatePromptInput>({
    title: "",
    prompt_text: "",
    description: "",
    ai_model: "GPT-4",
    sample_image_url: null,
  });

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const userId = await getCurrentUserId();
        if (!isMounted) return;
        if (!userId) {
          alert(LOGIN_REQUIRED_MESSAGE);
          router.push("/login");
          return;
        }
        setCurrentUserId(userId);
      } catch {
        if (!isMounted) return;
        alert(LOGIN_REQUIRED_MESSAGE);
        router.push("/login");
      } finally {
        if (isMounted) setIsAuthReady(true);
      }
    };

    void checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!isAuthReady || !promptId || !currentUserId) return;

    let isMounted = true;

    const loadPrompt = async () => {
      setIsFetching(true);

      try {
        const promptRow = await getPromptForEdit(promptId);
        if (!promptRow) {
          alert(NOT_FOUND_MESSAGE);
          router.push("/");
          return;
        }

        const ownerId = promptRow.user_id;
        if (!ownerId || ownerId !== currentUserId) {
          alert(PERMISSION_DENIED_MESSAGE);
          router.push("/");
          return;
        }

        if (!isMounted) return;

        setFormData({
          title: promptRow.title,
          prompt_text: promptRow.prompt_text,
          description: promptRow.description ?? "",
          ai_model: promptRow.ai_model,
          sample_image_url: promptRow.sample_image_url ?? null,
        });
        setOriginalImageUrl(promptRow.sample_image_url ?? "");
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : UPDATE_FAILED_MESSAGE;
        alert(message);
        router.push("/");
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };

    void loadPrompt();

    return () => {
      isMounted = false;
    };
  }, [isAuthReady, promptId, currentUserId, router]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleChange = (e: PromptFormEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUserId || !promptId) {
      alert(LOGIN_REQUIRED_MESSAGE);
      return;
    }

    setIsLoading(true);

    try {
      const user = await requireCurrentUser();
      let finalImageUrl = originalImageUrl;
      if (imageFile) finalImageUrl = await uploadImage(imageFile);

      await updatePrompt(promptId, formData, {
        imageUrl: finalImageUrl || null,
        userId: user.id,
      });

      alert(UPDATE_SUCCESS_MESSAGE);
      router.push(`/prompts/${promptId}`);
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : UPDATE_FAILED_MESSAGE;
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthReady || !currentUserId || isFetching) return null;

  return (
    <main className="mx-auto mb-20 mt-10 max-w-2xl px-4">
      <h1 className="mb-8 text-3xl font-bold text-black">프롬프트 수정</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block font-semibold text-gray-700">
            제목
          </label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            type="text"
            placeholder="제목을 입력해주세요"
            className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-black"
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
            프롬프트
          </label>
          <textarea
            name="prompt_text"
            value={formData.prompt_text}
            onChange={handleChange}
            placeholder="프롬프트를 입력해주세요"
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
            placeholder="프롬프트 설명을 입력해주세요"
            className="h-24 w-full resize-none rounded-lg border p-3 outline-none focus:ring-2 focus:ring-black"
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
            className="block w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-800"
          />

          {(previewUrl || originalImageUrl) && (
            <div className="relative mt-4 h-40 w-40">
              <Image
                src={previewUrl || originalImageUrl}
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
          {isLoading ? "수정 중..." : "프롬프트 수정"}
        </button>
      </form>
    </main>
  );
}
