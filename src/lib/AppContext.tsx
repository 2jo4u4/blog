"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import translations from "./i18n.json";

export type Locale = "zh" | "en";
export type Theme = "dark" | "light";

interface AppContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: typeof translations.zh;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh");
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem("portfolio-theme") as Theme | null;
    const savedLocale = localStorage.getItem("portfolio-locale") as Locale | null;

    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme("dark");
    }

    if (savedLocale) {
      setLocale(savedLocale);
    }
  }, []);

  const applyTheme = (targetTheme: Theme) => {
    if (targetTheme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  };

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem("portfolio-theme", nextTheme);
  };

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("portfolio-locale", newLocale);
  };

  const t = translations[locale] || translations.zh;

  return (
    <AppContext.Provider
      value={{
        locale,
        setLocale: handleSetLocale,
        theme,
        toggleTheme,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
