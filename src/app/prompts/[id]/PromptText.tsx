"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

type PromptTextProps = {
  text: string;
};

export default function PromptText({ text }: PromptTextProps) {
  const [expanded, setExpanded] = useState(false);

  const shouldShowToggle = useMemo(() => text.trim().length > 200, [text]);

  return (
    <div>
      <div
        className={`whitespace-pre-wrap text-lg leading-relaxed text-gray-800 transition-[max-height] duration-300 ${
          expanded ? "max-h-[1000px]" : "max-h-32 overflow-hidden"
        }`}
      >
        {text}
      </div>
      {shouldShowToggle && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full p-3 inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold text-gray-600 transition hover:text-gray-900 cursor-pointer"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    </div>
  );
}
