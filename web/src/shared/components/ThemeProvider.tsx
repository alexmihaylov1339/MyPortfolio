'use client';

import { createContext, useContext, useState } from 'react';

import { DEFAULT_THEME, THEME_STORAGE_KEY, type Theme } from '@shared/constants';
import { isBrowserEnvironment } from '@shared/utils';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

function readInitialTheme(): Theme {
  if (!isBrowserEnvironment()) return DEFAULT_THEME;
  const attr = document.documentElement.getAttribute('data-theme');
  return (attr as Theme | null) ?? DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
