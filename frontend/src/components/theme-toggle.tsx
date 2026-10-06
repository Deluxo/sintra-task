"use client";

import { Button } from "./atom/form";
import { useTheme, type Theme } from "./theme-context";

const LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

const ICONS: Record<Theme, string> = {
  light: "☀️",
  dark: "🌙",
  system: "🖥️",
};

export function ThemeToggle() {
  const { theme, nextTheme, mounted, cycleTheme } = useTheme();

  return (
    <Button
      type="button"
      onClick={cycleTheme}
      aria-label={`Theme: ${LABELS[theme]}. Switch to ${LABELS[nextTheme]}.`}
    >
      <span className="text-sm">
        {ICONS[theme]} {mounted ? LABELS[theme] : ""}
      </span>
    </Button>
  );
}
