"use client";

import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button type="button" className="ThemeToggle" onClick={toggleTheme} aria-label="Toggle theme">
      <span className="ThemeToggle__label">Theme</span>
      <span className="ThemeToggle__value">{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}

