export type ColorMode = "light" | "dark";

export interface Palette {
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundDark: string;
  surface: string;
  surfaceGlass: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textDark: string;
  border: string;
  shadow: string;
  error: string;
  success: string;
  warning: string;
  white: string;
  black: string;
  overlay: string;
  tabBarBg: string;
  card: string;
  cardBorder: string;
  scanBtn: string;
  gradientTop: string;
  gradientBottom: string;
  inputBg: string;
  glow: string;
}

export const lightPalette: Palette = {
  primary: "#2E7D32",
  primaryLight: "#4CAF50",
  secondary: "#66BB6A",
  accent: "#A5D6A7",
  background: "#F1F8E9",
  backgroundDark: "#E8F5E9",
  surface: "#FFFFFF",
  surfaceGlass: "rgba(255,255,255,0.85)",
  text: "#1B5E20",
  textSecondary: "#388E3C",
  textMuted: "#81C784",
  textDark: "#1A2E1A",
  border: "#C8E6C9",
  shadow: "rgba(46,125,50,0.15)",
  error: "#C62828",
  success: "#2E7D32",
  warning: "#F57F17",
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(27,94,32,0.6)",
  tabBarBg: "rgba(241,248,233,0.95)",
  card: "#FFFFFF",
  cardBorder: "#E8F5E9",
  scanBtn: "#2E7D32",
  gradientTop: "#2E7D32",
  gradientBottom: "#66BB6A",
  inputBg: "#F1F8E9",
  glow: "rgba(46,125,50,0.35)",
};

export const darkPalette: Palette = {
  primary: "#22C55E",
  primaryLight: "#4ADE80",
  secondary: "#16A34A",
  accent: "rgba(34,197,94,0.18)",
  background: "#0A0F0D",
  backgroundDark: "#050807",
  surface: "#141A16",
  surfaceGlass: "rgba(20,26,22,0.85)",
  text: "#F1F5F9",
  textSecondary: "#86EFAC",
  textMuted: "#94A3B8",
  textDark: "#FFFFFF",
  border: "#1F2A22",
  shadow: "rgba(0,0,0,0.6)",
  error: "#EF4444",
  success: "#22C55E",
  warning: "#F59E0B",
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0,0,0,0.75)",
  tabBarBg: "rgba(10,15,13,0.95)",
  card: "#141A16",
  cardBorder: "rgba(34,197,94,0.25)",
  scanBtn: "#22C55E",
  gradientTop: "#22C55E",
  gradientBottom: "#16A34A",
  inputBg: "#0F1612",
  glow: "rgba(34,197,94,0.55)",
};

let currentPalette: Palette = lightPalette;

export function setColorMode(mode: ColorMode): void {
  currentPalette = mode === "dark" ? darkPalette : lightPalette;
}

export function getCurrentMode(): ColorMode {
  return currentPalette === darkPalette ? "dark" : "light";
}

export function getPalette(mode: ColorMode): Palette {
  return mode === "dark" ? darkPalette : lightPalette;
}

const Colors = new Proxy({} as Palette, {
  get(_target, prop: string | symbol) {
    return currentPalette[prop as keyof Palette];
  },
  ownKeys() {
    return Reflect.ownKeys(currentPalette);
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Reflect.getOwnPropertyDescriptor(currentPalette, prop);
  },
}) as Palette;

export default Colors;
