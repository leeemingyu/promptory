"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import LogoutButton from "@/components/layout/LogoutButton";

type MobileMenuProps = {
  isAuthed: boolean;
  profileId?: string | null;
};

export default function MobileMenu({ isAuthed, profileId }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (containerRef.current && target) {
        if (!containerRef.current.contains(target)) setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        className="cursor-pointer inline-flex h-10 w-10 active:scale-80 items-center justify-center rounded-lg bg-white text-gray-700 transition hover:bg-gray-50"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div
        aria-hidden={!open}
        className={[
          "fixed top-10 left-0 z-50 mt-2 w-full overflow-hidden bg-white shadow-lg",
          "transition-all duration-300 ease-in-out",
          open ? "max-h-125" : "max-h-0",
        ].join(" ")}
      >
        <div>
          <Link
            href="/prompts"
            className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100 "
            onClick={() => setOpen(false)}
          >
            전체 프롬프트
          </Link>
          <Link
            href="/rankings"
            className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100 "
            onClick={() => setOpen(false)}
          >
            사용자 랭킹
          </Link>
          {isAuthed ? (
            <>
              {profileId ? (
                <Link
                  href={`/profiles/${profileId}`}
                  className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100 "
                  onClick={() => setOpen(false)}
                >
                  내 정보
                </Link>
              ) : null}
              <Link
                href="/prompts/create"
                className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100 "
                onClick={() => setOpen(false)}
              >
                작성하기
              </Link>
              <div className="text-sm text-gray-700 hover:bg-gray-100 ">
                <LogoutButton
                  onLogout={() => setOpen(false)}
                  className="w-full flex px-4 py-4 "
                />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100 "
                onClick={() => setOpen(false)}
              >
                로그인
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
