"use client";

import Image from "next/image";
import { useState } from "react";

type PromptImageTabsProps = {
  beforeSrc: string;
  afterSrc: string;
  alt?: string;
  className?: string;
  defaultTab?: "before" | "after";
};

export default function PromptImageTabs({
  beforeSrc,
  afterSrc,
  alt = "",
  className,
  defaultTab = "after",
}: PromptImageTabsProps) {
  const [activeTab, setActiveTab] = useState<"before" | "after">(defaultTab);

  return (
    <div
      className={["relative h-full w-full", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
        <div
          role="tablist"
          aria-label="Before/After"
          className="relative grid grid-cols-2 rounded-lg bg-gray-200 p-1"
        >
          <div
            aria-hidden
            className={[
              "pointer-events-none absolute inset-1 w-[calc(50%-0.25rem)] rounded-md bg-white transition-transform duration-200 ease-out",
              activeTab === "after" ? "translate-x-full" : "translate-x-0",
            ].join(" ")}
          />
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "before"}
            onClick={() =>
              setActiveTab((prev) => (prev === "before" ? "after" : "before"))
            }
            className={[
              "relative z-10 px-3 py-1.5 text-xs font-semibold transition-colors",
              activeTab === "before" ? "text-gray-700" : "text-gray-500",
            ].join(" ")}
          >
            Before
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "after"}
            onClick={() =>
              setActiveTab((prev) => (prev === "after" ? "before" : "after"))
            }
            className={[
              "relative z-10 px-3 py-1.5 text-xs font-semibold transition-colors",
              activeTab === "after" ? "text-gray-700" : "text-gray-500",
            ].join(" ")}
          >
            After
          </button>
        </div>
      </div>

      <div className="relative h-full w-full">
        <Image
          src={beforeSrc}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={[
            "object-contain transition-opacity duration-200",
            activeTab === "before"
              ? "opacity-100"
              : "opacity-0 pointer-events-none",
          ].join(" ")}
        />
        <Image
          src={afterSrc}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={[
            "object-contain transition-opacity duration-200",
            activeTab === "after"
              ? "opacity-100"
              : "opacity-0 pointer-events-none",
          ].join(" ")}
        />
      </div>
    </div>
  );
}
