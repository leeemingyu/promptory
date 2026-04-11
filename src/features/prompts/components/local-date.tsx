"use client";

type LocalDateProps = {
  value: string | Date;
  /**
   * Rendered until the browser formats the date using the user's locale/timezone.
   * Keep this stable to avoid hydration mismatches.
   */
  placeholder?: string;
};

export default function LocalDate({ value, placeholder = "—" }: LocalDateProps) {
  const date = value instanceof Date ? value : new Date(value);
  const valid = !Number.isNaN(date.getTime());

  // Render a stable placeholder during SSR, then show the user's local format on the client.
  const text =
    typeof window === "undefined"
      ? placeholder
      : valid
        ? date.toLocaleDateString()
        : placeholder;

  return (
    <time
      dateTime={value instanceof Date ? value.toISOString() : value}
      suppressHydrationWarning
    >
      {text}
    </time>
  );
}
