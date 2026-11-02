"use client";

import React, { useState } from "react";
import { useReadingPreferences, PaperTone, TextSize, ReadingMode, LanguageChoice } from "@/context/ReadingPreferencesContext";
import { useSound } from "@/context/SoundContext";
import { Flame, Sliders, Volume2, VolumeX, Type, BookOpen, Layers } from "lucide-react";

interface ReadingControlsProps {
  storyTitle: string;
  currentScene: number;
  totalScenes: number;
}

export function ReadingControls({
  storyTitle,
  currentScene,
  totalScenes,
}: ReadingControlsProps) {
  const {
    paperTone,
    setPaperTone,
    textSize,
    setTextSize,
    readingMode,
    setReadingMode,
    language,
    setLanguage,
  } = useReadingPreferences();
  const { soundEnabled, toggleSound } = useSound();
  const [panelOpen, setPanelOpen] = useState(false);

  const flameScale = Math.min(1.4, 0.8 + (currentScene / totalScenes) * 0.5);

  return (
    <div className="sticky top-16 z-20 w-full backdrop-blur-md bg-paper-base/95 border-b border-paper-border/40 py-2.5 px-4 md:px-8 transition-colors select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Story Title & Scene Counter */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-retelling text-base md:text-lg font-semibold text-paper-text truncate">
            {storyTitle}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-paper-border/40 text-[11px] font-mono font-medium text-paper-muted flex-shrink-0">
            {String(currentScene).padStart(2, "0")} / {String(totalScenes).padStart(2, "0")}
          </span>
        </div>

        {/* Center: Diya Progress Flame */}
        <div
          className="flex items-center gap-2"
          title={`Progress: Scene ${currentScene} of ${totalScenes}`}
          aria-label={`Progress: Scene ${currentScene} of ${totalScenes}`}
        >
          <div
            className="diya-flame text-gold-leaf transition-transform duration-500 flex items-center justify-center"
            style={{ transform: `scale(${flameScale})` }}
          >
            <Flame className="w-5 h-5 fill-gold-leaf text-sindoor" />
          </div>
          <span className="text-[11px] uppercase tracking-wider text-paper-muted hidden sm:inline-block">
            {currentScene === totalScenes ? "Steadied" : "Kindling"}
          </span>
        </div>

        {/* Right: Quick Controls Bar */}
        <div className="flex items-center gap-2">
          {/* Quick Language Toggle */}
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : language === "hi" ? "bilingual" : "en")}
            className="px-2.5 py-1 rounded-md text-xs font-semibold border border-paper-border/60 hover:border-gold-leaf text-paper-text transition-colors uppercase"
            aria-label="Toggle language"
          >
            {language}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? "Mute sanctuary sound" : "Enable sanctuary sound"}
            className={`p-1.5 rounded-md border transition-colors ${
              soundEnabled
                ? "bg-gold-leaf/20 border-gold-leaf text-gold-leaf"
                : "border-paper-border/60 text-paper-muted hover:text-paper-text"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Folio Settings Trigger */}
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            aria-expanded={panelOpen}
            aria-label="Open reading appearance controls"
            className="p-1.5 rounded-md border border-paper-border/60 hover:border-gold-leaf text-paper-text transition-colors"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Appearance Drawer */}
      {panelOpen && (
        <div className="mt-3 pt-3 border-t border-paper-border/40 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-xs animate-fade-in">
          {/* Paper Tone Selection */}
          <div>
            <label className="block text-paper-muted uppercase tracking-wider font-semibold mb-1.5">
              Paper Tone
            </label>
            <div className="flex gap-1.5">
              {(["palm-leaf", "vellum", "night", "high-contrast"] as PaperTone[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setPaperTone(t)}
                  className={`px-2.5 py-1 rounded border capitalize transition-all ${
                    paperTone === t
                      ? "bg-gold-leaf text-ink-black border-gold-leaf font-bold"
                      : "border-paper-border text-paper-text hover:border-gold-leaf"
                  }`}
                >
                  {t.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Text Size Selection */}
          <div>
            <label className="block text-paper-muted uppercase tracking-wider font-semibold mb-1.5">
              Type Scale
            </label>
            <div className="flex gap-1.5">
              {(["sm", "base", "lg", "xl"] as TextSize[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setTextSize(s)}
                  className={`px-3 py-1 rounded border uppercase transition-all ${
                    textSize === s
                      ? "bg-gold-leaf text-ink-black border-gold-leaf font-bold"
                      : "border-paper-border text-paper-text hover:border-gold-leaf"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Mode */}
          <div>
            <label className="block text-paper-muted uppercase tracking-wider font-semibold mb-1.5">
              Manuscript Layout
            </label>
            <div className="flex gap-1.5">
              {(["flow", "folio", "bilingual"] as ReadingMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setReadingMode(m)}
                  className={`px-2.5 py-1 rounded border capitalize transition-all ${
                    readingMode === m
                      ? "bg-gold-leaf text-ink-black border-gold-leaf font-bold"
                      : "border-paper-border text-paper-text hover:border-gold-leaf"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
