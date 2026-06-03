/**
 * @file ThemeContext.jsx
 * Light/dark theme provider. Persists the preference in localStorage and
 * toggles the `dark` class on the document root (Tailwind class strategy).
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(null);

/** Provider component wrapping the app. */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('fems_theme') || 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('fems_theme', theme);
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

/** Hook to read/toggle the theme. */
export function useTheme() {
  return useContext(ThemeContext);
}
