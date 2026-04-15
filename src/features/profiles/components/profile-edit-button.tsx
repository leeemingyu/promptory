"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import {
  isNicknameTaken,
  updateMyProfile,
} from "@/features/profiles/services/profiles.client";
import { UPDATE_FAILED_MESSAGE } from "@/utils/messages";
import ProfileAvatar from "@/components/profile-avatar";

type ProfileEditButtonProps = {
  profileId: string;
  initialNickname: string;
  initialProfileImageUrl: string;
  lastNicknameUpdatedAt: string | null | undefined;
};

const NICKNAME_MAX_CHARS = 12;
const NICKNAME_COOLDOWN_MS = 60 * 24 * 60 * 60 * 1000; // 60 days
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function getCharCount(value: string) {
  return Array.from(value).length;
}

function getCooldownLabel(remainingMs: number) {
  if (remainingMs > DAY_MS) {
    const days = Math.max(1, Math.ceil(remainingMs / DAY_MS));
    return { label: `${days}일`, shouldTick: false };
  }

  if (remainingMs > HOUR_MS) {
    const hours = Math.max(1, Math.ceil(remainingMs / HOUR_MS));
    return { label: `${hours}시간`, shouldTick: true };
  }

  const minutes = Math.max(1, Math.ceil(remainingMs / MINUTE_MS));
  return { label: `${minutes}분`, shouldTick: true };
}

export default function ProfileEditButton({
  profileId,
  initialNickname,
  initialProfileImageUrl,
  lastNicknameUpdatedAt,
}: ProfileEditButtonProps) {
  const router = useRouter();
  const dialogTitleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState(initialNickname);
  const [profileImageUrl, setProfileImageUrl] = useState(
    initialProfileImageUrl,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkState, setCheckState] = useState<
    "idle" | "checking" | "available" | "taken" | "error"
  >("idle");
  const [cooldownMessage, setCooldownMessage] = useState<string | null>(null);

  const isTooLong = getCharCount(nickname) > NICKNAME_MAX_CHARS;
  const isTaken = checkState === "taken";
  const isInvalid = isTooLong || isTaken;
  const nicknameChanged = nickname.trim() !== initialNickname.trim();
  const imageChanged = profileImageUrl !== initialProfileImageUrl;
  const isUnchanged = !nicknameChanged && !imageChanged;

  useEffect(() => {
    if (!open) return;
    setNickname(initialNickname);
    setProfileImageUrl(initialProfileImageUrl);
    setError(null);
    setCheckState("idle");
  }, [open, initialNickname, initialProfileImageUrl]);

  useEffect(() => {
    if (!open) return;

    const lastMs = lastNicknameUpdatedAt
      ? new Date(lastNicknameUpdatedAt).getTime()
      : Number.NaN;

    if (!Number.isFinite(lastMs)) {
      setCooldownMessage(null);
      return;
    }

    const compute = () => {
      const remainingMs = NICKNAME_COOLDOWN_MS - (Date.now() - lastMs);
      if (remainingMs <= 0) {
        setCooldownMessage(null);
        return { shouldTick: false, active: false };
      }

      const { label, shouldTick } = getCooldownLabel(remainingMs);
      setCooldownMessage(`닉네임은 ${label} 뒤에 바꿀 수 있어요.`);
      return { shouldTick, active: true };
    };

    const first = compute();
    if (!first.active || !first.shouldTick) return;

    const id = window.setInterval(() => {
      const next = compute();
      if (!next.active) window.clearInterval(id);
    }, MINUTE_MS);

    return () => window.clearInterval(id);
  }, [open, lastNicknameUpdatedAt]);

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
    if (nicknameChanged && getCharCount(next) > NICKNAME_MAX_CHARS) {
      setError("닉네임은 최대 12자까지만 가능해요.");
      return;
    }
    if (nicknameChanged && cooldownMessage) {
      setError(cooldownMessage);
      return;
    }
    if (nicknameChanged && checkState === "checking") {
      setError("닉네임 중복 확인 중이에요. 잠시만 기다려주세요.");
      return;
    }
    if (nicknameChanged && checkState === "taken") {
      setError("이미 사용 중인 닉네임이에요.");
      return;
    }
    if (isUnchanged) {
      setOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      const y = window.scrollY;
      await updateMyProfile({
        nickname: nicknameChanged ? next : undefined,
        profileImageUrl: imageChanged ? profileImageUrl : undefined,
      });
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
              <div>
                <div className="block font-semibold text-gray-800">
                  프로필 이미지
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setProfileImageUrl("default")}
                    className={[
                      "flex flex-col items-center justify-center gap-2 rounded-2xl border p-3 ",
                      profileImageUrl === "default"
                        ? "ring-2 ring-blue-500 border-0"
                        : "border-gray-200 ",
                    ].join(" ")}
                  >
                    <ProfileAvatar
                      imageUrl="default"
                      fallbackVariant="box"
                      fallbackClassName="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-200"
                      wrapperClassName="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-200 p-1"
                      imgClassName="h-full w-full rounded-full object-cover"
                      iconClassName="h-7 w-7 text-gray-400"
                    />
                    <span className="text-xs font-semibold text-gray-700">
                      기본
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setProfileImageUrl("/images/profiles/cat.webp")
                    }
                    className={[
                      "flex flex-col items-center justify-center gap-2 rounded-2xl border p-3 ",
                      profileImageUrl === "/images/profiles/cat.webp"
                        ? "ring-2 ring-blue-500 border-0"
                        : "border-gray-200 ",
                    ].join(" ")}
                  >
                    <ProfileAvatar
                      imageUrl="/images/profiles/cat.webp"
                      wrapperClassName="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-200 p-1"
                      imgClassName="h-full w-full rounded-full object-cover"
                      iconClassName="h-7 w-7 text-gray-400"
                    />
                    <span className="text-xs font-semibold text-gray-700">
                      고양이
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setProfileImageUrl("/images/profiles/dog.webp")
                    }
                    className={[
                      "flex flex-col items-center justify-center gap-2 rounded-2xl border p-3 ",
                      profileImageUrl === "/images/profiles/dog.webp"
                        ? "ring-2 ring-blue-500 border-0"
                        : "border-gray-200 ",
                    ].join(" ")}
                  >
                    <ProfileAvatar
                      imageUrl="/images/profiles/dog.webp"
                      wrapperClassName="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-200 p-1"
                      imgClassName="h-full w-full rounded-full object-cover"
                      iconClassName="h-7 w-7 text-gray-400"
                    />
                    <span className="text-xs font-semibold text-gray-700">
                      강아지
                    </span>
                  </button>
                </div>
              </div>

              <label className="mt-6 block font-semibold text-gray-800">
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

              <div className="mt-1 space-y-1 text-sm">
                {!nickname.trim() ? (
                  <p className="text-gray-500">닉네임을 입력해주세요.</p>
                ) : isTooLong ? (
                  <p className="text-red-500">
                    닉네임은 최대 12자까지만 가능해요.
                  </p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : nicknameChanged && checkState === "checking" ? (
                  <p className="text-gray-500">중복 확인 중...</p>
                ) : nicknameChanged && checkState === "taken" ? (
                  <p className="text-red-500">이미 사용 중인 닉네임이에요.</p>
                ) : nicknameChanged && checkState === "available" ? (
                  <p className="text-blue-500">사용 가능한 닉네임이에요.</p>
                ) : nicknameChanged && checkState === "error" ? (
                  <p className="text-gray-500">
                    중복 확인에 실패했어요. 저장으로 확인해볼 수 있어요.
                  </p>
                ) : null}

                {cooldownMessage ? (
                  <p className="text-gray-500">{cooldownMessage}</p>
                ) : null}
              </div>
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
                disabled={
                  isSaving ||
                  (nicknameChanged && checkState === "checking") ||
                  (nicknameChanged && checkState === "taken") ||
                  (nicknameChanged &&
                    getCharCount(nickname) > NICKNAME_MAX_CHARS) ||
                  (nicknameChanged && Boolean(cooldownMessage))
                }
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
