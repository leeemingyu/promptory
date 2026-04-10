"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import LogoutButton from "@/components/layout/LogoutButton";

type MobileMenuProps = {
  isAuthed: boolean;
  nickname: string;
};

export default function MobileMenu({ isAuthed, nickname }: MobileMenuProps) {
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
        aria-label="메뉴 열기"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-700 transition hover:bg-gray-50"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="px-4 py-3 text-xs text-gray-500">
            {isAuthed ? `${nickname}님` : "환영합니다"}
          </div>
          <div className="border-t">
            <Link
              href="/prompts"
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              전체 프롬프트
            </Link>
            <Link
              href="/rankings"
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              사용자 랭킹
            </Link>
            {isAuthed ? (
              <>
                <Link
                  href="/prompts/create"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  작성하기
                </Link>
                <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                  <LogoutButton onLogout={() => setOpen(false)} />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  로그인
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
