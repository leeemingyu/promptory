import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="text-lg font-bold text-black">Promptory</p>
            <p className="max-w-sm break-keep text-sm text-gray-500">
              AI 프롬프트의 모든 것. 원하는 프롬프트를 찾고, 나만의 작품을
              만들어 보세요.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-gray-600">
            <Link href="/" className="transition hover:text-black">
              홈
            </Link>
            <Link href="/prompts" className="transition hover:text-black">
              프롬프트
            </Link>
            <Link href="/rankings" className="transition hover:text-black">
              랭킹
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
          <p>© 2026 Promptory. All rights reserved.</p>
          <p>Made for creators.</p>
        </div>
      </div>
    </footer>
  );
}
