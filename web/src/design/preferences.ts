import type { Theme } from "./tokens";
export type Appearance = Theme | "system" | "sun";
export interface Preferences {
  appearance: Appearance;
  scale: 1 | 1.25 | 1.5 | 2;
  language: "en" | "hi";
  motion: "system" | "reduced";
}
export const preferenceKey = "spritual_design_preferences_v1";
export const defaults: Preferences = {
  appearance: "system",
  scale: 1,
  language: "en",
  motion: "system",
};
export function parsePreferences(raw: string | null): Preferences {
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object") return { ...defaults };
    return {
      appearance: ["light", "dark", "lamp", "system", "sun"].includes(
        value.appearance,
      )
        ? value.appearance
        : defaults.appearance,
      scale: [1, 1.25, 1.5, 2].includes(value.scale)
        ? value.scale
        : defaults.scale,
      language: value.language === "hi" ? "hi" : "en",
      motion: value.motion === "reduced" ? "reduced" : "system",
    };
  } catch {
    return { ...defaults };
  }
}
export function resolveTheme(
  appearance: Appearance,
  systemDark: boolean,
  sunElevation: number,
): Theme {
  return appearance === "system"
    ? systemDark
      ? "dark"
      : "light"
    : appearance === "sun"
      ? sunElevation < -0.833
        ? "dark"
        : "light"
      : appearance;
}
export function isDesignPreview(pathname: string, search: string) {
  return (
    pathname === "/design" && new URLSearchParams(search).get("ui_v2") === "1"
  );
}
