"use client";

import { useRouter } from "next/navigation";
import { promptApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { PromptActionsProps } from "@/types";

const DELETE_CONFIRM_MESSAGE = "정말 삭제하시겠습니까?";
const DELETE_FAILED_MESSAGE = "삭제에 실패했습니다.";

export default function PromptActions({ promptId, owner }: PromptActionsProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const currentUsername =
    typeof user?.user_metadata?.username === "string"
      ? user.user_metadata.username
      : null;

  if (!currentUsername || currentUsername !== owner) return null;

  const handleDelete = async () => {
    if (!confirm(DELETE_CONFIRM_MESSAGE)) return;

    try {
      await promptApi.delete(promptId);
      router.push("/prompts");
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
        className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
      >
        수정
      </button>
      <button
        onClick={handleDelete}
        className="rounded border px-3 py-1 text-sm text-red-600 hover:bg-red-50"
      >
        삭제
      </button>
    </div>
  );
}
