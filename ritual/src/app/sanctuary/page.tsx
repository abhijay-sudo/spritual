"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BreathOrb } from "@/components/motion/BreathOrb";
import { JapaOverlay } from "@/components/motion/JapaOverlay";
import { useSound } from "@/context/SoundContext";
import { Volume2, VolumeX, Sparkles, X, Compass, RefreshCw } from "lucide-react";

export default function SanctuaryPage() {
  const { soundEnabled, toggleSound, isTanpuraPlaying, playTanpura, playTempleBell } = useSound();
  const [japaActive, setJapaActive] = useState(false);
  const [malaSize, setMalaSize] = useState<27 | 54 | 108>(27);
  const [breathPattern, setBreathPattern] = useState<"4-2-6" | "4-7-8">("4-2-6");

  const toggleDrone = () => {
    if (!soundEnabled) {
      toggleSound();
    }
    playTanpura(!isTanpuraPlaying);
  };

  return (
    <div className="relative w-full min-h-[92vh] flex flex-col items-center justify-between p-6 md:p-12 bg-deep-indigo text-vellum select-none overflow-hidden">
      {/* Low-contrast Top Exit and Ambient Audio Controls */}
      <div className="w-full max-w-5xl flex items-center justify-between z-20">
        <Link
          href="/"
          className="text-xs text-vellum/50 hover:text-vellum transition-colors flex items-center gap-1.5"
          aria-label="Exit Sanctuary"
        >
          <X className="w-4 h-4" />
          <span>Exit to Folio</span>
        </Link>

        {/* Tanpura Drone Toggle */}
        <button
          onClick={toggleDrone}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs tracking-wider uppercase transition-all ${
            isTanpuraPlaying
              ? "bg-gold-leaf text-ink-black border-gold-leaf font-semibold shadow-md"
              : "border-vellum/20 text-vellum/60 hover:text-vellum hover:border-gold-leaf/40"
          }`}
        >
          {isTanpuraPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{isTanpuraPlaying ? "Tanpura Drone (432Hz)" : "Enable Tanpura"}</span>
        </button>
      </div>

      {/* Main Sanctuary Breath Core */}
      <div className="flex flex-col items-center justify-center my-auto z-10 w-full max-w-xl text-center">
        <div className="mb-6">
          <span className="text-[11px] uppercase tracking-widest text-gold-leaf font-bold">
            The Inner Temple · Zero Streaks · Zero Badges
          </span>
          <h1 className="font-retelling text-3xl md:text-5xl font-medium mt-1">
            Stillness of the Breath
          </h1>
          <p className="text-xs text-vellum/60 mt-1 max-w-sm mx-auto">
            Synchronize your consciousness with the ancient Vedic prana rhythm.
          </p>
        </div>

        {/* Breath Orb */}
        <BreathOrb
          pattern={breathPattern}
          targetCycles={3}
          onCompleteCycles={() => playTempleBell(528)}
        />

        {/* Practice Mode Selectors */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            onClick={() => {
              setBreathPattern(breathPattern === "4-2-6" ? "4-7-8" : "4-2-6");
              playTempleBell(432);
            }}
            className="px-4 py-2 rounded-full border border-vellum/20 text-vellum/80 text-xs hover:border-gold-leaf hover:text-vellum transition-all"
          >
            Pattern: {breathPattern} (Tap to swap)
          </button>

          <button
            onClick={() => {
              setJapaActive(true);
              playTempleBell(432);
            }}
            className="px-5 py-2 rounded-full bg-gold-leaf text-ink-black text-xs font-semibold hover:opacity-90 shadow-md transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Turn {malaSize} Beads</span>
          </button>
        </div>
      </div>

      {/* Subtle Mala Size Selector at Bottom */}
      <div className="w-full max-w-md flex items-center justify-center gap-2 pt-6 border-t border-vellum/10 z-20 text-xs text-vellum/50">
        <span>Mala Beads:</span>
        {([27, 54, 108] as const).map((count) => (
          <button
            key={count}
            onClick={() => setMalaSize(count)}
            className={`px-2.5 py-1 rounded font-mono transition-colors ${
              malaSize === count ? "text-gold-leaf font-bold underline" : "hover:text-vellum"
            }`}
          >
            {count}
          </button>
        ))}
      </div>

      {/* Japa Overlay */}
      {japaActive && (
        <JapaOverlay
          totalBeads={malaSize}
          mantra="ॐ सोऽहम्"
          mantraIAST="oṁ so'ham (I am That)"
          promptText="Breath is the mantra. Turn each bead as you release the world."
          onComplete={() => setJapaActive(false)}
          onClose={() => setJapaActive(false)}
        />
      )}
    </div>
  );
}
