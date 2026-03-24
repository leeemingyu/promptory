"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { promptApiClient } from "@/lib/api.client";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/uploadImage";
import type { CreatePromptInput, Prompt } from "@/types";

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

const LOGIN_REQUIRED_MESSAGE = "You need to log in.";
const PERMISSION_DENIED_MESSAGE = "You can edit only your own prompt.";
const NOT_FOUND_MESSAGE = "Prompt not found.";
const UPDATE_SUCCESS_MESSAGE = "Prompt updated successfully.";
const UPDATE_FAILED_MESSAGE = "Failed to update prompt.";

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
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();

        if (!isMounted) return;
        if (!data.user) {
          alert(LOGIN_REQUIRED_MESSAGE);
          router.push("/login");
          return;
        }
        setCurrentUserId(data.user.id ?? null);
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
        const prompt = await promptApiClient.getById(promptId);

        if (!prompt) {
          alert(NOT_FOUND_MESSAGE);
          router.push("/");
          return;
        }

        const ownerId = getPromptOwnerId(prompt);
        if (!ownerId || ownerId !== currentUserId) {
          alert(PERMISSION_DENIED_MESSAGE);
          router.push("/");
          return;
        }

        if (!isMounted) return;

        setFormData({
          title: prompt.title,
          prompt_text: prompt.prompt_text,
          description: prompt.description ?? "",
          ai_model: prompt.ai_model,
          sample_image_url: prompt.sample_image_url ?? null,
        });
        setOriginalImageUrl(prompt.sample_image_url ?? "");
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
      let finalImageUrl = originalImageUrl;
      if (imageFile) finalImageUrl = await uploadImage(imageFile);

      await promptApiClient.update(promptId, {
        ...formData,
        sample_image_url: finalImageUrl || null,
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
      <h1 className="mb-8 text-3xl font-bold text-black">Edit Prompt</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block font-semibold text-gray-700">
            Title
          </label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            type="text"
            placeholder="Enter a title"
            className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold text-gray-700">
            AI Model
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
            Prompt
          </label>
          <textarea
            name="prompt_text"
            value={formData.prompt_text}
            onChange={handleChange}
            placeholder="Paste your prompt"
            className="h-40 w-full resize-none rounded-lg border bg-gray-50 p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold text-gray-700">
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe how this prompt works"
            className="h-24 w-full resize-none rounded-lg border p-3 outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="rounded-xl border-2 border-dashed border-gray-200 p-6">
          <label className="mb-2 block font-semibold text-gray-700">
            Result Image
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
          className={`w-full rounded-xl py-4 text-lg font-bold text-white transition ${
            isLoading
              ? "cursor-not-allowed bg-gray-400"
              : "bg-black shadow-lg hover:bg-gray-800"
          }`}
        >
          {isLoading ? "Updating.." : "Update Prompt"}
        </button>
      </form>
    </main>
  );
}

function getPromptOwnerId(prompt: Prompt): string | null {
  return typeof prompt.user_id === "string" ? prompt.user_id : null;
}
