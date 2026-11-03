"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useMotionConfig } from "@/context/MotionConfigContext";
import { useSound } from "@/context/SoundContext";
import { InkRipple } from "@/components/motion/InkRipple";
import { BreathOrb } from "@/components/motion/BreathOrb";
import { JapaOverlay } from "@/components/motion/JapaOverlay";
import { ConstellationNode } from "@/components/motion/ConstellationNode";
import { sanghaCirclesData } from "@/lib/data/circles";
import { Compass, BookOpen, Feather, Sparkles, Volume2, ArrowRight, ShieldCheck } from "lucide-react";

interface IntentRecommendation {
  storySlug: string;
  storyTitle: string;
  epic: string;
  rationale: string;
  prologueSanskrit: string;
  url: string;
}

const intentMap: Record<string, IntentRecommendation> = {
  duty: {
    storySlug: "valmikis-question",
    storyTitle: "Valmiki's Question: The Living Exemplar",
    epic: "Valmiki Ramayana · Bala Kanda",
    rationale: "When duty asks you to bear isolation without bitterness, explore the moment an epic awakened to answer what makes a soul truly noble.",
    prologueSanskrit: "तपःस्वाध्यायनिरतं तपस्वी वाग्विदां वरम् ॥",
    url: "/collections/ramayana/books/bala-kanda/arcs/origin/stories/valmikis-question",
  },
  separation: {
    storySlug: "the-ashoka-grove",
    storyTitle: "Sita's Vigil: The Unbroken Dignity",
    epic: "Valmiki Ramayana · Sundara Kanda",
    rationale: "When love is severed by distance and cruelty, discover how silent presence preserves an inviolate sanctuary that no empire can conquer.",
    prologueSanskrit: "इयं सीता मम सुता सहधर्मचरी तव ॥",
    url: "/collections/ramayana/books/bala-kanda/arcs/origin/stories/valmikis-question",
  },
  courage: {
    storySlug: "the-field-of-dharma",
    storyTitle: "The Chariot on Kurukshetra: Freedom from Outcome",
    epic: "Vyasa Mahabharata · Bhishma Parva",
    rationale: "When fear paralyzes your hands before battle, receive Krishna's counsel on acting with full courage while releasing all ownership of results.",
    prologueSanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ॥",
    url: "/collections/ramayana/books/bala-kanda/arcs/origin/stories/valmikis-question",
  },
};

export default function HomePage() {
  const { shouldAnimate } = useMotionConfig();
  const { playTempleBell, soundEnabled } = useSound();

  // 3D Folio Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement | null>(null);

  // Intent Portal State
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);

  // Practice Weave Modal
  const [practiceOpen, setPracticeOpen] = useState(false);

  // Mouse Move Tilt Listener (max 4° constraint)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldAnimate("full") || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -yRatio * 4,
      y: xRatio * 4,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const chooseIntent = (key: string) => {
    setSelectedIntent(key);
    playTempleBell(480);
  };

  return (
    <div className="flex flex-col w-full">
      {/* --------------------------------------------------------------------- */}
      {/* 1. HERO: "THE BREATHING FOLIO"                                        */}
      {/* --------------------------------------------------------------------- */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 md:px-8 py-16 overflow-hidden perspective-[1200px]"
        aria-label="The Breathing Folio Hero"
      >
        {/* Soft Ambient Fog Caustics */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-radial-gradient from-gold-leaf/20 via-transparent to-transparent animate-fog-drift" />

        {/* 3D Tilting Manuscript Surface */}
        <div
          className="relative w-full max-w-4xl p-8 md:p-16 rounded-3xl bg-vellum/90 text-ink-black border border-gold-leaf/35 shadow-2xl backdrop-blur-sm transition-transform ease-sacred duration-700"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Subtle Palm-leaf Header Seal */}
          <div className="flex items-center justify-between pb-4 border-b border-gold-leaf/20 mb-8 text-[11px] uppercase tracking-widest text-gold-leaf font-semibold">
            <span>Folio No. 01 · Rigorous Provenance</span>
            <span className="font-sanskrit text-sm">नमो रामाय</span>
            <span>Uninterrupted by Algorithms</span>
          </div>

          {/* Hero Single Story Inscription Line */}
          <div className="text-center my-6">
            <p className="font-sanskrit text-lg md:text-xl text-paper-muted mb-2 tracking-wide">
              को न्वस्मिन् साम्प्रतं लोके गुणवान् कश्च वीर्यवान् ॥
            </p>
            <p className="font-retelling italic text-sm text-paper-muted/80">
              “Who in this living world embodies nobility, grateful memory, and courage?”
            </p>
          </div>

          <div className="gold-hairline w-40 mx-auto my-8" />

          {/* Main Ink-Diffusion Headline & Subhead */}
          <div className="text-center animate-ink-diffuse">
            <h1 className="font-retelling text-4xl md:text-6xl text-ink-black font-semibold leading-[1.15] tracking-tight max-w-2xl mx-auto">
              Step inside the stories that shaped a civilisation.
            </h1>
            <p className="mt-6 text-base md:text-lg text-paper-muted max-w-xl mx-auto font-normal leading-relaxed">
              A living manuscript, paced by breath. No feeds. No ads. No noise.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <InkRipple>
              <a
                href="#intent-portal"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gold-leaf text-ink-black font-semibold text-sm tracking-wide shadow-md hover:opacity-90 transition-opacity"
              >
                <span>Find a story for this moment</span>
                <Compass className="w-4 h-4" />
              </a>
            </InkRipple>

            <Link
              href="/collections/ramayana/books/bala-kanda/arcs/origin/stories/valmikis-question"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-gold-leaf/50 text-paper-text font-medium text-sm tracking-wide hover:border-gold-leaf hover:bg-gold-leaf/10 transition-colors"
            >
              <span>Continue your folio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 3-Panel Below Hero Pillar Scroll Reveal */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 z-10">
          <div className="p-6 rounded-2xl bg-paper-base/70 border border-paper-border/60 text-center">
            <Feather className="w-6 h-6 text-gold-leaf mx-auto mb-3" />
            <h3 className="font-retelling text-xl text-paper-text font-semibold mb-1">
              Read Slowly
            </h3>
            <p className="text-xs text-paper-muted leading-relaxed">
              Breath-paced scene thresholds eliminate scroll-induced anxiety and restore contemplative patience.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-paper-base/70 border border-paper-border/60 text-center">
            <BookOpen className="w-6 h-6 text-gold-leaf mx-auto mb-3" />
            <h3 className="font-retelling text-xl text-paper-text font-semibold mb-1">
              See the Source
            </h3>
            <p className="text-xs text-paper-muted leading-relaxed">
              Every narrative scene anchors to critical editions (BORI, Baroda) with Sanskrit marginalia you can verify.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-paper-base/70 border border-paper-border/60 text-center">
            <Sparkles className="w-6 h-6 text-gold-leaf mx-auto mb-3" />
            <h3 className="font-retelling text-xl text-paper-text font-semibold mb-1">
              Practise Inside
            </h3>
            <p className="text-xs text-paper-muted leading-relaxed">
              Turn 108 tactile japa mala beads and harmonize with 4-2-6 pranayama without ever leaving the story.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 2. INTENT PORTAL                                                      */}
      {/* --------------------------------------------------------------------- */}
      <section
        id="intent-portal"
        className="w-full max-w-5xl mx-auto px-4 md:px-8 py-20"
        aria-label="Story Recommendation Intent Portal"
      >
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-gold-leaf font-semibold mb-2">
            The Living Compass
          </p>
          <h2 className="font-retelling text-3xl md:text-5xl text-paper-text font-medium">
            Where does your mind sit right now?
          </h2>
          <p className="text-sm text-paper-muted mt-2">
            Select the inner inquiry that echoes your present circumstance.
          </p>
        </div>

        {/* Tactile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: "duty", label: "I am facing a difficult duty", glyph: "⚖️" },
            { id: "separation", label: "I feel separated from someone I love", glyph: "🕊️" },
            { id: "courage", label: "I need courage I do not have", glyph: "🛡️" },
          ].map((intent) => (
            <button
              key={intent.id}
              onClick={() => chooseIntent(intent.id)}
              className={`p-8 rounded-2xl text-left border transition-all duration-300 relative overflow-hidden group select-none ${
                selectedIntent === intent.id
                  ? "bg-vellum text-ink-black border-gold-leaf shadow-xl scale-[1.02]"
                  : "bg-paper-base/80 text-paper-text border-paper-border hover:border-gold-leaf/60"
              }`}
            >
              <span className="text-2xl mb-4 block" aria-hidden="true">
                {intent.glyph}
              </span>
              <h3 className="font-retelling text-xl font-semibold leading-snug">
                “{intent.label}”
              </h3>
              <p className="text-xs text-paper-muted mt-3">
                Tap to complete the contemplative recommendation.
              </p>
            </button>
          ))}
        </div>

        {/* Animated Recommendation Drawer */}
        {selectedIntent && (
          <div className="mt-10 p-8 rounded-2xl bg-vellum text-ink-black border border-gold-leaf/50 shadow-2xl animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-gold-leaf font-bold">
                  Recommended For This Hour · {intentMap[selectedIntent].epic}
                </span>
                <h4 className="font-retelling text-3xl font-semibold text-ink-black mt-1 mb-2">
                  {intentMap[selectedIntent].storyTitle}
                </h4>
                <p className="font-retelling italic text-sm text-paper-muted max-w-xl">
                  {intentMap[selectedIntent].rationale}
                </p>
                <p className="font-sanskrit text-sm text-ink-black font-medium mt-3">
                  {intentMap[selectedIntent].prologueSanskrit}
                </p>
              </div>

              <div className="flex flex-col gap-3 flex-shrink-0">
                <Link
                  href={intentMap[selectedIntent].url}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gold-leaf text-ink-black font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <span>Enter This Story</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {soundEnabled && (
                  <span className="text-[11px] text-paper-muted text-center flex items-center justify-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-gold-leaf" />
                    20s Audio Prologue Ready
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 3. CHARACTER CONSTELLATION                                            */}
      {/* --------------------------------------------------------------------- */}
      <section className="w-full max-w-6xl mx-auto px-4 md:px-8 py-16" aria-label="Dharma Constellation">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-gold-leaf font-semibold mb-2">
            The Living Archetypes
          </p>
          <h2 className="font-retelling text-3xl md:text-5xl text-paper-text font-medium">
            The Character Constellation
          </h2>
          <p className="text-sm text-paper-muted mt-2">
            Six eternal archetypes bound by cosmic dharma tensions. Explore their stories.
          </p>
        </div>

        <ConstellationNode />
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 4. THE PRACTICE WEAVE                                                 */}
      {/* --------------------------------------------------------------------- */}
      <section className="w-full max-w-4xl mx-auto px-4 md:px-8 py-16 text-center" aria-label="Practice Teaser">
        <div className="p-10 rounded-3xl bg-parchment-warm/60 border border-gold-leaf/30 shadow-lg">
          <p className="text-xs uppercase tracking-widest text-gold-leaf font-semibold mb-2">
            Integrated Japa & Prana
          </p>
          <h2 className="font-retelling text-3xl md:text-4xl text-paper-text font-medium mb-3">
            Reading as a Living Sadhana
          </h2>
          <p className="text-sm text-paper-muted max-w-lg mx-auto mb-8 leading-relaxed">
            Stories are not merely ingested; they are breathed into. Take a 60-second guided pause with our 27-bead tactile counter and pranayama rhythm.
          </p>

          <button
            onClick={() => {
              setPracticeOpen(true);
              playTempleBell(432);
            }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gold-leaf text-ink-black font-semibold text-sm hover:opacity-90 shadow-md transition-all"
          >
            <span>Try a Pause (60s Sequence)</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Guided Practice Modal */}
      {practiceOpen && (
        <JapaOverlay
          totalBeads={27}
          mantra="ॐ नमः शिवाय"
          mantraIAST="oṁ namaḥ śivāya"
          promptText="Take 27 still breaths. Center the mind before returning to the world."
          onComplete={() => setPracticeOpen(false)}
          onClose={() => setPracticeOpen(false)}
        />
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 5. SANGHA CIRCLES                                                     */}
      {/* --------------------------------------------------------------------- */}
      <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-20" aria-label="Sangha Reflective Circles">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold-leaf font-semibold mb-1">
              Intentional, Non-Social Community
            </p>
            <h2 className="font-retelling text-3xl md:text-4xl text-paper-text font-medium">
              Sangha Circles
            </h2>
            <p className="text-xs text-paper-muted mt-1">
              Small (max 20–30), moderated circles. No likes, no follower counts, no algorithmic outrage.
            </p>
          </div>
          <Link
            href="/sangha"
            className="text-xs text-gold-leaf hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Explore all circles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sanghaCirclesData.slice(0, 2).map((circle) => (
            <div
              key={circle.id}
              className="p-8 rounded-2xl bg-paper-base/90 border border-paper-border/70 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-paper-muted mb-3">
                  <span className="font-semibold text-terracotta">{circle.theme}</span>
                  <span>{circle.memberCount} of {circle.maxMembers} members</span>
                </div>
                <h3 className="font-retelling text-2xl text-paper-text font-semibold mb-3">
                  {circle.title}
                </h3>
                <p className="text-xs font-retelling italic text-paper-muted mb-4 border-l-2 border-gold-leaf/40 pl-3">
                  “{circle.currentPrompt}”
                </p>
              </div>

              <div className="pt-4 border-t border-paper-border/40 flex items-center justify-between">
                <span className="text-[11px] text-paper-muted">
                  Guided by {circle.facilitatorAlias}
                </span>
                <Link
                  href={`/sangha`}
                  className="px-4 py-1.5 rounded-full border border-gold-leaf/50 text-gold-leaf text-xs font-semibold hover:bg-gold-leaf/10 transition-colors"
                >
                  Join circle
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
