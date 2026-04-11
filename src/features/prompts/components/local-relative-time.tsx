"use client";

import { useEffect, useMemo, useState } from "react";

type LocalRelativeTimeProps = {
  value: string | Date;
  /**
   * Rendered until the browser formats the date using the user's locale/timezone.
   * Keep this stable to avoid hydration mismatches.
   */
  placeholder?: string;
  /**
   * Update cadence for relative labels (e.g. "15분 전" -> "16분 전").
   * Defaults to 60s.
   */
  refreshMs?: number;
};

function formatAbsoluteKoreanDate(date: Date) {
  const y = String(date.getFullYear());
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}년 ${m}월 ${d}일`;
}

function formatRelative(date: Date, nowMs: number) {
  const diffMs = nowMs - date.getTime();
  if (!Number.isFinite(diffMs)) return null;
  if (diffMs < 0) return formatAbsoluteKoreanDate(date);

  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 60) return "방금";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}분`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일`;

  return formatAbsoluteKoreanDate(date);
}

export default function LocalRelativeTime({
  value,
  placeholder = "—",
  refreshMs = 60_000,
}: LocalRelativeTimeProps) {
  const date = useMemo(() => {
    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [value]);

  // Keep initial render stable (placeholder) to avoid hydration mismatches,
  // then compute labels after mount using the user's timezone/locale.
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    if (!date) return;

    // First update async (avoid setState directly inside effect body).
    const t0 = window.setTimeout(() => setNowMs(Date.now()), 0);
    const id = window.setInterval(() => setNowMs(Date.now()), refreshMs);
    return () => {
      window.clearTimeout(t0);
      window.clearInterval(id);
    };
  }, [date, refreshMs]);

  const dateTime = date ? date.toISOString() : undefined;
  const text = useMemo(() => {
    if (!date) return placeholder;
    if (nowMs === null) return placeholder;
    return formatRelative(date, nowMs) ?? placeholder;
  }, [date, nowMs, placeholder]);

  return (
    <time dateTime={dateTime} title={dateTime}>
      {text}
    </time>
  );
}
