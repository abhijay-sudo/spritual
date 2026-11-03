"use client";

import React, { useState } from "react";
import { sanghaCirclesData, SanghaCircle } from "@/lib/data/circles";
import { useSound } from "@/context/SoundContext";
import { Shield, ShieldAlert, Users, MessageSquare, Feather, Flag, VolumeX } from "lucide-react";

export default function SanghaPage() {
  const [selectedCircle, setSelectedCircle] = useState<SanghaCircle>(sanghaCirclesData[0]);
  const [reflectionEditorOpen, setReflectionEditorOpen] = useState(false);
  const [newReflectionText, setNewReflectionText] = useState("");
  const [activeMutedUsers, setActiveMutedUsers] = useState<string[]>([]);
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const { playInkBrush, playTempleBell } = useSound();

  const handlePostReflection = () => {
    if (!newReflectionText.trim()) return;

    const newRef = {
      id: `ref-${Date.now()}`,
      authorAlias: "You (Sadhaka)",
      date: "Just now",
      reflectionText: newReflectionText.trim(),
      responses: [],
    };

    setSelectedCircle({
      ...selectedCircle,
      reflections: [newRef, ...selectedCircle.reflections],
    });

    setNewReflectionText("");
    setReflectionEditorOpen(false);
    playTempleBell(432);
  };

  const handleReport = (id: string) => {
    setReportedIds((prev) => [...prev, id]);
    alert("Reflection submitted to the circle facilitator for quiet review.");
  };

  const handleMute = (authorAlias: string) => {
    setActiveMutedUsers((prev) => [...prev, authorAlias]);
  };

  return (
    <div className="w-full min-h-screen bg-paper-base py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-gold-leaf font-bold">
            Intentional Sanctuary
          </span>
          <h1 className="font-retelling text-4xl md:text-5xl text-paper-text font-medium mt-1 mb-3">
            Sangha Circles
          </h1>
          <p className="text-xs md:text-sm text-paper-muted leading-relaxed">
            Quiet, non-feed circles of 20–30 members exploring sacred literature. Zero follower counts, zero like buttons, zero viral ranking.
          </p>
        </div>

        {/* Circle Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {sanghaCirclesData.map((circle) => (
            <button
              key={circle.id}
              onClick={() => {
                setSelectedCircle(circle);
                playTempleBell(480);
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide border transition-all ${
                selectedCircle.id === circle.id
                  ? "bg-gold-leaf text-ink-black border-gold-leaf shadow-md"
                  : "bg-paper-base text-paper-text border-paper-border hover:border-gold-leaf"
              }`}
            >
              {circle.title} ({circle.memberCount}/{circle.maxMembers})
            </button>
          ))}
        </div>

        {/* Selected Circle Active Folio */}
        <div className="p-8 md:p-12 rounded-3xl bg-vellum text-ink-black border border-gold-leaf/35 shadow-2xl space-y-8">
          {/* Circle Metadata */}
          <div className="border-b border-gold-leaf/20 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-paper-muted mb-2">
              <span className="uppercase tracking-wider font-bold text-terracotta">
                {selectedCircle.theme}
              </span>
              <span>
                Facilitated by {selectedCircle.facilitatorAlias} · {selectedCircle.weeklyCadence}
              </span>
            </div>
            <h2 className="font-retelling text-3xl font-semibold mb-3">
              {selectedCircle.title}
            </h2>
            <div className="p-4 rounded-xl bg-parchment-warm/70 border border-gold-leaf/25">
              <span className="text-[10px] uppercase tracking-wider text-gold-leaf font-bold">
                Weekly Contemplative Prompt
              </span>
              <p className="font-retelling italic text-lg text-ink-black mt-1">
                “{selectedCircle.currentPrompt}”
              </p>
            </div>
          </div>

          {/* Code of Conduct Accordion */}
          <div className="p-4 rounded-xl bg-parchment-deep/40 border border-gold-leaf/20 text-xs">
            <span className="font-bold text-ink-black uppercase tracking-wider block mb-1">
              Circle Code of Reverence:
            </span>
            <ul className="list-disc list-inside space-y-1 text-paper-muted">
              {selectedCircle.codeOfConduct.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>

          {/* Share a Reflection Trigger */}
          <div className="flex items-center justify-between pt-2">
            <h3 className="font-retelling text-2xl font-medium">Shared Circle Folio</h3>
            <button
              onClick={() => setReflectionEditorOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-leaf text-ink-black text-xs font-semibold hover:opacity-90 shadow-md transition-all"
            >
              <Feather className="w-4 h-4" />
              <span>Share a Reflection</span>
            </button>
          </div>

          {/* Reflection Ink Editor */}
          {reflectionEditorOpen && (
            <div className="p-6 rounded-2xl bg-parchment-warm border border-gold-leaf/40 animate-fade-in space-y-4">
              <span className="text-xs uppercase tracking-wider text-gold-leaf font-bold">
                Penned with Deliberation
              </span>
              <textarea
                rows={4}
                value={newReflectionText}
                onChange={(e) => setNewReflectionText(e.target.value)}
                placeholder="Offer a sincere personal reflection in response to the weekly inquiry..."
                className="w-full p-4 rounded-xl bg-vellum border border-gold-leaf/30 text-ink-black font-retelling text-lg focus:outline-none focus:ring-2 focus:ring-gold-leaf resize-none leading-relaxed"
              />
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setReflectionEditorOpen(false)}
                  className="px-4 py-2 text-xs text-paper-muted hover:text-paper-text"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePostReflection}
                  disabled={!newReflectionText.trim()}
                  className="px-6 py-2 rounded-full bg-gold-leaf text-ink-black text-xs font-semibold hover:opacity-90 disabled:opacity-40"
                >
                  Place upon Folio
                </button>
              </div>
            </div>
          )}

          {/* Threaded Non-Feed Reflections */}
          <div className="space-y-6">
            {selectedCircle.reflections
              .filter((r) => !activeMutedUsers.includes(r.authorAlias) && !reportedIds.includes(r.id))
              .map((reflection) => (
                <div
                  key={reflection.id}
                  className="p-6 rounded-2xl bg-parchment-warm/40 border border-gold-leaf/20 space-y-4 text-left"
                >
                  <div className="flex items-center justify-between text-xs text-paper-muted border-b border-gold-leaf/15 pb-2">
                    <span className="font-semibold text-ink-black">{reflection.authorAlias}</span>
                    <div className="flex items-center gap-3">
                      <span>{reflection.date}</span>
                      <button
                        onClick={() => handleMute(reflection.authorAlias)}
                        title="Mute reflections from this writer"
                        className="text-paper-muted hover:text-ink-black"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleReport(reflection.id)}
                        title="Report reflection to facilitator"
                        className="text-paper-muted hover:text-sindoor"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="font-retelling text-lg text-ink-black leading-relaxed">
                    “{reflection.reflectionText}”
                  </p>

                  {/* Threaded Responses */}
                  {reflection.responses.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gold-leaf/15 space-y-2 pl-4 border-l-2 border-gold-leaf/30">
                      {reflection.responses.map((resp) => (
                        <div key={resp.id} className="text-xs text-paper-muted">
                          <span className="font-semibold text-ink-black">{resp.authorAlias}</span>{" "}
                          <span className="text-[10px]">({resp.date})</span>:
                          <p className="font-retelling italic text-sm text-ink-black mt-0.5">
                            {resp.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
