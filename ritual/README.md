# Spritual — The Ritual Reading Environment

> **A living manuscript for Itihasa and Purana, paced by breath.**
> Zero algorithmic feeds · Zero social notifications · Zero advertising · 100% Provenance-Anchored

---

## 1. Architectural Overview

Spritual is architected as a **Ritual Reading Environment** rather than a conventional library, feed, or bookstore. Every interaction is designed to pace the reader, reveal philological provenance, and facilitate quiet contemplative practice (*sadhana*).

### Core Differentiators
1. **Breath-Paced Scene Transitions:** Ambient sequences follow the ancient Vedic prana rhythms (4-2-6 and 4-7-8). Scene thresholds require deliberate breath awareness before the next folio unfurls.
2. **Interactive Provenance (Marginalia):** Gold-leaf margin anchors allow readers to unfold critical edition citations (Baroda Oriental Institute, BORI Poona) featuring root Devanagari shlokas, IAST transliteration, word-for-word Sandhi breakdowns, and scholarly commentary.
3. **Integrated Japa/Prana Practice:** Tactile 27, 54, and 108-bead japa malas with procedural Web Audio temple bell strikes (432Hz & 528Hz) and haptic feedback.
4. **Intentional, Non-Social Community (Sangha):** Small, intimate circles (maximum 20–30 members) focused on weekly contemplative inquiries without likes, follower counts, or algorithmic outrage.

---

## 2. Setup & Installation

### Prerequisites
- Node.js 20+ or 22+ (tested on Node 25.9.0)
- npm 10+

### Development Server
From the workspace root (`/Users/abhijay/Desktop/spritual`):
```bash
# Direct run inside app/ritual
cd app/ritual
npm install
npm run dev
```

Or from `app/` via npm workspaces:
```bash
cd app
npm run ritual:dev
```
The application will boot on `http://localhost:3030`.

### Production Build
```bash
cd app/ritual
npm run build
npm run start
```

---

## 3. Motion System & "Motion Intensity" Customization Guide

The motion system is governed by `MotionConfigContext` (`src/context/MotionConfigContext.tsx`) and conforms strictly to **WCAG 2.2 AA** and `prefers-reduced-motion`.

### Motion Philosophy
- **Sacred Easing:** `cubic-bezier(0.22, 1, 0.36, 1)`. No elastic bounce, spring pops, or micro-dopamine triggers.
- **Breath Durations:** Ambient sequences follow 4-2-6 or 4-7-8 seconds. Scene thresholds hold for 2.2 seconds with a tap-to-skip option.

### Motion Intensity Levels

| Level | Description | Behavior |
| :--- | :--- | :--- |
| **Full** | The default living manuscript experience | 3D folio tilt (max 4°), WebGL celestial constellation particle drift, 2.2s ink diffusion thresholds, diya glow. |
| **Restrained** | Gentle, non-distracting reading flow | Flat folios (zero 3D tilt), 500ms opacity dissolves, zero particle animations. |
| **Minimal / Reduced Motion** | High-contrast, zero-motion compliance | Complete override for `prefers-reduced-motion: reduce`. Instant scene transitions with citation immediately readable. |

### How to Customize Motion Intensity Programmatically
In any React component:
```tsx
import { useMotionConfig } from "@/context/MotionConfigContext";

const { intensity, setIntensity, shouldAnimate } = useMotionConfig();

// Change intensity
setIntensity("restrained"); // 'full' | 'restrained' | 'minimal'

// Conditional animation gating
if (shouldAnimate("full")) {
  // Execute heavy 3D or particle sequences
}
```

---

## 4. Reusable Motion Primitives

All motion primitives live under `src/components/motion/`:

1. **`FolioTransition` (`FolioTransition.tsx`)**
   - Renders the 2.2s ink-and-fog threshold before each scene containing the Sanskrit citation and title. Tap anywhere to skip.
2. **`InkRipple` (`InkRipple.tsx`)**
   - Non-gamified tactile ink dispersion effect on click/tap with organic diffusion.
3. **`MarginaliaCard` (`MarginaliaCard.tsx`)**
   - Gold-leaf anchor dot in the manuscript margin. Unfolds root Sanskrit, transliteration, word-for-word Sandhi breakdown, translation, and commentary. Supports card pinning. Adapts to bottom sheet on mobile.
4. **`JapaOverlay` (`JapaOverlay.tsx`)**
   - Interactive 27, 54, or 108-bead japa counter with subtle vibration (`navigator.vibrate`) and procedural 432Hz/528Hz bell audio synthesis. Seals a gold mark in the reader margin upon completion.
5. **`BreathOrb` (`BreathOrb.tsx`)**
   - Expanding and contracting SVG orb guiding the reader through 4-2-6 or 4-7-8 pranayama cycles with "Inhale... Hold... Exhale... You are here."
6. **`ConstellationNode` (`ConstellationNode.tsx`)**
   - 3D Three.js celestial constellation connecting the six primary archetypes (Rama, Sita, Hanuman, Krishna, Shiva, Ganesha) via dharma tension lines. Full keyboard and screen-reader accessibility.
7. **`ReflectionInk` (`ReflectionInk.tsx`)**
   - Blank folio with hand-lettered ink styling. Enables saving reflections privately, generating shareable Reflection Cards with provenance seals, or placing reflections into Sangha circles.

---

## 5. Design Tokens & Typography

Defined in `src/app/globals.css` and `tailwind.config.ts`:

- **Palm-leaf Ochre (`#D4C5A9`):** Primary manuscript surface.
- **Ink Black (`#1C1A17`):** High-readability body text (4.5:1+ contrast).
- **Gold Leaf (`#B8963E`):** Sacred accent, divider hairlines, and marginalia anchors.
- **Deep Indigo (`#1A1035`):** Contemplative night mode and Sanctuary background.
- **Muted Terracotta (`#A65A3A`):** Interactive accent and dharma tension markers.
- **Typefaces:**
  - Retelling: *Cormorant Garamond* / *EB Garamond*
  - Sacred Shlokas: *Noto Serif Devanagari*
  - Interface: *Inter*

---

## 6. Route Map

- `/` — Home (Hero with 3D Breathing Folio, Intent Portal, Character Constellation, Practice Weave, Sangha Circles)
- `/collections/[collection]/books/[book]/arcs/[arc]/stories/[story]` — The Flagship Story Reader (Scene thresholds, bilingual Devanagari view, marginalia, 108 japa malas, diya flame, end reflection, soft login, patronage paywall)
- `/characters/[slug]` — Character Sanctuary (Core tension, paired dialectics, timeline arc, recommended mantra and breath)
- `/collections` — Library (Manuscript shelf with tilting folio spines and reading progress)
- `/sanctuary` — Fullscreen Contemplative Practice (Breath orb, japa mala, 432Hz tanpura drone)
- `/sangha` — Sangha Circles (Quiet reflective circles, threaded non-feed discussions, code of conduct)
- `/subscribe` — Patronage Checkout (₹0, ₹149/mo, ₹299/mo; UPI-first Google Pay, PhonePe, Paytm, Stripe)
- `/api/stories`, `/api/citations`, `/api/characters`, `/api/circles` — Mock API Route Handlers

---

## 7. Zero-Distraction Guarantees
- ❌ No algorithmic recommendation feeds
- ❌ No infinite scroll
- ❌ No like counts, follower tallies, or viral counters
- ❌ No gamified streaks, badges, or countdown timers
- ❌ No audio autoplay (Web Audio & Howler are strictly opt-in)
