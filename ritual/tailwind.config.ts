import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "palm-leaf": "#D4C5A9",
        "ink-black": "#1C1A17",
        "gold-leaf": "#B8963E",
        "deep-indigo": "#1A1035",
        "muted-terracotta": "#A65A3A",
        vellum: "#FAF6EE",
        "parchment-warm": "#F2E8D5",
        "parchment-deep": "#E5D7BE",
        sindoor: "#C84B31",
        "night-card": "#241846",
        "night-border": "#3A296D",
        "paper-base": "var(--color-paper-base)",
        "paper-text": "var(--color-paper-text)",
        "paper-muted": "var(--color-paper-muted)",
        "paper-border": "var(--color-paper-border)",
        "paper-accent": "var(--color-paper-accent)",
      },
      fontFamily: {
        retelling: ["Cormorant Garamond", "EB Garamond", "Georgia", "serif"],
        ui: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        sanskrit: ["Noto Serif Devanagari", "serif"],
      },
      maxWidth: {
        reading: "68ch",
      },
      transitionTimingFunction: {
        sacred: "cubic-bezier(0.22, 1, 0.36, 1)",
        breath: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      animation: {
        "fog-drift": "fogDrift 20s ease-in-out infinite alternate",
        "diya-flicker": "diyaFlicker 3s ease-in-out infinite",
        "halo-breathe": "haloBreathe 8s ease-in-out infinite",
        "ink-diffuse": "inkDiffuse 1.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
      keyframes: {
        fogDrift: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.4" },
          "100%": { transform: "translateY(-15px) scale(1.05)", opacity: "0.7" },
        },
        diyaFlicker: {
          "0%, 100%": { transform: "scale(1)", filter: "drop-shadow(0 0 8px rgba(184, 150, 62, 0.6))" },
          "50%": { transform: "scale(1.12) translateY(-1px)", filter: "drop-shadow(0 0 16px rgba(246, 211, 101, 0.9))" },
        },
        haloBreathe: {
          "0%, 100%": { transform: "scale(0.98)", opacity: "0.85" },
          "50%": { transform: "scale(1.04)", opacity: "1" },
        },
        inkDiffuse: {
          "0%": { opacity: "0", filter: "blur(8px)", transform: "scale(0.97)" },
          "100%": { opacity: "1", filter: "blur(0)", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
