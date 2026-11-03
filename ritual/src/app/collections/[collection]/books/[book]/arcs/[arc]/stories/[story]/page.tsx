"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { storiesData, StoryDocument, StoryScene } from "@/lib/data/stories";
import { scholarlyCitations } from "@/lib/data/citations";
import { ReadingControls } from "@/components/ui/ReadingControls";
import { FolioTransition } from "@/components/motion/FolioTransition";
import { MarginaliaCard } from "@/components/motion/MarginaliaCard";
import { JapaOverlay } from "@/components/motion/JapaOverlay";
import { ReflectionInk } from "@/components/motion/ReflectionInk";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useSound } from "@/context/SoundContext";
import { CheckCircle, ShieldCheck, ArrowRight, Lock, Phone } from "lucide-react";
import Link from "next/link";

export default function StoryReaderPage() {
  const params = useParams();
  const storySlug = (params?.story as string) || "valmikis-question";

  const story: StoryDocument = storiesData[storySlug] || storiesData["valmikis-question"];
  const { textSize, readingMode, language, isPatron } = useReadingPreferences();
  const { playTempleBell } = useSound();

  // Reading scene tracking
  const [currentSceneIndex, setCurrentSceneIndex] = useState(1);
  const [inThresholdTransition, setInThresholdTransition] = useState(false);
  const [pendingScene, setPendingScene] = useState<StoryScene | null>(null);

  // Completed japa marks in margin
  const [completedJapaScenes, setCompletedJapaScenes] = useState<number[]>([]);
  const [activePractice, setActivePractice] = useState<{
    sceneIndex: number;
    beadsCount: number;
    mantra: string;
    mantraIAST: string;
    promptText: string;
  } | null>(null);

  // Soft login modal after Scene 1
  const [softLoginOpen, setSoftLoginOpen] = useState(false);
  const [softLoginDismissed, setSoftLoginDismissed] = useState(false);

  // Paywall gate after Scene 3
  const [paywallEncountered, setPaywallEncountered] = useState(false);

  const currentScene = story.scenes.find((s) => s.index === currentSceneIndex) || story.scenes[0];

  const handleNextScene = () => {
    // Check if soft login applies after Scene 1
    if (currentSceneIndex === 1 && !softLoginDismissed) {
      setSoftLoginOpen(true);
      return;
    }

    // Check if paywall applies at end of Scene 3 for non-patrons
    if (currentSceneIndex === 3 && !isPatron) {
      setPaywallEncountered(true);
      return;
    }

    if (currentSceneIndex < story.scenes.length) {
      const nextIndex = currentSceneIndex + 1;
      const targetScene = story.scenes.find((s) => s.index === nextIndex);
      if (targetScene) {
        setPendingScene(targetScene);
        setInThresholdTransition(true);
      }
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex > 1) {
      setCurrentSceneIndex(currentSceneIndex - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onThresholdComplete = () => {
    if (pendingScene) {
      setCurrentSceneIndex(pendingScene.index);
      setPendingScene(null);
    }
    setInThresholdTransition(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const completePractice = (sceneIdx: number) => {
    setCompletedJapaScenes((prev) => [...prev, sceneIdx]);
    setActivePractice(null);
    playTempleBell(528);
  };

  const getTextSizeClass = () => {
    switch (textSize) {
      case "sm":
        return "text-base md:text-lg leading-relaxed";
      case "lg":
        return "text-xl md:text-2xl leading-loose";
      case "xl":
        return "text-2xl md:text-3xl leading-loose";
      case "base":
      default:
        return "text-lg md:text-xl leading-relaxed";
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-paper-base transition-colors">
      {/* 1. TOP READING CONTROLS */}
      <ReadingControls
        storyTitle={story.title}
        currentScene={currentSceneIndex}
        totalScenes={story.scenes.length}
      />

      {/* 2. SCENE THRESHOLD TRANSITION */}
      {inThresholdTransition && pendingScene && (
        <FolioTransition
          sceneIndex={pendingScene.index}
          sanskritHeadline={pendingScene.sanskritHeadline}
          sanskritIAST={pendingScene.sanskritIAST}
          title={pendingScene.title}
          onTransitionComplete={onThresholdComplete}
        />
      )}

      {/* 3. FOLIO READING STAGE */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16">
        <article className="relative bg-vellum text-ink-black rounded-3xl p-8 sm:p-12 md:p-16 border border-gold-leaf/35 shadow-2xl transition-all">
          {/* Folio Header Provenance Stamp */}
          <div className="flex items-center justify-between pb-4 border-b border-gold-leaf/20 mb-8 text-[11px] uppercase tracking-widest text-gold-leaf font-semibold">
            <span>{story.collectionTitle} · {story.bookTitle}</span>
            <span>Folio Scene {String(currentScene.index).padStart(2, "0")} / {String(story.scenes.length).padStart(2, "0")}</span>
          </div>

          {/* Scene Sanskrit Headline */}
          <header className="mb-10 text-center">
            <span className="text-xs uppercase tracking-widest text-gold-leaf font-bold">
              {currentScene.titleHindi}
            </span>
            <h1 className="font-retelling text-3xl md:text-5xl text-ink-black font-semibold mt-1 mb-4">
              {currentScene.title}
            </h1>
            <div className="p-4 rounded-xl bg-parchment-warm/70 border border-gold-leaf/30 inline-block max-w-2xl mx-auto">
              <p className="font-sanskrit text-lg md:text-xl text-ink-black font-medium leading-relaxed">
                {currentScene.sanskritHeadline}
              </p>
              {currentScene.sanskritIAST && (
                <p className="font-retelling italic text-xs text-paper-muted mt-1">
                  {currentScene.sanskritIAST}
                </p>
              )}
            </div>
          </header>

          {/* Reading Column with Marginalia Gutter */}
          <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Main Narrative Text */}
            <div className="md:col-span-8 reading-column">
              {/* Bilingual Rendering */}
              {language === "bilingual" ? (
                <div className="space-y-8">
                  {currentScene.textEn.map((paraEn, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-parchment-warm/40 border border-gold-leaf/15"
                    >
                      <p className={`font-retelling ${getTextSizeClass()} text-ink-black`}>
                        {paraEn}
                      </p>
                      <p className="font-sanskrit text-base md:text-lg text-paper-muted mt-3 pt-3 border-t border-gold-leaf/15 leading-relaxed">
                        {currentScene.textHi[idx] || ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : language === "hi" ? (
                <div className="space-y-6">
                  {currentScene.textHi.map((para, idx) => (
                    <p
                      key={idx}
                      className={`font-sanskrit ${getTextSizeClass()} text-ink-black leading-relaxed`}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {currentScene.textEn.map((para, idx) => (
                    <p
                      key={idx}
                      className={`font-retelling ${getTextSizeClass()} text-ink-black leading-relaxed`}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {/* Pause & Practise Checkpoint */}
              {currentScene.practiceTrigger && (
                <div className="my-10 p-6 rounded-2xl bg-parchment-warm/80 border border-gold-leaf/40 text-center">
                  <span className="text-[10px] uppercase tracking-widest text-gold-leaf font-bold">
                    Pause & Practise Inwardly
                  </span>
                  <h3 className="font-retelling text-xl text-ink-black font-semibold mt-1 mb-2">
                    {currentScene.practiceTrigger.promptText}
                  </h3>
                  <button
                    onClick={() => {
                      if (currentScene.practiceTrigger) {
                        setActivePractice({
                          sceneIndex: currentScene.index,
                          beadsCount: currentScene.practiceTrigger.beadsCount,
                          mantra: currentScene.practiceTrigger.mantra,
                          mantraIAST: currentScene.practiceTrigger.mantraIAST,
                          promptText: currentScene.practiceTrigger.promptText,
                        });
                      }
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold-leaf text-ink-black font-semibold text-xs tracking-wider uppercase hover:opacity-90 shadow-md transition-all mt-2"
                  >
                    <span>Turn {currentScene.practiceTrigger.beadsCount} Beads</span>
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Marginalia Column on Desktop */}
            <aside className="md:col-span-4 sticky top-36 space-y-4">
              <div className="text-[10px] uppercase tracking-wider text-gold-leaf font-bold pb-1 border-b border-gold-leaf/20">
                Interactive Provenance (Marginalia)
              </div>

              {currentScene.marginalia.map((m) => {
                const citation = scholarlyCitations[m.citationId] || scholarlyCitations["valmiki-1-1"];
                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-parchment-warm/70 border border-gold-leaf/30 text-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gold-leaf">{citation.source}</span>
                      <MarginaliaCard citation={citation} sideNote={m.sideNote} />
                    </div>
                    <p className="font-retelling italic text-paper-muted">{m.sideNote}</p>
                  </div>
                );
              })}

              {/* Completed Japa Seal in Margin */}
              {completedJapaScenes.includes(currentScene.index) && (
                <div className="p-3 rounded-lg bg-gold-leaf/15 border border-gold-leaf/40 flex items-center gap-2 text-xs text-gold-leaf font-medium">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>Japa practice sealed upon this folio.</span>
                </div>
              )}
            </aside>
          </div>

          {/* Scene Pagination Navigation */}
          <div className="mt-14 pt-8 border-t border-gold-leaf/20 flex items-center justify-between">
            <button
              onClick={handlePrevScene}
              disabled={currentSceneIndex <= 1}
              className="px-5 py-2.5 rounded-full border border-gold-leaf/50 text-ink-black text-xs font-semibold hover:bg-gold-leaf/10 disabled:opacity-30 transition-all"
            >
              ← Previous Folio
            </button>

            <span className="text-xs font-mono text-paper-muted">
              {currentSceneIndex} of {story.scenes.length}
            </span>

            {currentSceneIndex < story.scenes.length ? (
              <button
                onClick={handleNextScene}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gold-leaf text-ink-black text-xs font-semibold hover:opacity-90 shadow-md transition-all"
              >
                <span>Turn Next Folio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-xs font-semibold text-gold-leaf">
                Folio Concluded
              </span>
            )}
          </div>
        </article>

        {/* 4. END-OF-STORY REFLECTION FOLIO (When reaching the final scene) */}
        {currentSceneIndex === story.scenes.length && (
          <ReflectionInk
            storyTitle={story.title}
            citationRef={`${story.bookTitle} · Scene ${currentScene.index}`}
          />
        )}
      </div>

      {/* Japa Mala Overlay Modal */}
      {activePractice && (
        <JapaOverlay
          totalBeads={activePractice.beadsCount}
          mantra={activePractice.mantra}
          mantraIAST={activePractice.mantraIAST}
          promptText={activePractice.promptText}
          onComplete={() => completePractice(activePractice.sceneIndex)}
          onClose={() => setActivePractice(null)}
        />
      )}

      {/* Soft Login Modal after Scene 1 */}
      {softLoginOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/70 backdrop-blur-md"
        >
          <div className="w-full max-w-md p-8 rounded-2xl bg-paper-base border border-gold-leaf text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-gold-leaf/15 border border-gold-leaf/40 flex items-center justify-center mx-auto mb-4 text-gold-leaf">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-retelling text-2xl text-paper-text font-semibold mb-2">
              Save Your Place in the Folio
            </h3>
            <p className="text-xs text-paper-muted mb-6 leading-relaxed">
              Your reading progress and completed japa beads can be quietly synced to your phone number. No passwords, no passwords to reset.
            </p>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 rounded-xl bg-parchment-warm/60 border border-paper-border text-center text-sm font-mono text-paper-text mb-4 focus:outline-none focus:ring-2 focus:ring-gold-leaf"
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setSoftLoginOpen(false);
                  setSoftLoginDismissed(true);
                  handleNextScene();
                }}
                className="w-full py-3 rounded-full bg-gold-leaf text-ink-black font-semibold text-xs tracking-wider uppercase hover:opacity-90 shadow-md"
              >
                Continue & Save Place
              </button>
              <button
                onClick={() => {
                  setSoftLoginOpen(false);
                  setSoftLoginDismissed(true);
                  handleNextScene();
                }}
                className="text-xs text-paper-muted hover:text-paper-text pt-2"
              >
                Read as Guest (Continue without saving)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patronage Paywall Modal after Scene 3 */}
      {paywallEncountered && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/80 backdrop-blur-md"
        >
          <div className="w-full max-w-lg p-8 md:p-10 rounded-3xl bg-vellum text-ink-black border border-gold-leaf text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-gold-leaf/20 border border-gold-leaf flex items-center justify-center mx-auto mb-4 text-gold-leaf">
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-gold-leaf font-bold">
              Patronage, Not a Paywall
            </span>
            <h3 className="font-retelling text-3xl font-semibold mt-1 mb-3">
              Continue This Story with Spritual+
            </h3>
            <p className="text-xs text-paper-muted max-w-md mx-auto mb-6 leading-relaxed">
              You have completed the first three scenes of this sacred folio. To access the concluding chapters, audio prologues, and Sangha circles, support the living manuscript.
            </p>
            <div className="p-4 rounded-xl bg-parchment-warm/60 border border-gold-leaf/25 text-left mb-6">
              <div className="flex items-center justify-between text-xs font-semibold text-ink-black">
                <span>Spritual+ Monthly Patronage</span>
                <span className="text-gold-leaf text-base">₹149 / month</span>
              </div>
              <p className="text-[11px] text-paper-muted mt-1">
                Full access to all 6 collections, bilingual Sanskrit shlokas, and offline prayer beads. Cancel anytime.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/subscribe"
                className="w-full py-3.5 rounded-full bg-gold-leaf text-ink-black font-semibold text-xs tracking-wider uppercase hover:opacity-90 shadow-md text-center"
              >
                Become a Patron (₹149/mo)
              </Link>
              <button
                onClick={() => setPaywallEncountered(false)}
                className="text-xs text-paper-muted hover:text-paper-text"
              >
                Return to previous scene
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
