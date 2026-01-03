import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
  };
}

export const themes: Record<string, Theme> = {
  cyber: {
    name: 'Cyber',
    colors: {
      primary: '#00ffff',
      secondary: '#ff00ff',
      accent: '#ffff00',
      background: '#000000',
      surface: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      border: '#ffffff',
      shadow: '#00ffff',
    },
  },
  sunset: {
    name: 'Sunset',
    colors: {
      primary: '#ff6b35',
      secondary: '#f7931e',
      accent: '#fbb040',
      background: '#1a1423',
      surface: '#2d1b3d',
      text: '#ffffff',
      textSecondary: '#c9a0dc',
      border: '#ff6b35',
      shadow: '#f7931e',
    },
  },
  ocean: {
    name: 'Ocean',
    colors: {
      primary: '#06d6a0',
      secondary: '#118ab2',
      accent: '#ef476f',
      background: '#073b4c',
      surface: '#0a5268',
      text: '#ffffff',
      textSecondary: '#a8dadc',
      border: '#06d6a0',
      shadow: '#118ab2',
    },
  },
  candy: {
    name: 'Candy',
    colors: {
      primary: '#ff1ead',
      secondary: '#7b2cbf',
      accent: '#00f5ff',
      background: '#240046',
      surface: '#3c096c',
      text: '#ffffff',
      textSecondary: '#e0aaff',
      border: '#ff1ead',
      shadow: '#7b2cbf',
    },
  },
  forest: {
    name: 'Forest',
    colors: {
      primary: '#7cb518',
      secondary: '#3a7d34',
      accent: '#f9c74f',
      background: '#1b2a1b',
      surface: '#2d4a2d',
      text: '#ffffff',
      textSecondary: '#a8d08d',
      border: '#7cb518',
      shadow: '#3a7d34',
    },
  },
  retro: {
    name: 'Retro',
    colors: {
      primary: '#ff006e',
      secondary: '#8338ec',
      accent: '#ffbe0b',
      background: '#1a0033',
      surface: '#2d0052',
      text: '#ffffff',
      textSecondary: '#d8b4fe',
      border: '#ff006e',
      shadow: '#8338ec',
    },
  },
};

interface ThemeContextType {
  currentTheme: Theme;
  themeName: string;
  setTheme: (themeName: string) => void;
  themeNames: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState('cyber');

  useEffect(() => {
    const savedTheme = localStorage.getItem('capsule-theme');
    if (savedTheme && themes[savedTheme]) {
      setThemeName(savedTheme);
    }
  }, []);

  useEffect(() => {
    const theme = themes[themeName];
    const root = document.documentElement;

    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-shadow', theme.colors.shadow);

    localStorage.setItem('capsule-theme', themeName);
  }, [themeName]);

  const setTheme = (newThemeName: string) => {
    if (themes[newThemeName]) {
      setThemeName(newThemeName);
    }
  };

  const value: ThemeContextType = {
    currentTheme: themes[themeName],
    themeName,
    setTheme,
    themeNames: Object.keys(themes),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
