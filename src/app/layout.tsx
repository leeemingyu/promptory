import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://prompt-ory.vercel.app/"),
  title: {
    default: "Promptory | AI 이미지 변환 프롬프트 공유",
    template: "%s | Promptory",
  },
  description:
    "마인크래프트·레고 감성부터 고화질 4K·시네마틱까지. 내 사진을 수만 가지 컨셉의 AI 아트로 변환해주는 프롬프트를 탐색하고 공유하세요.",
  keywords: [
    "AI 이미지 프롬프트",
    "사진 AI 변환",
    "AI 필터 공유",
    "이미지 생성 AI 명령어",
    "마인크래프트 AI",
    "레고 AI",
    "시네마틱 프롬프트",
    "픽셀 아트 AI",
    "제미나이 활용법",
    "Promptory",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Promptory",
    title: "Promptory | 당신의 사진을 위한 모든 AI 컨셉과 프롬프트",
    description:
      "상상하는 모든 스타일을 현실로. 인스타 핫 트렌드 컨셉부터 독창적인 예술 스타일까지, 검증된 AI 변환 프롬프트의 모든 것.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Promptory - 다양한 스타일의 AI 이미지 변환 프롬프트",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Promptory | AI로 사진의 스타일을 재정의하세요",
    description:
      "유행하는 마인크래프트 감성부터 나만의 독특한 아트 스타일까지, 프롬프트 한 줄로 완성하는 AI 변환.",
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
