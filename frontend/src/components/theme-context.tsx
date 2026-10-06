"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

const NEXT_THEME: Record<Theme, Theme> = {
  light: "dark",
  dark: "system",
  system: "light",
};

/**
 * Reads the stored choice. Only an explicit light/dark/system is honoured;
 * anything else (first visit, unknown value) defaults to "system", matching
 * the pre-paint script so the first paint and the hydrated state agree.
 */
function readStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

/**
 * Client components are still server-rendered, so `window` can be missing here.
 * The result is only consumed in effects, so an unknown server value is fine.
 */
function prefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

interface ThemeContextValue {
  /** The user's stored preference, before system resolution. */
  theme: Theme;
  /** The theme {@link cycleTheme} would switch to next. */
  nextTheme: Theme;
  /** The concrete mode currently applied to the page. */
  isDark: boolean;
  /** True once the client has adopted the stored theme and is safe to render labels. */
  mounted: boolean;
  /** Set an explicit theme and persist it. */
  setTheme: (theme: Theme) => void;
  /** Advance to the next theme in the light → dark → system cycle. */
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Owns the theme: reads the stored choice, follows the system preference in
 * "system" mode, keeps it live (OS changes and other tabs), and writes the
 * resolved `dark` class onto <html>. Components read it via {@link useTheme}.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // "system" is the pre-hydration default so it matches the pre-paint script's
  // first paint (which follows the OS); the adopting effect below replaces it
  // with the stored choice.
  const [theme, setThemeState] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // Adopt the theme the pre-paint script already applied, then allow rendering
  // the real label. Until mounted the label is omitted so it cannot mismatch.
  useEffect(() => {
    setThemeState(readStoredTheme());
    setMounted(true);
  }, []);

  // Keep "system" live: follow the OS when it changes, and pick up a choice
  // made in another tab.
  useEffect(() => {
    const sync = () => setThemeState(readStoredTheme());
    const query = window.matchMedia("(prefers-color-scheme: dark)");

    query.addEventListener("change", sync);
    window.addEventListener("storage", sync);

    return () => {
      query.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Always resolve to a concrete class, including in system mode, so the theme
  // never depends on a CSS media fallback agreeing with React.
  const isDark = theme === "dark" || (theme === "system" && prefersDark());

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark, mounted]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const cycleTheme = () => setTheme(NEXT_THEME[theme]);

  const value: ThemeContextValue = {
    theme,
    nextTheme: NEXT_THEME[theme],
    isDark,
    mounted,
    setTheme,
    cycleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Read the current theme state and controls. Must be used inside a {@link ThemeProvider}. */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
