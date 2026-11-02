"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { charactersData, CharacterProfile } from "@/lib/data/characters";
import { JapaOverlay } from "@/components/motion/JapaOverlay";
import { BreathOrb } from "@/components/motion/BreathOrb";
import { useSound } from "@/context/SoundContext";
import { ArrowRight, Sparkles, BookOpen, Clock, Layers } from "lucide-react";
import Link from "next/link";

export default function CharacterDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "rama";
  const character: CharacterProfile = charactersData[slug] || charactersData["rama"];

  const { playTempleBell } = useSound();
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [breathOpen, setBreathOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-paper-base py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* 1. HERO SECTION */}
        <section className="text-center p-8 md:p-14 rounded-3xl bg-vellum text-ink-black border border-gold-leaf/35 shadow-2xl">
          <span className="text-xs uppercase tracking-widest text-gold-leaf font-bold">
            Dharma Archetype Sanctuary
          </span>
          <h1 className="font-retelling text-4xl md:text-6xl text-ink-black font-semibold mt-2 mb-1">
            {character.name}
          </h1>
          <p className="font-retelling italic text-sm md:text-base text-paper-muted mb-6">
            {character.epithet}
          </p>

          <div className="p-6 rounded-2xl bg-parchment-warm/70 border border-gold-leaf/30 max-w-xl mx-auto my-6">
            <span className="text-[10px] uppercase tracking-wider text-terracotta font-bold block mb-1">
              Core Existential Tension
            </span>
            <p className="font-retelling text-xl text-ink-black font-medium leading-relaxed">
              {character.coreTension}
            </p>
          </div>

          <div className="my-6 max-w-xl mx-auto">
            <p className="font-sanskrit text-base md:text-lg text-ink-black leading-relaxed whitespace-pre-line">
              {character.sanskritInvocation}
            </p>
            <p className="font-retelling italic text-xs text-paper-muted mt-2">
              “{character.invocationTranslation}”
            </p>
          </div>
        </section>

        {/* 2. DHARMA TENSIONS SECTION */}
        <section className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold-leaf font-semibold">
              Dialectics of Consciousness
            </span>
            <h2 className="font-retelling text-3xl text-paper-text font-medium mt-1">
              The Paired Tensions of {character.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {character.tensions.map((t, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-paper-base/80 border border-paper-border/80 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-terracotta mb-4">
                    <span>{t.poleA}</span>
                    <span className="text-gold-leaf font-mono">VS</span>
                    <span>{t.poleB}</span>
                  </div>
                  <p className="font-retelling text-sm text-paper-text leading-relaxed">
                    {t.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. READ THEIR ARC TIMELINE */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-gold-leaf font-semibold">
                Sequential Folio Timeline
              </span>
              <h2 className="font-retelling text-3xl text-paper-text font-medium mt-1">
                Read {character.name}&apos;s Sacred Arc
              </h2>
            </div>
            <span className="text-xs text-paper-muted">
              {character.arcStories.length} Sequential Chapters
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory">
            {character.arcStories.map((story, idx) => (
              <div
                key={story.slug}
                className="snap-start flex-shrink-0 w-72 p-6 rounded-2xl bg-vellum text-ink-black border border-gold-leaf/30 shadow-md flex flex-col justify-between hover:scale-[1.01] transition-transform"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-gold-leaf mb-2">
                    <span>Act {String(idx + 1).padStart(2, "0")}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {story.estMinutes} min
                    </span>
                  </div>
                  <h3 className="font-retelling text-xl font-semibold mb-2">
                    {story.title}
                  </h3>
                  <p className="text-xs text-paper-muted leading-relaxed mb-4">
                    {story.summary}
                  </p>
                </div>

                <Link
                  href="/collections/ramayana/books/bala-kanda/arcs/origin/stories/valmikis-question"
                  className="inline-flex items-center justify-center gap-2 py-2.5 rounded-full bg-gold-leaf text-ink-black text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <span>Open Folio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 4. PRACTICE FOR THIS CHARACTER */}
        <section className="p-8 md:p-12 rounded-3xl bg-parchment-warm/60 border border-gold-leaf/35 text-center">
          <span className="text-xs uppercase tracking-widest text-gold-leaf font-bold">
            Sadhana Integration
          </span>
          <h2 className="font-retelling text-3xl text-paper-text font-medium mt-1 mb-2">
            Practice for {character.name}
          </h2>
          <p className="text-xs text-paper-muted max-w-md mx-auto mb-6">
            {character.recommendedPractice.purpose}
          </p>

          <div className="p-6 rounded-2xl bg-vellum text-ink-black border border-gold-leaf/25 max-w-md mx-auto mb-8">
            <p className="font-sanskrit text-2xl font-semibold mb-1">
              {character.recommendedPractice.mantra}
            </p>
            <p className="font-retelling italic text-xs text-paper-muted">
              {character.recommendedPractice.mantraIAST} · Breath {character.recommendedPractice.breathPattern}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                setPracticeOpen(true);
                playTempleBell(432);
              }}
              className="px-6 py-3 rounded-full bg-gold-leaf text-ink-black font-semibold text-xs tracking-wider uppercase hover:opacity-90 shadow-md"
            >
              Start 108 Japa Mala
            </button>
            <button
              onClick={() => {
                setBreathOpen(true);
                playTempleBell(528);
              }}
              className="px-6 py-3 rounded-full border border-gold-leaf/60 text-paper-text font-semibold text-xs tracking-wider uppercase hover:bg-gold-leaf/10"
            >
              Pranayama Orb ({character.recommendedPractice.breathPattern})
            </button>
          </div>
        </section>
      </div>

      {practiceOpen && (
        <JapaOverlay
          totalBeads={108}
          mantra={character.recommendedPractice.mantra}
          mantraIAST={character.recommendedPractice.mantraIAST}
          promptText={`108 Japa Mala in honor of ${character.name}`}
          onComplete={() => setPracticeOpen(false)}
          onClose={() => setPracticeOpen(false)}
        />
      )}

      {breathOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/80 backdrop-blur-md"
        >
          <div className="relative p-8 rounded-3xl bg-paper-base border border-gold-leaf shadow-2xl">
            <button
              onClick={() => setBreathOpen(false)}
              className="absolute top-4 right-4 text-xs font-semibold text-paper-muted hover:text-paper-text"
            >
              ✕ Close
            </button>
            <BreathOrb
              pattern={character.recommendedPractice.breathPattern === "4-7-8" ? "4-7-8" : "4-2-6"}
              onCompleteCycles={() => setBreathOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
