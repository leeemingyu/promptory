"use client";

import { useRouter } from "next/navigation";
import { deletePrompt } from "@/lib/data/prompts.client";
import { DELETE_FAILED_MESSAGE } from "@/lib/data/messages";
import type { PromptActionsProps } from "@/types";

const DELETE_CONFIRM_MESSAGE = "이 프롬프트를 삭제할까요?";
export default function PromptActions({
  promptId,
  canEdit,
}: PromptActionsProps) {
  const router = useRouter();
  if (!canEdit) return null;

  const handleDelete = async () => {
    if (!confirm(DELETE_CONFIRM_MESSAGE)) return;

    try {
      await deletePrompt(promptId);
      router.push("/");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : DELETE_FAILED_MESSAGE;
      alert(message);
    }
  };

  const handleEdit = () => {
    router.push(`/prompts/${promptId}/edit`);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleEdit}
        className="cursor-pointer rounded border px-3 py-1 text-sm hover:bg-gray-100"
      >
        수정
      </button>
      <button
        onClick={handleDelete}
        className="cursor-pointer rounded border px-3 py-1 text-sm text-red-600 hover:bg-red-50"
      >
        삭제
      </button>
    </div>
  );
}
