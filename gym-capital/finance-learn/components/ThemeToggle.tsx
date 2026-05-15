"use client";

import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { tema, alternar, hidratado } = useTheme();

  if (!hidratado) {
    return (
      <div
        className={compact ? "w-9 h-9" : "w-9 h-9"}
        aria-hidden
      />
    );
  }

  const isDark = tema === "dark";

  return (
    <button
      onClick={alternar}
      className="w-9 h-9 flex items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-navy-800 transition-colors"
      title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      aria-label="Alternar tema"
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
