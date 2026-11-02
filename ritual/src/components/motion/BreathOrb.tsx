"use client";

import React, { useEffect, useState } from "react";
import { useMotionConfig } from "@/context/MotionConfigContext";
import { useSound } from "@/context/SoundContext";

interface BreathOrbProps {
  pattern?: "4-2-6" | "4-7-8";
  onCompleteCycles?: () => void;
  targetCycles?: number;
  className?: string;
}

export function BreathOrb({
  pattern = "4-2-6",
  onCompleteCycles,
  targetCycles = 3,
  className = "",
}: BreathOrbProps) {
  const { shouldAnimate } = useMotionConfig();
  const { playTempleBell } = useSound();

  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [cycleCount, setCycleCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Time durations in milliseconds
  const timings = pattern === "4-2-6" 
    ? { inhale: 4000, hold: 2000, exhale: 6000 }
    : { inhale: 4000, hold: 7000, exhale: 8000 };

  useEffect(() => {
    if (isFinished) return;

    let timer: NodeJS.Timeout;

    if (phase === "inhale") {
      timer = setTimeout(() => {
        setPhase("hold");
      }, timings.inhale);
    } else if (phase === "hold") {
      timer = setTimeout(() => {
        setPhase("exhale");
      }, timings.hold);
    } else if (phase === "exhale") {
      timer = setTimeout(() => {
        const nextCycle = cycleCount + 1;
        setCycleCount(nextCycle);
        if (nextCycle >= targetCycles) {
          setIsFinished(true);
          playTempleBell(528);
          if (onCompleteCycles) onCompleteCycles();
        } else {
          setPhase("inhale");
          playTempleBell(432);
        }
      }, timings.exhale);
    }

    return () => clearTimeout(timer);
  }, [phase, cycleCount, isFinished, timings, targetCycles, onCompleteCycles, playTempleBell]);

  const getScale = () => {
    if (!shouldAnimate("restrained")) return "scale-100";
    if (phase === "inhale") return "scale-125";
    if (phase === "hold") return "scale-125";
    return "scale-90";
  };

  const getTransitionDuration = () => {
    if (!shouldAnimate("restrained")) return "duration-0";
    if (phase === "inhale") return "duration-[4000ms]";
    if (phase === "hold") return "duration-[2000ms]";
    return pattern === "4-2-6" ? "duration-[6000ms]" : "duration-[8000ms]";
  };

  const getPhaseText = () => {
    if (isFinished) return "You are here.";
    if (phase === "inhale") return "Inhale slowly...";
    if (phase === "hold") return "Hold the still point...";
    return "Exhale fully...";
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 select-none ${className}`}>
      {/* Sacred Breath Orb Canvas */}
      <div className="relative flex items-center justify-center w-56 h-56">
        {/* Outer aura glow */}
        <div
          className={`absolute inset-0 rounded-full bg-gold-leaf/10 blur-2xl transition-all ease-breath ${getScale()} ${getTransitionDuration()}`}
        />

        {/* Outer gold hairline ring */}
        <div
          className={`absolute inset-4 rounded-full border border-gold-leaf/30 transition-all ease-breath ${getScale()} ${getTransitionDuration()}`}
        />

        {/* Inner luminous core */}
        <div
          className={`relative w-28 h-28 rounded-full bg-gradient-to-tr from-gold-leaf/40 via-parchment-deep to-gold-leaf/80 shadow-lg shadow-gold-leaf/20 flex items-center justify-center transition-all ease-breath ${getScale()} ${getTransitionDuration()}`}
        >
          <div className="w-4 h-4 rounded-full bg-vellum shadow-sm animate-pulse" />
        </div>
      </div>

      {/* Dynamic guidance caption */}
      <div className="mt-8 text-center" aria-live="polite">
        <p className="font-retelling text-2xl tracking-wide text-paper-text italic transition-all duration-700">
          {getPhaseText()}
        </p>
        <p className="text-xs uppercase tracking-widest text-paper-muted mt-2">
          {isFinished ? "Practice complete" : `Prana rhythm ${pattern} · Cycle ${Math.min(cycleCount + 1, targetCycles)} of ${targetCycles}`}
        </p>
      </div>
    </div>
  );
};
