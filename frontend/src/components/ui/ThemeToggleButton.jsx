import { useEffect, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";

function resolveInitialTheme() {
  if (typeof window === "undefined") return "light";

  const saved = localStorage.getItem("theme-mode");
  if (saved === "dark" || saved === "light") return saved;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export default function ThemeToggleButton({
  className = "",
  showLabel = false,
  srLabel,
  variant = "default",
}) {
  const [isDark, setIsDark] = useState(false);

  // Apply the correct theme on first mount (fixes "always loads light" bug)
  useEffect(() => {
    const theme = resolveInitialTheme();
    applyTheme(theme);
    setIsDark(theme === "dark");
  }, []);

  // Stay in sync if theme changes elsewhere (another tab, another toggle instance)
  useEffect(() => {
    const syncTheme = () =>
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");

    window.addEventListener("themechange", syncTheme);
    window.addEventListener("storage", syncTheme);

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      window.removeEventListener("themechange", syncTheme);
      window.removeEventListener("storage", syncTheme);
      observer.disconnect();
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem("theme-mode", nextTheme);
    window.dispatchEvent(new CustomEvent("themechange", { detail: nextTheme }));
    setIsDark(nextTheme === "dark");
  };

  const baseClass =
    variant === "compact"
      ? "flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-300 dark:hover:border-emerald-400/60 dark:hover:bg-slate-800 dark:hover:text-emerald-200"
      : "flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-300 dark:hover:border-emerald-400/60 dark:hover:bg-slate-800 dark:hover:text-emerald-200";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        srLabel || (isDark ? "Switch to light mode" : "Switch to dark mode")
      }
      className={`${baseClass} ${className}`.trim()}
    >
      {isDark ? (
        <SunMedium size={16} className="text-amber-300" />
      ) : (
        <MoonStar size={16} className="text-emerald-500" />
      )}
      {showLabel ? <span>{isDark ? "Light" : "Dark"}</span> : null}
    </button>
  );
}
