"use client";

import React, { useEffect } from "react";
import { SoundProvider } from "./SoundContext";
import { MotionConfigProvider } from "./MotionConfigContext";
import { ReadingPreferencesProvider } from "./ReadingPreferencesContext";
import Lenis from "lenis";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.8,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <MotionConfigProvider>
      <SoundProvider>
        <ReadingPreferencesProvider>
          {children}
        </ReadingPreferencesProvider>
      </SoundProvider>
    </MotionConfigProvider>
  );
}
