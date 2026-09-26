import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { MotionConfig, useReducedMotion } from "motion/react";
import { useAlpha } from "./context";
import { isNativeApp } from "../lib/platform";
import type { Language, Localized } from "../data/lessons";

export const tactileSpring = {
  type: "spring" as const,
  stiffness: 240,
  damping: 25,
  mass: 0.85,
};
export const glideSpring = {
  type: "spring" as const,
  stiffness: 150,
  damping: 28,
  mass: 1.1,
};
const MotionContext = createContext({ reduced: true, active: true });
export function MotionSystem({ children }: { children: ReactNode }) {
  const { prefs } = useAlpha();
  const systemReduced = useReducedMotion();
  const [active, setActive] = useState(!document.hidden);
  useEffect(() => {
    const change = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", change);
    return () => document.removeEventListener("visibilitychange", change);
  }, []);
  const reduced = prefs.reduced || Boolean(systemReduced);
  return (
    <MotionContext.Provider value={{ reduced, active }}>
      <MotionConfig
        reducedMotion={reduced ? "always" : "user"}
        transition={tactileSpring}
      >
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
}
export const useMotionSettings = () => useContext(MotionContext);
export async function touchFeedback(reduced: boolean) {
  if (reduced || !isNativeApp) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Haptics is optional: unsupported hardware never blocks the reading link.
  }
}
export function LivingEnvironment() {
  const { reduced, active } = useMotionSettings();
  return (
    <div
      className="living-environment"
      aria-hidden="true"
      data-still={reduced || !active}
    >
      <div className="living-mesh living-mesh-amber" />
      <div className="living-mesh living-mesh-teal" />
      <div className="living-mesh living-mesh-violet" />
      <div className="living-grain" />
    </div>
  );
}
/** Render only the selected language so Hindi and English reflow naturally. */
export function BilingualText({
  text,
  language,
}: {
  text: Localized;
  language: Language;
}) {
  return <span lang={language}>{text[language]}</span>;
}
