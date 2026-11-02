"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMotionConfig } from "@/context/MotionConfigContext";
import { useSound } from "@/context/SoundContext";
import { BookOpen, Layers, Sparkles, ArrowRight } from "lucide-react";

interface CollectionItem {
  id: string;
  slug: string;
  title: string;
  titleHindi: string;
  epic: string;
  description: string;
  totalStories: number;
  readStories: number;
  featuredStoryUrl: string;
  spineColor: string;
}

const collectionsList: CollectionItem[] = [
  {
    id: "col-1",
    slug: "ramayana",
    title: "Valmiki Ramayana",
    titleHindi: "वाल्मीकि रामायण",
    epic: "Adi Kavya (The First Song)",
    description: "The ethical trials of Maryada Purushottama Rama and the unbroken dignity of Sita across Ayodhya, Kishkindha, and Lanka.",
    totalStories: 6,
    readStories: 2,
    featuredStoryUrl: "/collections/ramayana/books/bala-kanda/arcs/origin/stories/valmikis-question",
    spineColor: "border-l-gold-leaf",
  },
  {
    id: "col-2",
    slug: "mahabharata",
    title: "Vyasa Mahabharata",
    titleHindi: "व्यास महाभारत",
    epic: "Itihasa of Human Destiny",
    description: "The exhaustive moral battlefield of Kurukshetra exploring righteous duty, sovereign tragedy, and Krishna's peace embassy.",
    totalStories: 8,
    readStories: 3,
    featuredStoryUrl: "/collections/ramayana/books/bala-kanda/arcs/origin/stories/valmikis-question",
    spineColor: "border-l-terracotta",
  },
  {
    id: "col-3",
    slug: "gita",
    title: "Bhagavad Gita",
    titleHindi: "श्रीमद्भगवद्गीता",
    epic: "Yogashastra & The Song Divine",
    description: "The eighteen dialogues spoken between two armies liberating the human heart from grief, doubt, and paralyzing inaction.",
    totalStories: 5,
    readStories: 1,
    featuredStoryUrl: "/collections/ramayana/books/bala-kanda/arcs/origin/stories/valmikis-question",
    spineColor: "border-l-gold-leaf",
  },
  {
    id: "col-4",
    slug: "bhagavata",
    title: "Bhagavata Purana",
    titleHindi: "श्रीमद्भागवत महापुराण",
    epic: "Lila of Cosmic Devotion",
    description: "The pastoral innocence of Vrindavana and the transcendental surrender that transcends mundane ritual.",
    totalStories: 6,
    readStories: 0,
    featuredStoryUrl: "/collections/ramayana/books/bala-kanda/arcs/origin/stories/valmikis-question",
    spineColor: "border-l-deep-indigo",
  },
  {
    id: "col-5",
    slug: "shiva-purana",
    title: "Shiva Purana",
    titleHindi: "शिव महापुराण",
    epic: "The Silent Kailasha",
    description: "The ascetic stillness of Mahadeva, the descent of Ganga, and the drinking of cosmic poison.",
    totalStories: 4,
    readStories: 1,
    featuredStoryUrl: "/collections/ramayana/books/bala-kanda/arcs/origin/stories/valmikis-question",
    spineColor: "border-l-paper-border",
  },
  {
    id: "col-6",
    slug: "devi-mahatmyam",
    title: "Devi Mahatmyam",
    titleHindi: "देवी माहात्म्यम्",
    epic: "Sovereign Primordial Radiance",
    description: "The cosmic descent of Durga to re-establish cosmic balance against the titans of pride and delusion.",
    totalStories: 4,
    readStories: 0,
    featuredStoryUrl: "/collections/ramayana/books/bala-kanda/arcs/origin/stories/valmikis-question",
    spineColor: "border-l-sindoor",
  },
];

export default function CollectionsPage() {
  const { shouldAnimate } = useMotionConfig();
  const { playPageTurn } = useSound();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="w-full min-h-screen bg-paper-base py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-gold-leaf font-bold">
            The Living Archives
          </span>
          <h1 className="font-retelling text-4xl md:text-5xl text-paper-text font-medium mt-1 mb-3">
            The Manuscript Shelf
          </h1>
          <p className="text-xs md:text-sm text-paper-muted leading-relaxed">
            Not an algorithmic grid or endless inventory. Each collection is a hand-bound folio spine holding timeless civilisational memories.
          </p>
        </div>

        {/* The Manuscript Shelf Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collectionsList.map((col) => {
            const isHovered = hoveredId === col.id;
            return (
              <div
                key={col.id}
                onMouseEnter={() => {
                  setHoveredId(col.id);
                  playPageTurn();
                }}
                onMouseLeave={() => setHoveredId(null)}
                className={`p-8 rounded-3xl bg-vellum text-ink-black border border-gold-leaf/30 border-l-[10px] ${col.spineColor} shadow-xl transition-all duration-500 relative flex flex-col justify-between select-none ${
                  isHovered && shouldAnimate("full") ? "rotate-[-1deg] scale-[1.01]" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-gold-leaf font-bold mb-2">
                    <span>{col.epic}</span>
                    <span className="font-mono text-paper-muted">
                      {col.readStories} of {col.totalStories} Read
                    </span>
                  </div>

                  <h2 className="font-retelling text-2xl md:text-3xl font-semibold mb-1">
                    {col.title}
                  </h2>
                  <p className="font-sanskrit text-sm text-paper-muted mb-4">
                    {col.titleHindi}
                  </p>

                  <p className="text-xs text-paper-muted leading-relaxed mb-6">
                    {col.description}
                  </p>

                  {/* Progress Line */}
                  <div className="w-full bg-parchment-deep h-1.5 rounded-full overflow-hidden mb-6">
                    <div
                      className="bg-gold-leaf h-full transition-all duration-500"
                      style={{ width: `${(col.readStories / col.totalStories) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gold-leaf/20 flex items-center justify-between">
                  <span className="text-[11px] text-paper-muted">
                    {col.totalStories} Complete Folio Chapters
                  </span>
                  <Link
                    href={col.featuredStoryUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gold-leaf text-ink-black text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    <span>Open Spine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Paper Fold Load More Trigger (No infinite scroll) */}
        <div className="text-center pt-8">
          <button
            onClick={() => playPageTurn()}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-gold-leaf/60 text-paper-text text-xs uppercase tracking-widest font-semibold hover:bg-gold-leaf/10 transition-colors"
          >
            <span>Turn to Next Shelf (6 Archived Folios)</span>
            <Layers className="w-4 h-4 text-gold-leaf" />
          </button>
        </div>
      </div>
    </div>
  );
}
