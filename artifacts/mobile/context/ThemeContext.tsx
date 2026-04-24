import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setColorMode, ColorMode, getPalette, Palette } from "@/constants/colors";

interface ThemeContextValue {
  mode: ColorMode;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
  isDark: boolean;
  palette: Palette;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "greenscope_theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ColorMode>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === "dark" || stored === "light") {
          setColorMode(stored);
          setModeState(stored);
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  const setMode = (m: ColorMode) => {
    setColorMode(m);
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode,
      toggleMode: () => setMode(mode === "dark" ? "light" : "dark"),
      isDark: mode === "dark",
      palette: getPalette(mode),
    }),
    [mode]
  );

  if (!hydrated) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
