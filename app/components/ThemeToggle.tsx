"use client";

const THEME_STORAGE_KEY = "argus-theme";

type Theme = "light" | "dark";

function getCurrentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function setTheme(theme: Theme) {
  const root = document.documentElement;

  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The visual toggle still works when storage is unavailable.
  }
}

export default function ThemeToggle() {
  const toggleTheme = () => {
    setTheme(getCurrentTheme() === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Bytt mellom lys og mørk modus"
      title="Bytt mellom lys og mørk modus"
      className="grid size-10 shrink-0 place-items-center rounded-full text-foreground transition hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95"
    >
      <span className="theme-icon theme-icon--light" aria-hidden="true">
        ☀︎
      </span>
      <span className="theme-icon theme-icon--dark" aria-hidden="true">
        ☾
      </span>
    </button>
  );
}
