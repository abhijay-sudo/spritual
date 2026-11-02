"use client";

import React, { useState } from "react";
import { ScholarlyCitation } from "@/lib/data/citations";
import { Pin, X, BookOpen } from "lucide-react";
import { useMotionConfig } from "@/context/MotionConfigContext";

interface MarginaliaCardProps {
  citation: ScholarlyCitation;
  sideNote?: string;
  isPinnedInitially?: boolean;
}

export function MarginaliaCard({
  citation,
  sideNote,
  isPinnedInitially = false,
}: MarginaliaCardProps) {
  const [isOpen, setIsOpen] = useState(isPinnedInitially);
  const [isPinned, setIsPinned] = useState(isPinnedInitially);
  const { shouldAnimate } = useMotionConfig();

  const toggleOpen = () => {
    if (isPinned) {
      setIsPinned(false);
      setIsOpen(false);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinned(!isPinned);
  };

  return (
    <div className="relative inline-block align-middle my-1">
      {/* Gold-leaf trigger bead in margin */}
      <button
        onClick={toggleOpen}
        onMouseEnter={() => {
          if (!isPinned && shouldAnimate("minimal")) setIsOpen(true);
        }}
        aria-expanded={isOpen}
        aria-label={`Scholarly marginalia citation for ${citation.source} ${citation.verseRef}`}
        className="group relative inline-flex items-center justify-center w-6 h-6 rounded-full border border-gold-leaf/60 bg-paper-base hover:bg-gold-leaf/20 text-gold-leaf transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-leaf"
      >
        <span className="w-2 h-2 rounded-full bg-gold-leaf group-hover:scale-125 transition-transform" />
      </button>

      {/* Desktop Floating/Unfolding Parchment Card */}
      {isOpen && (
        <div
          role="region"
          aria-label={`Marginalia details: ${citation.source}`}
          className={`z-30 p-5 rounded-xl bg-parchment-warm/95 text-ink-black border border-gold-leaf/40 shadow-xl backdrop-blur-md transition-all duration-500 text-left
            md:absolute md:left-8 md:top-0 md:w-80 lg:w-96
            max-md:fixed max-md:inset-x-4 max-md:bottom-6 max-md:top-auto max-md:z-50
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-gold-leaf/20 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gold-leaf tracking-wider uppercase">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{citation.source} · {citation.verseRef}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={togglePin}
                title={isPinned ? "Unpin note" : "Pin note to margin"}
                className={`p-1 rounded hover:bg-gold-leaf/20 transition-colors ${
                  isPinned ? "text-gold-leaf" : "text-paper-muted"
                }`}
                aria-pressed={isPinned}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setIsPinned(false);
                  setIsOpen(false);
                }}
                className="p-1 rounded text-paper-muted hover:text-paper-text hover:bg-gold-leaf/20 transition-colors"
                aria-label="Close note"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sanskrit Root Shloka */}
          <div className="p-3 rounded-lg bg-parchment-deep/50 border border-gold-leaf/20 mb-3">
            <p className="font-sanskrit text-sm font-medium text-ink-black whitespace-pre-line leading-relaxed">
              {citation.shlokaDevanagari}
            </p>
            <p className="font-retelling italic text-xs text-paper-muted mt-1 whitespace-pre-line">
              {citation.shlokaIAST}
            </p>
          </div>

          {/* Sandhi Breakdown */}
          {citation.wordByWord && citation.wordByWord.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-wider text-paper-muted font-bold mb-1">
                Sandhi & Etymological Root
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {citation.wordByWord.map((w, idx) => (
                  <span
                    key={idx}
                    className="inline-flex flex-col px-2 py-0.5 rounded bg-vellum/90 border border-gold-leaf/15 text-[11px]"
                  >
                    <strong className="font-sanskrit text-ink-black">{w.root}</strong>
                    <span className="text-[10px] text-paper-muted leading-tight">{w.meaning}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Translation */}
          <blockquote className="font-retelling text-sm italic text-ink-black border-l-2 border-gold-leaf pl-2.5 my-2">
            “{citation.translation}”
          </blockquote>

          {/* Commentary & Side Note */}
          <p className="text-xs text-paper-muted mt-2 leading-relaxed">
            {citation.commentary}
          </p>

          {sideNote && (
            <div className="mt-2 pt-2 border-t border-gold-leaf/15 text-xs text-terracotta italic">
              Editorial Note: {sideNote}
            </div>
          )}

          {/* Provenance */}
          <div className="mt-3 text-[10px] text-paper-muted/80 tracking-wide border-t border-gold-leaf/10 pt-1.5">
            Provenance: {citation.provenance}
          </div>
        </div>
      )}
    </div>
  );
};
