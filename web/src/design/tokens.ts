/** One source for v2 visual and sensory values; independent of legacy styles. */
export const palette = {
  shyam: "#1d2a5b",
  ratri: "#0c1126",
  shankh: "#f4f3f6",
  genda: "#f0a202",
  pital: "#a67c2e",
  tulsi: "#2f6b4f",
  kumkum: "#c8331f",
  kamal: "#e7a1b0",
  ink: "#1a1c2b",
  chandni: "#e9e6f2",
  error: "#b3261e",
} as const;
export const themes = {
  light: {
    bg: palette.shankh,
    bgSanctum: palette.ratri,
    surface: "#ffffff",
    surfaceRaised: "#e9e7ef",
    textPrimary: palette.ink,
    textSecondary: "#5a5c70",
    textOnAccent: "#ffffff",
    accent: palette.shyam,
    accentPressed: "#111a3e",
    success: palette.tulsi,
    sacred: palette.kumkum,
    error: palette.error,
    hairline: "#bfc0ce",
    glow: "#f0a20226",
    scrim: "#0c112699",
  },
  dark: {
    bg: palette.ratri,
    bgSanctum: "#070a1c",
    surface: "#141c39",
    surfaceRaised: palette.shyam,
    textPrimary: palette.chandni,
    textSecondary: "#b8bdd5",
    textOnAccent: palette.ratri,
    accent: palette.genda,
    accentPressed: "#ffc454",
    success: "#92d2ae",
    sacred: "#f29c90",
    error: "#ffb4ab",
    hairline: "#505b7c",
    glow: "#f0a20226",
    scrim: "#070a1ccc",
  },
  lamp: {
    bg: "#211a15",
    bgSanctum: "#17100c",
    surface: "#2e241b",
    surfaceRaised: "#3d3024",
    textPrimary: "#f3e6cf",
    textSecondary: "#cdbca0",
    textOnAccent: "#211a15",
    accent: "#e5b86f",
    accentPressed: "#f4ca8b",
    success: "#b5c697",
    sacred: "#e6a494",
    error: "#ffb4ab",
    hairline: "#806a50",
    glow: "#e5b86f26",
    scrim: "#17100ccc",
  },
} as const;
export type Theme = keyof typeof themes;
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  gutter: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 64,
} as const;
export const typeScale = {
  caption: 12,
  small: 14,
  body: 16,
  reading: 18,
  titleSmall: 20,
  title: 24,
  displaySmall: 30,
  display: 38,
  hero: 48,
} as const;
export const radii = { sheet: 28, card: 20, control: 14, chip: 999 } as const;
export const motion = {
  instant: 40,
  tap: 90,
  quick: 160,
  standard: 280,
  gentle: 480,
  ceremonial: 1600,
  ambient: 6000,
} as const;
export const curves = {
  enter: "cubic-bezier(0.22, 1, 0.36, 1)",
  exit: "cubic-bezier(0.4, 0, 1, 1)",
  move: "cubic-bezier(0.2, 0, 0, 1)",
  breath: "cubic-bezier(0.37, 0, 0.63, 1)",
} as const;
export const springs = {
  standard: { damping: 20, stiffness: 220, mass: 1 },
  gentle: { damping: 18, stiffness: 120, mass: 1 },
  bead: { damping: 14, stiffness: 160, mass: 0.8 },
  firm: { damping: 26, stiffness: 300, mass: 1 },
} as const;
// Vocabulary only. No unlicensed sounds or simulated native haptics are played.
export const sensory = {
  haptics: ["tick", "confirm", "commit", "rise", "phase", "warn"],
  sounds: ["bell", "bead", "chime", "shankh", "tanpura"],
} as const;
export const foundations = {
  "font-body": '"Anek Devanagari", system-ui, sans-serif',
  "font-display": '"Rozha One", Georgia, serif',
  "font-scripture": '"Tiro Devanagari Sanskrit", serif',
  "font-tamil": '"Anek Tamil", sans-serif',
  "font-bengali": '"Anek Bangla", sans-serif',
  "line-body": "1.6",
  "line-display": "1.18",
  "line-indic": "1.8",
  "indic-scale": "1.1",
  "weight-regular": "400",
  "weight-medium": "500",
  "weight-strong": "600",
  target: "56px",
  stroke: "1px",
  focus: "3px",
  measure: "65ch",
  "page-width": "1120px",
  "sky-height": "350px",
  "sky-max": "440px",
  icon: "24px",
  "sky-ink": "#ffffff",
  "sky-shade": "#0c1126b8",
  "moon-dark": "#74788d",
  "moon-light": "#f8ebd5",
  star: "#ffffff",
  shadow: "0 12px 36px #1d2a5b0e",
  "art-line": "#a67c2e80",
  translucent: "#ffffff0d",
  "press-scale": ".98",
  "opacity-dim": ".65",
} as const;
export function themeVariables(
  theme: Theme,
  scale = 1,
): Record<string, string> {
  const vars: Record<string, string> = { "--v2-text-scale": String(scale) };
  for (const [name, value] of Object.entries(themes[theme]))
    vars[`--v2-${name}`] = value;
  for (const [name, value] of Object.entries(foundations))
    vars[`--v2-${name}`] = value;
  for (const [name, value] of Object.entries(spacing))
    vars[`--v2-space-${name}`] = `${value}px`;
  for (const [name, value] of Object.entries(radii))
    vars[`--v2-radius-${name}`] = `${value}px`;
  for (const [name, value] of Object.entries(motion))
    vars[`--v2-motion-${name}`] = `${value}ms`;
  for (const [name, value] of Object.entries(curves))
    vars[`--v2-ease-${name}`] = value;
  for (const [name, value] of Object.entries(typeScale))
    vars[`--v2-type-${name}`] = `calc(${value}px * var(--v2-text-scale))`;
  return vars;
}
