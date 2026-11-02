"use client";

import React, { useState } from "react";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useSound } from "@/context/SoundContext";
import { Check, Shield, Sparkles, Smartphone, CreditCard, Clock, MessageSquare } from "lucide-react";

type PlanTier = "free" | "plus" | "patron";
type PaymentMethod = "upi-gpay" | "upi-phonepe" | "upi-paytm" | "stripe";

export default function SubscribePage() {
  const { isPatron, setIsPatron } = useReadingPreferences();
  const { playTempleBell } = useSound();

  const [selectedPlan, setSelectedPlan] = useState<PlanTier>("plus");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi-gpay");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dailyNudgeTime, setDailyNudgeTime] = useState("06:30");
  const [nudgeChannel, setNudgeChannel] = useState<"whatsapp" | "email">("whatsapp");
  const [step, setStep] = useState<"choose" | "payment" | "confirmed">("choose");

  const plans = [
    {
      id: "free" as PlanTier,
      title: "Free Folio",
      price: "₹0",
      cadence: "Forever free",
      tagline: "First 3 scenes of every story",
      features: [
        "First 3 scenes of every epic chapter",
        "Interactive Sanskrit marginalia",
        "27-bead japa counter",
        "Standard paper tones (palm-leaf, vellum)",
      ],
    },
    {
      id: "plus" as PlanTier,
      title: "Spritual+",
      price: "₹149",
      cadence: "per month",
      tagline: "Uninterrupted living manuscript",
      recommended: true,
      features: [
        "Unrestricted access to all 6 epic collections",
        "108-bead japa mala with procedural bells",
        "Bilingual Sanskrit & Devanagari stacked view",
        "Acoustic 432Hz tanpura drone",
        "Night and High-Contrast manuscript modes",
        "Daily 'Page a Day' contemplative nudge",
      ],
    },
    {
      id: "patron" as PlanTier,
      title: "Sangha Patron",
      price: "₹299",
      cadence: "per month",
      tagline: "Circles & physical letterpress",
      features: [
        "Everything in Spritual+",
        "Membership in reflective Sangha Circles (max 30)",
        "Quarterly physical letterpress shloka card sent by post",
        "Direct scholarly Q&A with critical edition editors",
        "Patron provenance seal upon your reading profile",
      ],
    },
  ];

  const handleProceedToPayment = () => {
    if (selectedPlan === "free") {
      setIsPatron(false);
      setStep("confirmed");
      playTempleBell(432);
    } else {
      setStep("payment");
      playTempleBell(480);
    }
  };

  const handleCompletePatronage = () => {
    setIsPatron(true);
    setStep("confirmed");
    playTempleBell(528);
  };

  const getStepProgress = () => {
    if (step === "choose") return 33;
    if (step === "payment") return 66;
    return 100;
  };

  return (
    <div className="w-full min-h-screen bg-paper-base py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-gold-leaf font-bold">
            Patronage, Not a Paywall
          </span>
          <h1 className="font-retelling text-4xl md:text-5xl text-paper-text font-medium mt-1 mb-3">
            Support the Living Manuscript
          </h1>
          <p className="text-xs md:text-sm text-paper-muted leading-relaxed">
            Zero venture capital growth hacking. Zero data harvesting. Spritual is sustained entirely through quiet patronage from readers who value civilisational depth.
          </p>

          {/* Calm Progress Line */}
          <div className="w-48 h-1 bg-paper-border/40 mx-auto mt-6 rounded-full overflow-hidden">
            <div
              className="bg-gold-leaf h-full transition-all duration-700 ease-sacred"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
        </div>

        {/* STEP 1: CHOOSE PLAN */}
        {step === "choose" && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((p) => {
                const isSelected = selectedPlan === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`p-8 rounded-3xl cursor-pointer border transition-all duration-300 relative flex flex-col justify-between select-none ${
                      isSelected
                        ? "bg-vellum text-ink-black border-gold-leaf shadow-xl scale-[1.02]"
                        : "bg-paper-base/90 text-paper-text border-paper-border hover:border-gold-leaf/50"
                    }`}
                  >
                    {p.recommended && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gold-leaf text-ink-black text-[10px] uppercase font-bold tracking-wider shadow">
                        Recommended Patronage
                      </span>
                    )}

                    <div>
                      <h3 className="font-retelling text-2xl font-semibold mb-1">
                        {p.title}
                      </h3>
                      <div className="flex items-baseline gap-1.5 my-3">
                        <span className="text-3xl font-bold font-mono">{p.price}</span>
                        <span className="text-xs text-paper-muted">{p.cadence}</span>
                      </div>
                      <p className="text-xs text-paper-muted mb-6">{p.tagline}</p>

                      <ul className="space-y-2.5 text-xs text-paper-text mb-6">
                        {p.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-gold-leaf flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-paper-border/30">
                      <div
                        className={`w-full py-2.5 rounded-full text-center text-xs font-semibold uppercase tracking-wider transition-all ${
                          isSelected
                            ? "bg-gold-leaf text-ink-black shadow-md"
                            : "border border-paper-border text-paper-muted"
                        }`}
                      >
                        {isSelected ? "Selected" : "Choose"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-4">
              <button
                onClick={handleProceedToPayment}
                className="px-10 py-3.5 rounded-full bg-gold-leaf text-ink-black font-semibold text-xs uppercase tracking-widest hover:opacity-90 shadow-md transition-all"
              >
                Continue with {selectedPlan === "free" ? "Free Folio" : "Chosen Patronage"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: UPI-FIRST CHECKOUT */}
        {step === "payment" && (
          <div className="max-w-xl mx-auto p-8 md:p-12 rounded-3xl bg-vellum text-ink-black border border-gold-leaf/40 shadow-2xl space-y-8 animate-fade-in">
            <div className="border-b border-gold-leaf/20 pb-4">
              <span className="text-xs uppercase tracking-wider text-gold-leaf font-bold">
                UPI-First Direct Support
              </span>
              <h2 className="font-retelling text-3xl font-semibold mt-1">
                Confirm {selectedPlan === "plus" ? "Spritual+" : "Sangha Patron"} (
                {selectedPlan === "plus" ? "₹149/mo" : "₹299/mo"})
              </h2>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-wider text-paper-muted font-bold">
                Select Payment Channel
              </label>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "upi-gpay" as PaymentMethod, label: "Google Pay (UPI)", icon: Smartphone },
                  { id: "upi-phonepe" as PaymentMethod, label: "PhonePe (UPI)", icon: Smartphone },
                  { id: "upi-paytm" as PaymentMethod, label: "Paytm (UPI)", icon: Smartphone },
                  { id: "stripe" as PaymentMethod, label: "International Card", icon: CreditCard },
                ].map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${
                        paymentMethod === pm.id
                          ? "bg-gold-leaf/20 text-gold-leaf border-gold-leaf font-bold"
                          : "border-paper-border/60 text-ink-black hover:border-gold-leaf"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-gold-leaf flex-shrink-0" />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Daily Nudge Configuration */}
            <div className="p-5 rounded-2xl bg-parchment-warm/70 border border-gold-leaf/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-black">
                <Clock className="w-4 h-4 text-gold-leaf" />
                <span>Optional Daily &apos;Page a Day&apos; Reading Nudge</span>
              </div>
              <p className="text-xs text-paper-muted">
                Receive one tranquil scene every morning at your preferred hour.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={dailyNudgeTime}
                  onChange={(e) => setDailyNudgeTime(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-vellum border border-gold-leaf/30 text-xs font-mono"
                />

                <select
                  value={nudgeChannel}
                  onChange={(e) => setNudgeChannel(e.target.value as "whatsapp" | "email")}
                  className="px-3 py-2 rounded-lg bg-vellum border border-gold-leaf/30 text-xs"
                >
                  <option value="whatsapp">Via WhatsApp</option>
                  <option value="email">Via Email</option>
                </select>
              </div>

              <input
                type="text"
                placeholder={nudgeChannel === "whatsapp" ? "+91 Phone number" : "Your email address"}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-vellum border border-gold-leaf/30 text-xs text-ink-black"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gold-leaf/20">
              <button
                onClick={() => setStep("choose")}
                className="text-xs text-paper-muted hover:text-ink-black"
              >
                ← Back to plans
              </button>
              <button
                onClick={handleCompletePatronage}
                className="px-8 py-3 rounded-full bg-gold-leaf text-ink-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 shadow-md"
              >
                Authorize Patronage
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRMED */}
        {step === "confirmed" && (
          <div className="max-w-md mx-auto p-10 rounded-3xl bg-vellum text-ink-black border border-gold-leaf text-center shadow-2xl space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-gold-leaf/20 border border-gold-leaf flex items-center justify-center mx-auto text-gold-leaf">
              <Sparkles className="w-8 h-8" />
            </div>

            <h2 className="font-retelling text-3xl font-semibold">
              Patronage Blessed
            </h2>
            <p className="text-xs text-paper-muted leading-relaxed">
              You are now a patron of Spritual. All manuscript collections, Sanskrit marginalia, 108 japa malas, and reflective Sangha circles are open to you.
            </p>

            <div className="pt-4">
              <a
                href="/collections/ramayana/books/bala-kanda/arcs/origin/stories/valmikis-question"
                className="inline-block w-full py-3 rounded-full bg-gold-leaf text-ink-black text-xs font-semibold uppercase tracking-wider hover:opacity-90 shadow-md"
              >
                Return to the Living Manuscript
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
