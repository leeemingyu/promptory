"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, User } from "lucide-react";
import LogoutButton from "@/components/layout/LogoutButton";

type ProfileDropdownProps = {
  profileId: string;
  nickname: string;
  profileImageUrl: string | null;
};

export default function ProfileDropdown({
  profileId,
  nickname,
  profileImageUrl,
}: ProfileDropdownProps) {
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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="프로필 메뉴 열기"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-lg bg-gray-200 p-1 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 cursor-pointer"
      >
        {profileImageUrl ? (
          // Use <img> to avoid Next Image host restrictions.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profileImageUrl}
            alt=""
            className="h-6 w-6 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <User className="h-6 w-6 text-gray-400" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="프로필 메뉴"
          className="absolute right-0 top-9 z-200 py-2 w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
        >
          <header className="flex items-center gap-3 mt-1 px-5 py-2">
            {profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileImageUrl}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200">
                <User className="h-7 w-7 text-gray-400" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate font-bold text-gray-900">{nickname}</div>
            </div>
          </header>

          <div className="h-px w-full my-2 bg-[linear-gradient(to_right,transparent_0%,#e5e7eb_20%,#e5e7eb_80%,transparent_100%)]" />
          <section className="flex flex-col px-3 py-1 font-semibold">
            <Link
              href={`/profiles/${profileId}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-2 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100 rounded-lg"
            >
              내 정보 <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>

            <LogoutButton
              onLogout={() => setOpen(false)}
              buttonProps={{ role: "menuitem" }}
              className="block w-full px-2 py-1.5 text-left text-sm text-gray-600 transition hover:bg-gray-100 rounded-lg"
            />
          </section>
        </div>
      )}
    </div>
  );
}
