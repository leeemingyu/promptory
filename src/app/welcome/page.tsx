import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center p-6">
      <section className="w-full rounded-2xl border bg-white p-8 text-center shadow-sm">
        <p className="mb-2 text-sm font-medium text-green-600">
          이메일 인증 완료
        </p>
        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          이메일 인증이 완료되었습니다
        </h1>
        <p className="mb-8 text-sm text-gray-600">
          이제 Promptory를 바로 사용할 수 있습니다.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            홈으로 가기
          </Link>
          <Link
            href="/prompts"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
          >
            프롬프트 보러가기
          </Link>
        </div>
      </section>
    </main>
  );
}
