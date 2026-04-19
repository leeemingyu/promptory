"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  getCurrentUserId,
  getPromptForEdit,
  requireCurrentUser,
  updatePrompt,
} from "@/features/prompts/services/prompts.client";
import {
  LOGIN_REQUIRED_MESSAGE,
  UPDATE_FAILED_MESSAGE,
} from "@/utils/messages";
import { uploadImage } from "@/features/prompts/services/upload-image";
import { cropImageToAspect } from "@/features/prompts/services/crop-image";
import { getPromptImagePublicUrl } from "@/features/prompts/services/prompt-image-url";
import type { CreatePromptInput } from "@/features/prompts/types";
import { DEFAULT_PROMPT_MODEL, PROMPT_MODEL_OPTIONS } from "@/features/prompts";
import BackButton from "@/components/navigation/back-button";

const TITLE_MAX = 20;
const DESCRIPTION_MAX = 200;

type PromptFormEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

const PERMISSION_DENIED_MESSAGE =
  "\ub0b4\uac00 \uc791\uc131\ud55c \ud504\ub86c\ud504\ud2b8\ub9cc \uc218\uc815\ud560 \uc218 \uc788\uc5b4\uc694.";
const NOT_FOUND_MESSAGE =
  "\ud504\ub86c\ud504\ud2b8\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc5b4\uc694.";
export default function EditPromptPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const promptId = params.id ?? "";

  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [beforeImageFile, setBeforeImageFile] = useState<File | null>(null);
  const [afterImageFile, setAfterImageFile] = useState<File | null>(null);
  const [isProcessingBefore, setIsProcessingBefore] = useState(false);
  const [isProcessingAfter, setIsProcessingAfter] = useState(false);
  const beforeTokenRef = useRef(0);
  const afterTokenRef = useRef(0);
  const [beforePreviewUrl, setBeforePreviewUrl] = useState<string>("");
  const [afterPreviewUrl, setAfterPreviewUrl] = useState<string>("");
  const [originalBeforeUrl, setOriginalBeforeUrl] = useState<string>("");
  const [originalAfterUrl, setOriginalAfterUrl] = useState<string>("");
  const [showBeforeError, setShowBeforeError] = useState(false);
  const [showAfterError, setShowAfterError] = useState(false);
  const [formData, setFormData] = useState<CreatePromptInput>({
    title: "",
    prompt_text: "",
    description: "",
    ai_model: DEFAULT_PROMPT_MODEL,
    before_image_url: "",
    after_image_url: "",
  });

  const originalBeforeSrc = getPromptImagePublicUrl(originalBeforeUrl);
  const originalAfterSrc = getPromptImagePublicUrl(originalAfterUrl);

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
          before_image_url: "",
          after_image_url: "",
        });
        setOriginalBeforeUrl(promptRow.before_image_url ?? "");
        setOriginalAfterUrl(promptRow.sample_image_url ?? "");
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
      if (beforePreviewUrl) URL.revokeObjectURL(beforePreviewUrl);
      if (afterPreviewUrl) URL.revokeObjectURL(afterPreviewUrl);
    };
  }, [beforePreviewUrl, afterPreviewUrl]);

  const handleBeforeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = (beforeTokenRef.current += 1);

    setShowBeforeError(false);
    setIsProcessingBefore(true);

    try {
      const cropped = await cropImageToAspect(file, { aspect: 3 / 4 });
      if (beforeTokenRef.current !== token) return;

      setBeforeImageFile(cropped);
      setBeforePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(cropped);
      });
    } catch {
      if (beforeTokenRef.current !== token) return;
      setBeforeImageFile(null);
      setBeforePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
    } finally {
      if (beforeTokenRef.current === token) setIsProcessingBefore(false);
    }
  };

  const handleAfterChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = (afterTokenRef.current += 1);

    setShowAfterError(false);
    setIsProcessingAfter(true);

    try {
      const cropped = await cropImageToAspect(file, { aspect: 3 / 4 });
      if (afterTokenRef.current !== token) return;

      setAfterImageFile(cropped);
      setAfterPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(cropped);
      });
    } catch {
      if (afterTokenRef.current !== token) return;
      setAfterImageFile(null);
      setAfterPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
    } finally {
      if (afterTokenRef.current === token) setIsProcessingAfter(false);
    }
  };

  const handleChange = (e: PromptFormEvent) => {
    const { name, value } = e.target;
    if (name == "title") {
      setFormData((prev) => ({
        ...prev,
        title: value.slice(0, TITLE_MAX),
      }));
      return;
    }
    if (name == "description") {
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
      alert("이미지를 3:4 비율로 맞추는 중이에요. 잠시만 기다려주세요.");
      return;
    }
    if (!currentUserId || !promptId) {
      alert(LOGIN_REQUIRED_MESSAGE);
      return;
    }
    if (!beforeImageFile && !originalBeforeUrl) {
      setShowBeforeError(true);
    }
    if (!afterImageFile && !originalAfterUrl) {
      setShowAfterError(true);
    }
    if (
      (!beforeImageFile && !originalBeforeUrl) ||
      (!afterImageFile && !originalAfterUrl)
    ) {
      const targetId =
        !beforeImageFile && !originalBeforeUrl
          ? "before-image-input"
          : "after-image-input";
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = await requireCurrentUser();
      let finalBeforeUrl = originalBeforeUrl;
      let finalAfterUrl = originalAfterUrl;
      if (beforeImageFile) finalBeforeUrl = await uploadImage(beforeImageFile);
      if (afterImageFile) finalAfterUrl = await uploadImage(afterImageFile);

      await updatePrompt(promptId, formData, {
        beforeImageUrl: finalBeforeUrl || null,
        afterImageUrl: finalAfterUrl || null,
        userId: user.id,
      });

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
      <div className="mb-4">
        <BackButton confirmMessage="지금 돌아가면 저장되지 않아요. 그래도 나갈까요?" />
      </div>
      <h1 className="mb-8 text-3xl font-bold text-black">프롬프트 수정</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block font-semibold text-gray-700">제목</label>
          <p className="mb-2 text-right text-xs text-gray-500">
            {formData.title.length}/{TITLE_MAX}
          </p>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            type="text"
            maxLength={TITLE_MAX}
            placeholder="제목을 입력해주세요"
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
          <label className="mb-2 block font-semibold text-gray-700">
            설명 (선택)
          </label>
          <p className="mb-2 text-right text-xs text-gray-500">
            {formData.description.length}/{DESCRIPTION_MAX}
          </p>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={DESCRIPTION_MAX}
            placeholder="프롬프트 설명을 입력해주세요"
            className="h-40 w-full resize-none rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <p className="text-sm text-gray-500">
          업로드한 이미지는{" "}
          <span className="font-semibold">3:4 비율로 자동 크롭</span>
          되어 저장돼요. 아래 미리보기 그대로 저장됩니다.
        </p>

        <div className="rounded-xl border-2 border-dashed border-gray-200 p-6">
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
          {showBeforeError && !(beforePreviewUrl || originalBeforeUrl) ? (
            <p className="mt-3 text-sm font-semibold text-rose-600">
              원본 이미지를 업로드해주세요.
            </p>
          ) : null}

          {beforePreviewUrl || originalBeforeSrc ? (
            <div className="relative mt-4 w-44 aspect-3/4 overflow-hidden rounded-lg bg-gray-100 sm:w-56">
              <Image
                src={beforePreviewUrl || originalBeforeSrc || ""}
                alt="Before Preview"
                fill
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border-2 border-dashed border-gray-200 p-6">
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
          {showAfterError && !(afterPreviewUrl || originalAfterUrl) ? (
            <p className="mt-3 text-sm font-semibold text-rose-600">
              결과 이미지를 업로드해주세요.
            </p>
          ) : null}

          {afterPreviewUrl || originalAfterSrc ? (
            <div className="relative mt-4 w-44 aspect-3/4 overflow-hidden rounded-lg bg-gray-100 sm:w-56">
              <Image
                src={afterPreviewUrl || originalAfterSrc || ""}
                alt="After Preview"
                fill
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
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
          {isLoading ? "수정 중..." : "프롬프트 수정"}
        </button>
      </form>
    </main>
  );
}
