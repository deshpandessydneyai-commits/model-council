"use client";

import React, { createContext, useContext, useCallback, useEffect, useState } from "react";

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("model-council-theme");
    const isDarkTheme = savedTheme === "dark";

    setIsDark(isDarkTheme);

    // Apply theme to DOM immediately
    const html = document.documentElement;
    if (isDarkTheme) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    setMounted(true);
  }, []);

  // Update DOM whenever isDark changes
  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
      localStorage.setItem("model-council-theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("model-council-theme", "light");
    }
  }, [isDark, mounted]);

  const toggleTheme = useCallback(() => {
    console.log("[Theme] Toggle clicked");
    setIsDark((prevIsDark) => {
      const newValue = !prevIsDark;
      console.log("[Theme] Updating isDark from", prevIsDark, "to", newValue);
      return newValue;
    });
  }, []);

  if (!mounted) {
    // Return children during SSR and hydration
    return <ThemeContext.Provider value={{ isDark: false, toggleTheme }}>{children}</ThemeContext.Provider>;
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
