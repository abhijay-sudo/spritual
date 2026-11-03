"use client";

import React, { useState } from "react";
import { useSound } from "@/context/SoundContext";
import { Lock, Share2, Users, Check, Sparkles } from "lucide-react";

interface ReflectionInkProps {
  storyTitle: string;
  citationRef: string;
  sourceText?: string;
  onPostToSangha?: (text: string) => void;
}

export function ReflectionInk({
  storyTitle,
  citationRef,
  sourceText = "What truth does this chapter illuminate within your own duty today?",
  onPostToSangha,
}: ReflectionInkProps) {
  const [reflection, setReflection] = useState("");
  const [savedStatus, setSavedStatus] = useState<"idle" | "private" | "card" | "sangha">("idle");
  const { playInkBrush, playTempleBell } = useSound();

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReflection(e.target.value);
    if (e.target.value.length % 15 === 0) {
      playInkBrush();
    }
  };

  const handleSavePrivate = () => {
    if (!reflection.trim()) return;
    const key = `spritual_reflection_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify({ storyTitle, reflection, date: new Date().toISOString() }));
    setSavedStatus("private");
    playTempleBell(432);
  };

  const handleCreateCard = () => {
    if (!reflection.trim()) return;
    setSavedStatus("card");
    playTempleBell(528);
  };

  const handleSanghaPost = () => {
    if (!reflection.trim()) return;
    if (onPostToSangha) onPostToSangha(reflection);
    setSavedStatus("sangha");
    playTempleBell(480);
  };

  return (
    <div className="relative my-12 p-8 md:p-12 rounded-2xl bg-vellum text-ink-black border border-gold-leaf/30 shadow-xl max-w-2xl mx-auto">
      {/* Decorative Palm-leaf corner stamp */}
      <div className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-gold-leaf font-semibold flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" />
        <span>End of Story Reflection</span>
      </div>

      <div className="text-center mt-4 mb-6">
        <h3 className="font-retelling text-2xl md:text-3xl font-medium text-ink-black mb-2">
          {sourceText}
        </h3>
        <p className="text-xs text-paper-muted">
          Anchor your thoughts upon the folio. Your reflection remains in your hands.
        </p>
      </div>

      {/* Hand-lettered Ink Input */}
      <div className="relative my-6">
        <textarea
          rows={3}
          value={reflection}
          onChange={handleInput}
          placeholder="Penned in ink upon parchment..."
          className="w-full p-4 rounded-xl bg-parchment-warm/70 border border-gold-leaf/25 text-ink-black font-retelling text-lg md:text-xl placeholder:text-paper-muted/50 focus:outline-none focus:ring-2 focus:ring-gold-leaf/50 resize-none leading-relaxed"
        />
      </div>

      {/* Action Options */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gold-leaf/20">
        <div className="flex flex-wrap items-center gap-2">
          {/* Private save */}
          <button
            onClick={handleSavePrivate}
            disabled={!reflection.trim()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-parchment-deep/60 hover:bg-parchment-deep text-ink-black text-xs font-medium transition-colors disabled:opacity-40"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Keep Private</span>
          </button>

          {/* Reflection Card */}
          <button
            onClick={handleCreateCard}
            disabled={!reflection.trim()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gold-leaf/15 hover:bg-gold-leaf/25 text-gold-leaf text-xs font-semibold transition-colors disabled:opacity-40"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Reflection Card</span>
          </button>

          {/* Sangha Circle */}
          <button
            onClick={handleSanghaPost}
            disabled={!reflection.trim()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-terracotta/15 hover:bg-terracotta/25 text-terracotta text-xs font-semibold transition-colors disabled:opacity-40"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Share to Sangha</span>
          </button>
        </div>

        {savedStatus !== "idle" && (
          <span className="text-xs text-gold-leaf font-medium flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            {savedStatus === "private" && "Preserved in private journal"}
            {savedStatus === "card" && "Provenance card ready"}
            {savedStatus === "sangha" && "Placed in circle folio"}
          </span>
        )}
      </div>

      {/* Generated Reflection Card Preview (if chosen) */}
      {savedStatus === "card" && (
        <div className="mt-8 p-6 rounded-xl bg-ink-black text-vellum border border-gold-leaf shadow-2xl animate-fade-in text-left">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-gold-leaf border-b border-gold-leaf/30 pb-2 mb-4">
            <span>Spritual Provenance Seal</span>
            <span>{citationRef}</span>
          </div>

          <p className="font-retelling italic text-xl md:text-2xl text-vellum leading-relaxed mb-4">
            “{reflection}”
          </p>

          <div className="flex items-center justify-between text-xs text-vellum/70 pt-2 border-t border-vellum/20">
            <span>Reflected upon {storyTitle}</span>
            <span className="font-serif">spritual.co.in</span>
          </div>
        </div>
      )}
    </div>
  );
};
