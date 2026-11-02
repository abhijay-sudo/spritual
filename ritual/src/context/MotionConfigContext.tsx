"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type MotionIntensity = "full" | "restrained" | "minimal";

interface MotionConfigContextType {
  intensity: MotionIntensity;
  setIntensity: (intensity: MotionIntensity) => void;
  prefersReducedMotion: boolean;
  shouldAnimate: (minRequired?: MotionIntensity) => boolean;
  springConfig: { damping: number; stiffness: number };
  sacredDuration: number;
}

const MotionConfigContext = createContext<MotionConfigContextType>({
  intensity: "full",
  setIntensity: () => {},
  prefersReducedMotion: false,
  shouldAnimate: () => true,
  springConfig: { damping: 28, stiffness: 120 },
  sacredDuration: 1.8,
});

export function MotionConfigProvider({ children }: { children: React.ReactNode }) {
  const [intensity, setIntensityState] = useState<MotionIntensity>("full");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    media.addEventListener("change", listener);

    const saved = localStorage.getItem("spritual_motion_intensity") as MotionIntensity | null;
    if (saved && ["full", "restrained", "minimal"].includes(saved)) {
      setIntensityState(saved);
    } else if (media.matches) {
      setIntensityState("minimal");
    }

    return () => media.removeEventListener("change", listener);
  }, []);

  const setIntensity = (val: MotionIntensity) => {
    setIntensityState(val);
    localStorage.setItem("spritual_motion_intensity", val);
  };

  const shouldAnimate = (minRequired: MotionIntensity = "minimal"): boolean => {
    if (prefersReducedMotion) return false;
    if (intensity === "minimal") return minRequired === "minimal";
    if (intensity === "restrained") return minRequired !== "full";
    return true;
  };

  return (
    <MotionConfigContext.Provider
      value={{
        intensity,
        setIntensity,
        prefersReducedMotion,
        shouldAnimate,
        springConfig: { damping: 30, stiffness: 100 },
        sacredDuration: intensity === "full" ? 2.0 : intensity === "restrained" ? 1.0 : 0.01,
      }}
    >
      {children}
    </MotionConfigContext.Provider>
  );
}

export const useMotionConfig = () => useContext(MotionConfigContext);
