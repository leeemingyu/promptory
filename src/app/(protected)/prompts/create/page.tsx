"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  createPrompt,
  requireCurrentUser,
} from "@/features/prompts/services/prompts.client";
import {
  CREATE_FAILED_MESSAGE,
  LOGIN_REQUIRED_MESSAGE,
} from "@/utils/messages";
import { uploadImage } from "@/features/prompts/services/upload-image";
import { cropImageToAspect } from "@/features/prompts/services/crop-image";
import type { CreatePromptInput } from "@/features/prompts/types";
import { DEFAULT_PROMPT_MODEL, PROMPT_MODEL_OPTIONS } from "@/features/prompts";

const TITLE_MAX = 40;
const DESCRIPTION_MAX = 500;

type PromptFormEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

export default function CreatePromptPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [isProcessingBefore, setIsProcessingBefore] = useState(false);
  const [isProcessingAfter, setIsProcessingAfter] = useState(false);
  const beforeTokenRef = useRef(0);
  const afterTokenRef = useRef(0);

  const [beforePreview, setBeforePreview] = useState<string>("");
  const [afterPreview, setAfterPreview] = useState<string>("");

  const [showBeforeError, setShowBeforeError] = useState(false);
  const [showAfterError, setShowAfterError] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePromptInput>({
    title: "",
    prompt_text: "",
    description: "",
    ai_model: DEFAULT_PROMPT_MODEL,
    before_image_url: "",
    after_image_url: "",
  });

  useEffect(() => {
    return () => {
      if (beforePreview) URL.revokeObjectURL(beforePreview);
      if (afterPreview) URL.revokeObjectURL(afterPreview);
    };
  }, [beforePreview, afterPreview]);

  const handleBeforeChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = (beforeTokenRef.current += 1);

    setShowBeforeError(false);
    setImageError(null);
    setIsProcessingBefore(true);

    try {
      const cropped = await cropImageToAspect(file, { aspect: 3 / 4 });
      if (beforeTokenRef.current !== token) return;

      setBeforeImage(cropped);
      setBeforePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(cropped);
      });
    } catch (error: unknown) {
      if (beforeTokenRef.current !== token) return;

      setBeforeImage(null);
      setBeforePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
      setImageError(
        error instanceof Error ? error.message : "이미지 처리에 실패했어요.",
      );
    } finally {
      if (beforeTokenRef.current === token) setIsProcessingBefore(false);
    }
  };

  const handleAfterChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = (afterTokenRef.current += 1);

    setShowAfterError(false);
    setImageError(null);
    setIsProcessingAfter(true);

    try {
      const cropped = await cropImageToAspect(file, { aspect: 3 / 4 });
      if (afterTokenRef.current !== token) return;

      setAfterImage(cropped);
      setAfterPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(cropped);
      });
    } catch (error: unknown) {
      if (afterTokenRef.current !== token) return;

      setAfterImage(null);
      setAfterPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
      setImageError(
        error instanceof Error ? error.message : "이미지 처리에 실패했어요.",
      );
    } finally {
      if (afterTokenRef.current === token) setIsProcessingAfter(false);
    }
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

    if (isProcessingBefore || isProcessingAfter) {
      setImageError(
        "이미지를 3:4 비율로 맞추는 중이에요. 잠시만 기다려주세요.",
      );
      return;
    }
    if (!beforeImage || !afterImage) {
      if (!beforeImage) setShowBeforeError(true);
      if (!afterImage) setShowAfterError(true);

      if (!beforeImage && !afterImage) {
        setImageError("원본 이미지와 결과 이미지를 모두 업로드해주세요.");
      } else if (!beforeImage) {
        setImageError("원본 이미지를 업로드해주세요.");
      } else {
        setImageError("결과 이미지를 업로드해주세요.");
      }

      const targetId = !beforeImage ? "before-image-input" : "after-image-input";
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = await requireCurrentUser();

      let beforeUrl = "";
      let afterUrl = "";

      beforeUrl = await uploadImage(beforeImage);
      afterUrl = await uploadImage(afterImage);

      await createPrompt(formData, {
        beforeImageUrl: beforeUrl,
        afterImageUrl: afterUrl,
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
            {PROMPT_MODEL_OPTIONS.map((model) => (
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

        {imageError ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
          >
            {imageError}
          </div>
        ) : null}

        <p className="text-sm text-gray-500">
          업로드한 이미지는 <span className="font-semibold">3:4 비율로 자동 크롭</span>
          되어 저장돼요. 아래 미리보기 그대로 저장됩니다.
        </p>

        <div
          className={[
            "rounded-xl border-2 border-dashed p-6 transition",
            showBeforeError && !beforePreview
              ? "border-rose-300 bg-rose-50/40"
              : "border-gray-200",
          ].join(" ")}
        >
          <label className="mb-2 block font-semibold text-gray-700">
            원본 이미지 (Before)
          </label>

          <input
            id="before-image-input"
            type="file"
            accept="image/*"
            onChange={handleBeforeChange}
            className="block w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
          />

          {isProcessingBefore ? (
            <p className="mt-3 text-sm text-gray-500">
              3:4 비율로 이미지 처리 중...
            </p>
          ) : null}

          {showBeforeError && !beforePreview && (
            <p className="mt-3 text-sm font-semibold text-rose-600">
              원본 이미지를 업로드해주세요.
            </p>
          )}

          {beforePreview && (
            <div className="relative mt-4 w-44 aspect-3/4 overflow-hidden rounded-lg bg-gray-100 sm:w-56">
              <Image
                src={beforePreview}
                alt="Before Preview"
                fill
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <div
          className={[
            "rounded-xl border-2 border-dashed p-6 transition",
            showAfterError && !afterPreview
              ? "border-rose-300 bg-rose-50/40"
              : "border-gray-200",
          ].join(" ")}
        >
          <label className="mb-2 block font-semibold text-gray-700">
            결과 이미지 (After)
          </label>

          <input
            id="after-image-input"
            type="file"
            accept="image/*"
            onChange={handleAfterChange}
            className="block w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
          />

          {isProcessingAfter ? (
            <p className="mt-3 text-sm text-gray-500">
              3:4 비율로 이미지 처리 중...
            </p>
          ) : null}

          {showAfterError && !afterPreview && (
            <p className="mt-3 text-sm font-semibold text-rose-600">
              결과 이미지를 업로드해주세요.
            </p>
          )}

          {afterPreview && (
            <div className="relative mt-4 w-44 aspect-3/4 overflow-hidden rounded-lg bg-gray-100 sm:w-56">
              <Image
                src={afterPreview}
                alt="After Preview"
                fill
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || isProcessingBefore || isProcessingAfter}
          className={`w-full cursor-pointer rounded-xl py-4 text-lg font-bold text-white transition ${
            isLoading || isProcessingBefore || isProcessingAfter
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
