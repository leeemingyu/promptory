import Link from "next/link";

export default function NotFound() {
  return (
    <main className="h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-500 mb-6">존재하지 않는 프롬프트입니다.</p>
      <Link href="/" className="px-4 py-2 bg-black text-white rounded">
        목록으로 돌아가기
      </Link>
    </main>
  );
}
