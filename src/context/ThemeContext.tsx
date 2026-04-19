// src/context/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_COLORS, LIGHT_COLORS, DARK_GRADIENTS, LIGHT_GRADIENTS, getThemeColors } from '../constants/theme';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextValue {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: typeof DARK_COLORS;
  gradients: typeof DARK_GRADIENTS;
  setTheme: (mode: ThemeMode) => void;
}

const THEME_STORAGE_KEY = '@healthcare_theme';

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: 'system',
  isDark: true,
  colors: DARK_COLORS,
  gradients: DARK_GRADIENTS,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isReady, setIsReady] = useState(false);

  // Load persisted theme on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        setThemeMode(stored);
      }
      setIsReady(true);
    });
  }, []);

  const setTheme = async (mode: ThemeMode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  // Resolve effective dark/light
  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemScheme === 'dark') ||
    (themeMode === 'system' && systemScheme == null); // default to dark if unknown

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const gradients = isDark ? DARK_GRADIENTS : LIGHT_GRADIENTS;

  if (!isReady) return null; // Avoid flash

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, colors, gradients, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
