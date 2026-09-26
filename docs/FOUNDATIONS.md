# Phase B foundations — 24 September 2026

Implementation is available for review, not a completed release gate.

## Run and inspect

Existing React/Vite/Capacitor app retained. `npm run build`; `npm run preview -w web -- --host 127.0.0.1 --port 4177 --strictPort`.
Open http://127.0.0.1:4177/design?ui_v2=1. Both path and flag are required. Existing routes stay on the current design. Preview mounts outside the legacy state provider and persists only `spritual_design_preferences_v1`. No account, location permission, paid service or remote AI is used.

## Implemented

- Semantic light, dark and lamplight tokens; system and solar theme selection; 100/125/150/200% type; OS/user reduced-motion support.
- Central color, spacing, type, radius, motion, curve, spring and sensory vocabulary. Every value is inspectable in the playground. Sound/haptic names are specifications, not simulated playback.
- Script-aware text with self-hosted Rozha One, Tiro Devanagari Sanskrit, Anek Devanagari/Tamil/Bangla. 15 genuine WOFF2 files, 1,021,940 bytes total, plus OFL notices. Provenance: font-v2-provenance.json. No runtime Google Fonts request.
- Nine sky studies; live sun elevation and moon illumination/altitude calculated by pinned SunCalc 2.0.2. City selection is explicit; Pune is a labeled default. City-local date/time labels. This is an astronomical illustration, not a tithi or panchang calculation. Moon placement is schematic, not a compass map. Sky studies hide the moon. Timers pause when the header is offscreen or the document is hidden.
- Real BG 2.47 source, Sanskrit and transliteration preserved. Primary action opens the existing working reader. Meaning remains explicitly unreviewed; no audio fabricated.

Astronomy reference: https://github.com/mourner/suncalc/blob/master/README.md (v2 API uses degrees).
Font sources and OFL links are preserved in the provenance manifest and public/fonts/v2 notices.

## Verification

- `npm run build`: passed TypeScript and production compilation.
- `npm test`: 62 passed. New cases cover opt-in boundaries, corrupted preference recovery, theme selection, WCAG AA normal-text theme pairs, solar degree units, bounded sky/moon geometry.
- `npm run mobile:apk`: Android debug build succeeded; sync guard recursively matched both native bundles, excluded service workers and retained privacy defaults.
- APK: artifacts/Spritual-0.1.0-debug.apk. SHA-256 f00c89d565342a53ceb853f04bce3a54641d1625c43996f9fd400e15650d319d.
- Chrome: 390px visual inspection; 320px Hindi/200% body text computed at 32px with document width 320px; Lamplight/language/size survived reload; all nine phase buttons updated sky labels; reduced motion computed animation-name none; reader handoff worked; no captured console errors. Desktop width 1728px without overflow, complete token reference opens. Browser viewport restored after tests.
- Screenshots: foundations/2026-09-24/{light,dark,hindi-200,preview}.png. Light/dark/large-text captures precede only the addition of the collapsed complete-token reference; final preview.png is the final build.
- Browser QA exposed old service-worker caches on previously used preview origins. Final user-facing build uses fresh port 4177. Do not interpret an older cached 4173/4176 screen as the current code.

## Open gate and release limitations

Owner brief Part 15 requires review before the next phase. Native screenshots and motion recordings, device performance, VoiceOver/TalkBack and actual customer usability have not been demonstrated. Full Xcode/iOS SDK is absent; iOS source sync is not an iOS build. Android APK is debug-only, not store-signed. Japa, AI, licensed audio, reviewed wider scripture, billing and backend remain later work. Existing npm dependency advisories require a targeted upgrade/security pass before public release; no forced major upgrade was mixed into this foundation change. Web theme contrast tests do not constitute a full accessibility certification. Existing fonts are bundled offline; new font assets increase PWA precache to about 1.8 MiB before transfer compression.
