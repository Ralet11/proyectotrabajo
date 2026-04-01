import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { Palette, PaletteName, palettes } from './palettes';

const DEFAULT_PALETTE: PaletteName = 'orchid';

export type AppTheme = {
  paletteName: PaletteName;
  colors: Palette;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  typography: {
    hero: number;
    title: number;
    heading: number;
    body: number;
    caption: number;
  };
  effects: {
    cardShadow: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
};

type ThemeContextValue = {
  theme: AppTheme;
  paletteName: PaletteName;
  setPaletteName: (paletteName: PaletteName) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function withAlpha(hex: string, alpha: string) {
  return `${hex}${alpha}`;
}

export function createTheme(paletteName: PaletteName): AppTheme {
  const palette = palettes[paletteName];

  return {
    paletteName,
    colors: palette,
    spacing: {
      xs: 6,
      sm: 10,
      md: 16,
      lg: 20,
      xl: 28,
      xxl: 36,
    },
    radius: {
      sm: 14,
      md: 22,
      lg: 30,
      pill: 999,
    },
    typography: {
      hero: 38,
      title: 28,
      heading: 22,
      body: 16,
      caption: 13,
    },
    effects: {
      cardShadow: {
        shadowColor: withAlpha(palette.shadow, '88'),
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.22,
        shadowRadius: 28,
        elevation: 8,
      },
    },
  };
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [paletteName, setPaletteName] = useState<PaletteName>(DEFAULT_PALETTE);

  const value = useMemo(
    () => ({
      theme: createTheme(paletteName),
      paletteName,
      setPaletteName,
    }),
    [paletteName],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }

  return context.theme;
}

export function useThemeController() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeController must be used within ThemeProvider');
  }

  return {
    paletteName: context.paletteName,
    setPaletteName: context.setPaletteName,
  };
}
