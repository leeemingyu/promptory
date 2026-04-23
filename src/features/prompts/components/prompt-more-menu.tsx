"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { deletePrompt } from "@/features/prompts/services/prompts.client";
import { DELETE_FAILED_MESSAGE } from "@/utils/messages";

const DELETE_CONFIRM_MESSAGE = "이 프롬프트를 삭제할까요?";

type PromptMoreMenuProps = {
  promptId: string;
  canEdit: boolean;
};

type MenuItemProps = {
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

function MenuItem({ label, icon, disabled = false, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition",
        disabled
          ? "cursor-not-allowed text-gray-400"
          : "cursor-pointer text-gray-700 hover:bg-gray-100",
      ].join(" ")}
    >
      <span className="flex items-center gap-2 font-medium">
        {icon ? <span className="text-gray-400">{icon}</span> : null}
        <span>{label}</span>
      </span>
      {disabled && (
        <span className="text-[11px] font-semibold text-gray-400">준비 중</span>
      )}
    </button>
  );
}

export default function PromptMoreMenu({
  promptId,
  canEdit,
}: PromptMoreMenuProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (!rootRef.current) return;
      if (rootRef.current.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleEdit = () => {
    setOpen(false);
    router.push(`/prompts/${promptId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm(DELETE_CONFIRM_MESSAGE)) return;

    try {
      setOpen(false);
      await deletePrompt(promptId);
      router.push("/prompts");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : DELETE_FAILED_MESSAGE;
      alert(message);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="게시글 메뉴 열기"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer inline-flex h-9 w-9 items-center justify-center text-gray-600"
      >
        <Ellipsis className="h-5 w-5" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="게시글 메뉴"
          className="absolute right-0 top-full z-200 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-lg whitespace-nowrap"
        >
          {canEdit ? (
            <>
              <MenuItem
                label="수정"
                icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
                onClick={handleEdit}
              />
              <MenuItem
                label="삭제"
                icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                onClick={handleDelete}
              />
            </>
          ) : (
            <>
              <MenuItem label="팔로우" disabled />
              <MenuItem label="저장하기" disabled />
              <MenuItem label="차단하기" disabled />
              <MenuItem label="신고하기" disabled />
            </>
          )}
        </div>
      )}
    </div>
  );
}
