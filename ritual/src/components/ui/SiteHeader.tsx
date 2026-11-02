"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSound } from "@/context/SoundContext";
import { useReadingPreferences, PaperTone } from "@/context/ReadingPreferencesContext";
import { Volume2, VolumeX, Sun, Moon, Sliders, Sparkles, BookOpen, Compass, Shield } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  const { soundEnabled, toggleSound } = useSound();
  const { paperTone, setPaperTone, language, setLanguage } = useReadingPreferences();
  const [controlsOpen, setControlsOpen] = useState(false);

  const navLinks = [
    { href: "/collections", label: "Library", icon: BookOpen },
    { href: "/sanctuary", label: "Sanctuary", icon: Compass },
    { href: "/sangha", label: "Sangha", icon: Shield },
    { href: "/subscribe", label: "Patronage", icon: Sparkles },
  ];

  const cycleTone = () => {
    const tones: PaperTone[] = ["palm-leaf", "vellum", "night", "high-contrast"];
    const nextIdx = (tones.indexOf(paperTone) + 1) % tones.length;
    setPaperTone(tones[nextIdx]);
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-paper-base/90 border-b border-paper-border/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-gold-leaf rounded-lg p-1"
        >
          <div className="w-8 h-8 rounded-full border border-gold-leaf/60 flex items-center justify-center bg-gold-leaf/10 group-hover:bg-gold-leaf/20 transition-colors">
            <span className="font-sanskrit text-gold-leaf text-sm font-semibold">ॐ</span>
          </div>
          <div className="flex flex-col">
            <span className="font-retelling text-xl font-semibold tracking-wide text-paper-text leading-none">
              Spritual
            </span>
            <span className="text-[9px] uppercase tracking-widest text-paper-muted mt-0.5">
              The Living Manuscript
            </span>
          </div>
        </Link>

        {/* Primary Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
          {navLinks.map((item) => {
            const isActive = pathname ? pathname.startsWith(item.href) : false;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-full text-xs tracking-wider uppercase font-medium transition-all ${
                  isActive
                    ? "bg-gold-leaf/20 text-gold-leaf border border-gold-leaf/40 font-semibold"
                    : "text-paper-muted hover:text-paper-text hover:bg-paper-border/30"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & Toggles */}
        <div className="flex items-center gap-2">
          {/* Sound Opt-in Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? "Mute sacred sounds" : "Enable sacred acoustic soundscape (opt-in)"}
            title={soundEnabled ? "Sound enabled (432Hz bell & tanpura)" : "Sound muted (click to enable)"}
            className={`p-2 rounded-full border transition-all ${
              soundEnabled
                ? "bg-gold-leaf text-ink-black border-gold-leaf shadow-sm"
                : "border-paper-border/60 text-paper-muted hover:text-paper-text hover:border-gold-leaf"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Paper Tone Quick Switcher */}
          <button
            onClick={cycleTone}
            aria-label={`Current tone: ${paperTone}. Tap to cycle tone.`}
            title={`Paper tone: ${paperTone}`}
            className="p-2 rounded-full border border-paper-border/60 text-paper-muted hover:text-paper-text hover:border-gold-leaf transition-all"
          >
            {paperTone === "night" ? (
              <Moon className="w-4 h-4 text-gold-leaf" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>

          {/* Language Toggle (EN / HI) */}
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : language === "hi" ? "bilingual" : "en")}
            aria-label="Toggle language between English, Hindi, and Bilingual"
            className="px-2.5 py-1 rounded-full border border-paper-border/60 text-xs font-medium text-paper-muted hover:text-paper-text hover:border-gold-leaf transition-all uppercase tracking-wider"
          >
            {language}
          </button>
        </div>
      </div>
    </header>
  );
};
