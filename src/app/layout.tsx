import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://prompt-ory.vercel.app/"),
  title: {
    default: "Promptory | AI 프롬프트 탐색·공유 플랫폼",
    template: "%s | Promptory",
  },
  description:
    "AI 프롬프트를 검색·필터·정렬하며 탐색하고, 좋아요·복사·공유할 수 있는 프롬프트 큐레이션 플랫폼입니다.",
  keywords: [
    "AI 프롬프트",
    "프롬프트",
    "프롬프트 공유",
    "프롬프트 모음",
    "프롬프트 검색",
    "AI 아트",
    "이미지 생성",
    "Midjourney",
    "Stable Diffusion",
    "DALL·E",
    "Claude",
    "GPT",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Promptory",
    title: "Promptory | AI 프롬프트 탐색·공유 플랫폼",
    description:
      "AI 프롬프트를 검색·필터·정렬하며 탐색하고, 좋아요·복사·공유할 수 있는 프롬프트 큐레이션 플랫폼입니다.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Promptory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Promptory | AI 프롬프트 탐색·공유 플랫폼",
    description:
      "AI 프롬프트를 검색·필터·정렬하며 탐색하고, 좋아요·복사·공유할 수 있는 프롬프트 큐레이션 플랫폼입니다.",
    images: ["/og.png"],
  },
  verification: {
    google: "ncLl0k3KfnTdgRlrgUvN0sYftvIZy19LXZRWvIQ8QAU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <div className="p-5">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
