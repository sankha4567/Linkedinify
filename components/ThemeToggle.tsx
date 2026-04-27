"use client";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      suppressHydrationWarning
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative h-9 w-9 inline-flex items-center justify-center rounded-full border border-border bg-card hover:bg-muted transition-colors"
    >
      <svg
        className="h-4 w-4 absolute scale-100 rotate-0 dark:scale-0 dark:-rotate-90 transition-transform"
        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="4" />
        <path strokeLinecap="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M5.343 18.657l-.707.707m13.728 0l-.707-.707M5.343 5.343l-.707-.707" />
      </svg>
      <svg
        className="h-4 w-4 absolute scale-0 rotate-90 dark:scale-100 dark:rotate-0 transition-transform"
        fill="currentColor" viewBox="0 0 24 24"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
