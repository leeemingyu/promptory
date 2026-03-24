"use client";

import { useRouter } from "next/navigation";
import { promptApiClient } from "@/lib/api.client";
import type { PromptActionsProps } from "@/types";

const DELETE_CONFIRM_MESSAGE = "Delete this prompt?";
const DELETE_FAILED_MESSAGE = "Failed to delete prompt.";

export default function PromptActions({
  promptId,
  canEdit,
}: PromptActionsProps) {
  const router = useRouter();
  if (!canEdit) return null;

  const handleDelete = async () => {
    if (!confirm(DELETE_CONFIRM_MESSAGE)) return;

    try {
      await promptApiClient.delete(promptId);
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
        className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
      >
        Edit
      </button>
      <button
        onClick={handleDelete}
        className="rounded border px-3 py-1 text-sm text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
}
