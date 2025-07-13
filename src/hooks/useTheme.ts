import { useState, useEffect, useRef } from 'react';

export interface ThemeColors {
  pageBackgroundColor: string;
  pageForegroundColor: string;
  lightSquareColor: string;
  darkSquareColor: string;
  whiteArrowColor: string;
  blackArrowColor: string;
}

export const useTheme = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    return savedTheme || 'dark';
  });

  const [lightThemeColors, setLightThemeColors] = useState<ThemeColors>({
    pageBackgroundColor: '#f8f9fa',
    pageForegroundColor: '#000000',
    lightSquareColor: '#ffffff',
    darkSquareColor: '#777777',
    whiteArrowColor: '#ff0000',
    blackArrowColor: '#0000ff'
  });

  const [darkThemeColors, setDarkThemeColors] = useState<ThemeColors>({
    pageBackgroundColor: '#0a0a0a',
    pageForegroundColor: '#ffffff',
    lightSquareColor: '#dddddd',
    darkSquareColor: '#444444',
    whiteArrowColor: '#ff0000',
    blackArrowColor: '#0000ff'
  });

  const currentThemeColors = theme === 'dark' ? darkThemeColors : lightThemeColors;

  // Load from localStorage
  useEffect(() => {
    const savedLight = localStorage.getItem('lightThemeColors');
    if (savedLight) {
      setLightThemeColors(JSON.parse(savedLight));
    }
    const savedDark = localStorage.getItem('darkThemeColors');
    if (savedDark) {
      setDarkThemeColors(JSON.parse(savedDark));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('lightThemeColors', JSON.stringify(lightThemeColors));
    localStorage.setItem('darkThemeColors', JSON.stringify(darkThemeColors));
  }, [lightThemeColors, darkThemeColors]);

  // Save theme to localStorage when it changes, but handle initial render correctly
  const isInitialRender = useRef(true);
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      // Only save to localStorage on initial render if no theme was previously saved
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        localStorage.setItem('theme', theme);
      }
      return;
    }
    // For subsequent renders, always save the theme
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply theme to body element
  useEffect(() => {
    document.body.style.backgroundColor = currentThemeColors.pageBackgroundColor;
    document.body.style.color = currentThemeColors.pageForegroundColor;
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    document.body.style.transition = 'background-color 0.2s ease';
  }, [currentThemeColors]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const updateThemeColors = (colors: Partial<ThemeColors>) => {
    if (theme === 'dark') {
      setDarkThemeColors(prev => ({ ...prev, ...colors }));
    } else {
      setLightThemeColors(prev => ({ ...prev, ...colors }));
    }
  };

  return {
    theme,
    currentThemeColors,
    lightThemeColors,
    darkThemeColors,
    toggleTheme,
    updateThemeColors,
    setLightThemeColors,
    setDarkThemeColors,
  };
};
