# One manuscript, one arrival — 30 October 2026

The owner's latest brief supersedes the five playable home previews. The homepage now completes one opening and rests on Knowing how to stop. Reading remains the primary action; value filters move into the existing story discovery section. Canonical routes, collections, daily previews, saved pages and both reading modes remain intact.

The existing shared WebGL2 mesh / 18-strip CSS curl engine serves home and reader. A lost WebGL context now continues at the same progress with the CSS leaf. The home-to-reader action retains its 240ms fade/shared manuscript transition and arrives at canonical scene 5 with the same illumination. Reader Book-mode chrome fades after 2.4 seconds and returns on pointer or keyboard activity. Flow controls remain available so saving never changes the active scene. Sound remains off until explicitly enabled.

Timing: 700ms arrival + 1100ms curl + 240ms text reveal, staggered through 120ms; hard deadline 2200ms. Skip fast-forwards in 280ms. First-visit memory lasts 30 days; replay remains in the footer. Measured completion: 2175ms at 390px, 2174ms at 768px and 1440px. Under Chromium 1.6Mbps, 150ms latency and 4x CPU emulation: 2172ms, one book, selectable text, no horizontal overflow. These are browser-emulation measurements, not physical-device frame-rate certification.

Verification before release:
- 110 Node tests pass.
- 49 Chromium browser journeys pass, plus the added full-length footer-replay regression.
- 22 focused WebKit journeys pass, plus the added footer-replay regression.
- 461 generated HTML files pass the local link/asset audit.
- Axe WCAG A/AA reports no violations on affected EN/HI homes and reader.
- Visual inspection at 390, 768, 1440; reduced motion, all skip methods, first/return visits, blocked storage, Save-Data, low frame-rate fallback and context loss covered.
- Production export succeeds with unchanged content/artwork fingerprints and existing owner-directed release authorization.

Story prose and independent editorial/art review status are unchanged.

Live follow-up caught automatic footer-to-book scrolling shortening replay to 317ms. The replay scroll is now excluded from skip handling for its two animation frames; real wheel, touch and keyboard skip remain active. The new full-length replay test passes in Chromium and WebKit.
