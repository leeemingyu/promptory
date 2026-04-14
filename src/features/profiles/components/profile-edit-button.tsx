"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import {
  isNicknameTaken,
  updateMyNickname,
} from "@/features/profiles/services/profiles.client";
import { UPDATE_FAILED_MESSAGE } from "@/utils/messages";

type ProfileEditButtonProps = {
  profileId: string;
  initialNickname: string;
  lastNicknameUpdatedAt: string | null | undefined;
};

const NICKNAME_MAX_CHARS = 12;
const NICKNAME_COOLDOWN_MS = 3 * 60 * 1000;

function getCharCount(value: string) {
  return Array.from(value).length;
}

export default function ProfileEditButton({
  profileId,
  initialNickname,
  lastNicknameUpdatedAt,
}: ProfileEditButtonProps) {
  const router = useRouter();
  const dialogTitleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState(initialNickname);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkState, setCheckState] = useState<
    "idle" | "checking" | "available" | "taken" | "error"
  >("idle");

  const isTooLong = getCharCount(nickname) > NICKNAME_MAX_CHARS;
  const isTaken = checkState === "taken";
  const isInvalid = isTooLong || isTaken;
  const isUnchanged = nickname.trim() === initialNickname.trim();
  const cooldownMessage = (() => {
    if (!lastNicknameUpdatedAt) return null;
    const ms = new Date(lastNicknameUpdatedAt).getTime();
    if (!Number.isFinite(ms)) return null;

    const remainingMs = NICKNAME_COOLDOWN_MS - (Date.now() - ms);
    if (remainingMs <= 0) return null;

    const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60_000));
    return `닉네임은 ${remainingMinutes}분 뒤 다시 바꿀 수 있어요.`;
  })();

  useEffect(() => {
    if (!open) return;
    setNickname(initialNickname);
    setError(null);
    setCheckState("idle");
  }, [open, initialNickname]);

  useEffect(() => {
    if (!open) return;
    setError(null);
  }, [nickname, open]);

  useEffect(() => {
    if (!open) return;

    const next = nickname.trim();
    const initial = initialNickname.trim();

    if (!next) {
      setCheckState("idle");
      return;
    }

    if (getCharCount(next) > NICKNAME_MAX_CHARS) {
      setCheckState("idle");
      return;
    }

    if (next === initial) {
      // Don't show "available" on initial open (or when user returns to the original nickname).
      setCheckState("idle");
      return;
    }

    let cancelled = false;
    const t = window.setTimeout(async () => {
      try {
        setCheckState("checking");
        const taken = await isNicknameTaken(next, { excludeUserId: profileId });
        if (cancelled) return;
        setCheckState(taken ? "taken" : "available");
      } catch {
        if (cancelled) return;
        setCheckState("error");
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [nickname, open, initialNickname, profileId]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    // Prevent background scrolling while the modal is open.
    const y = window.scrollY;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const { body } = document;
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.paddingRight = prev.paddingRight;
      window.scrollTo(0, y);
    };
  }, [open]);

  const onBackdropMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!panelRef.current) return;
    if (panelRef.current.contains(event.target as Node)) return;
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (isSaving) return;
    setError(null);

    const next = nickname.trim();
    if (!next) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    if (getCharCount(next) > NICKNAME_MAX_CHARS) {
      setError("닉네임은 최대 12자까지만 가능해요.");
      return;
    }
    if (!isUnchanged && cooldownMessage) {
      setError(cooldownMessage);
      return;
    }
    if (checkState === "checking") {
      setError("닉네임 중복 확인 중이에요. 잠시만 기다려주세요.");
      return;
    }
    if (checkState === "taken") {
      setError("이미 사용 중인 닉네임이에요.");
      return;
    }
    if (next === initialNickname.trim()) {
      setOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      const y = window.scrollY;
      await updateMyNickname(next);
      setOpen(false);
      router.refresh();
      requestAnimationFrame(() => window.scrollTo({ top: y }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : UPDATE_FAILED_MESSAGE);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-fit cursor-pointer items-center justify-center gap-1 rounded-xl bg-gray-200 px-4 py-2 font-semibold text-gray-800 transition hover:bg-gray-300 sm:bg-blue-100 sm:text-blue-500 sm:hover:bg-blue-200"
      >
        <Pencil
          className="hidden h-5 w-5 sm:block text-blue-100 fill-blue-500"
          strokeWidth={1.5}
        />
        프로필 편집
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          className="fixed inset-0 z-300 flex items-center justify-center p-4"
          onMouseDown={onBackdropMouseDown}
        >
          <div
            ref={panelRef}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-200"
          >
            <div className="flex justify-between">
              <h2
                id={dialogTitleId}
                className="text-xl font-bold text-gray-800 pl-6 py-5"
              >
                프로필 편집
              </h2>
              <button
                type="button"
                aria-label="닫기"
                className="inline-flex h-9 w-9 mt-4 mr-4 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-5">
              <label className="block font-semibold text-gray-800">
                닉네임
              </label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={NICKNAME_MAX_CHARS}
                disabled={!!cooldownMessage}
                className={[
                  "mt-2 w-full rounded-xl border px-4 py-3 text-sm font-semibold transition outline-none ring-inset",
                  isInvalid
                    ? "border-rose-300 ring-1 ring-rose-200 focus:ring-2 focus:ring-rose-500"
                    : "border-gray-200 focus:ring-2 focus:ring-blue-500",
                  cooldownMessage
                    ? "bg-gray-100 cursor-not-allowed text-gray-400"
                    : "bg-white text-gray-800 ",
                ].join(" ")}
                placeholder="닉네임을 입력해주세요"
              />

              {!nickname.trim() ? (
                <p className="mt-1 text-sm text-gray-500">
                  닉네임을 입력해주세요.
                </p>
              ) : isTooLong ? (
                <p className="mt-1 text-sm text-red-500">
                  닉네임은 최대 12자까지만 가능해요.
                </p>
              ) : cooldownMessage ? (
                <p className="mt-1 text-sm text-gray-500">{cooldownMessage}</p>
              ) : error ? (
                <p className="mt-1 text-sm text-red-500">{error}</p>
              ) : checkState === "checking" ? (
                <p className="mt-1 text-sm text-gray-500">중복 확인 중...</p>
              ) : checkState === "taken" ? (
                <p className="mt-1 text-sm text-red-500">
                  이미 사용 중인 닉네임이에요.
                </p>
              ) : checkState === "available" ? (
                <p className="mt-1 text-sm text-blue-500">
                  사용 가능한 닉네임이에요.
                </p>
              ) : checkState === "error" ? (
                <p className="mt-1 text-sm text-gray-500">
                  중복 확인에 실패했어요. 저장으로 확인해볼 수 있어요.
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 transition bg-gray-100 hover:bg-gray-200"
                disabled={isSaving}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                // disabled={
                //   isSaving ||
                //   checkState === "checking" ||
                //   checkState === "taken" ||
                //   getCharCount(nickname) > NICKNAME_MAX_CHARS ||
                //   (!isUnchanged && Boolean(cooldownMessage)) ||
                //   isUnchanged
                // }
              >
                {isSaving ? "저장 중..." : "저장하기"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
