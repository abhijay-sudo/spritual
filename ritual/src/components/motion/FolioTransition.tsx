"use client";

import React, { useEffect, useState } from "react";
import { useMotionConfig } from "@/context/MotionConfigContext";
import { useSound } from "@/context/SoundContext";

interface FolioTransitionProps {
  sceneIndex: number;
  sanskritHeadline: string;
  sanskritIAST?: string;
  title: string;
  onTransitionComplete: () => void;
}

export function FolioTransition({
  sceneIndex,
  sanskritHeadline,
  sanskritIAST,
  title,
  onTransitionComplete,
}: FolioTransitionProps) {
  const { shouldAnimate, prefersReducedMotion } = useMotionConfig();
  const { playTempleBell } = useSound();
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion || !shouldAnimate("restrained")) {
      // Instant transition
      const t = setTimeout(() => {
        setActive(false);
        onTransitionComplete();
      }, 50);
      return () => clearTimeout(t);
    }

    playTempleBell(432);

    // 2.2s breath-paced sacred threshold transition
    const timer = setTimeout(() => {
      setActive(false);
      onTransitionComplete();
    }, 2200);

    return () => clearTimeout(timer);
  }, [prefersReducedMotion, shouldAnimate, playTempleBell, onTransitionComplete]);

  if (!active) return null;

  return (
    <div
      onClick={() => {
        setActive(false);
        onTransitionComplete();
      }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center p-8 bg-paper-base/95 backdrop-blur-md cursor-pointer select-none transition-all duration-700"
      role="status"
      aria-live="polite"
      aria-label={`Threshold transition into Scene ${sceneIndex}: ${title}. Tap to skip.`}
    >
      {/* Subtle organic fog diffusion layers */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-radial-gradient from-gold-leaf/20 via-transparent to-transparent animate-fog-drift" />

      {/* Threshold Shloka & Headline */}
      <div className="relative text-center max-w-xl mx-auto z-10 animate-ink-diffuse">
        <span className="text-xs uppercase tracking-widest text-gold-leaf font-medium">
          Scene Threshold · {String(sceneIndex).padStart(2, "0")}
        </span>

        <h2 className="font-sanskrit text-2xl md:text-3xl text-paper-text font-normal my-4 leading-relaxed">
          {sanskritHeadline}
        </h2>

        {sanskritIAST && (
          <p className="font-retelling italic text-sm text-paper-muted mb-4">
            {sanskritIAST}
          </p>
        )}

        <div className="gold-hairline w-32 mx-auto my-6" />

        <p className="font-retelling text-xl text-paper-text tracking-wide">
          {title}
        </p>

        <p className="text-[11px] uppercase tracking-widest text-paper-muted/60 mt-8">
          Breathe in stillness · Tap anywhere to enter
        </p>
      </div>
    </div>
  );
};
