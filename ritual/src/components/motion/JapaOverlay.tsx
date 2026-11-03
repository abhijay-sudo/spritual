"use client";

import React, { useState } from "react";
import { useSound } from "@/context/SoundContext";
import { X, CheckCircle2 } from "lucide-react";

interface JapaOverlayProps {
  totalBeads?: number; // 27, 54, 108
  mantra: string;
  mantraIAST?: string;
  promptText?: string;
  onComplete: () => void;
  onClose: () => void;
}

export function JapaOverlay({
  totalBeads = 27,
  mantra,
  mantraIAST,
  promptText = "Repeat the sacred name before you turn the page.",
  onComplete,
  onClose,
}: JapaOverlayProps) {
  const [currentCount, setCurrentCount] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const { playTempleBell } = useSound();

  const handleBeadClick = () => {
    if (isDone) return;

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(18);
      } catch {}
    }

    const next = currentCount + 1;
    setCurrentCount(next);

    if (next % 9 === 0) {
      playTempleBell(432);
    }

    if (next >= totalBeads) {
      setIsDone(true);
      playTempleBell(528);
      setTimeout(() => {
        onComplete();
      }, 1400);
    }
  };

  const progressPercent = Math.min(100, Math.round((currentCount / totalBeads) * 100));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Japa Mala Contemplative Practice"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/70 backdrop-blur-md transition-opacity duration-500"
    >
      <div className="relative w-full max-w-lg p-8 rounded-2xl bg-paper-base border border-paper-border shadow-2xl text-center select-none">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-paper-muted hover:text-paper-text transition-colors rounded-full"
          aria-label="Close Japa Practice"
        >
          <X className="w-5 h-5" />
        </button>

        <p className="text-xs uppercase tracking-widest text-gold-leaf font-medium mb-2">
          Pause & Practise · {totalBeads} Japa Mala
        </p>
        <h3 className="font-retelling text-2xl text-paper-text mb-2">{promptText}</h3>

        {/* Sacred Mantra Presentation */}
        <div className="my-6 p-6 rounded-xl bg-parchment-warm/60 border border-gold-leaf/25">
          <p className="font-sanskrit text-2xl text-paper-text tracking-wide mb-1 leading-relaxed">
            {mantra}
          </p>
          {mantraIAST && (
            <p className="text-sm font-retelling italic text-paper-muted">{mantraIAST}</p>
          )}
        </div>

        {/* Mala Bead Visual Counter */}
        <div className="relative flex flex-col items-center justify-center my-6">
          <button
            onClick={handleBeadClick}
            disabled={isDone}
            aria-label={`Advance bead. Currently at ${currentCount} of ${totalBeads}`}
            className="group relative w-32 h-32 rounded-full border-2 border-dashed border-gold-leaf/50 flex flex-col items-center justify-center hover:border-gold-leaf active:scale-95 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-gold-leaf"
          >
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gold-leaf/20 to-parchment-deep/40 group-hover:scale-105 transition-transform" />
            <span className="relative font-retelling text-3xl font-semibold text-paper-text">
              {currentCount}
            </span>
            <span className="relative text-[11px] uppercase tracking-wider text-paper-muted">
              of {totalBeads} beads
            </span>
          </button>
          <p className="text-xs text-paper-muted mt-3">
            {isDone ? "Round complete. Your margin has been sealed." : "Tap anywhere on the bead to turn"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-paper-border/40 h-1.5 rounded-full overflow-hidden my-4">
          <div
            className="bg-gold-leaf h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {isDone && (
          <div className="flex items-center justify-center gap-2 text-sm text-gold-leaf mt-2 animate-fade-in font-retelling">
            <CheckCircle2 className="w-4 h-4" />
            <span>Sacred imprint sealed in the folio margin.</span>
          </div>
        )}
      </div>
    </div>
  );
};
