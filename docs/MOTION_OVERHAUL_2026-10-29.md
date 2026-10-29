# Living Manuscript motion release — 29 October 2026

The canonical Universe → Collection → Book → Arc → Story → Page routes are unchanged. This release adds five bilingual, playable home previews; value/duration discovery with animated filtering; illustrated collection/source pages with direct episodes; scene-specific artwork and Book/Scroll Flow modes; sticky scene/save/appearance controls; richer saved-scene cards; interactive daily previews and optional locally saved preset intentions; and a 4/2/6 quiet-minute guide.

Motion uses the existing paper engine for physical turns, with a separate enhancement module for pointer lenses, bounded magnetic/tilt effects, viewport reveals, image parallax, scroll progress and same-origin artwork transitions. Native controls and semantic text remain available without motion. Cursor effects disable on touch and reduced motion. Storage errors remain visible; older saves do not receive invented timestamps.

Verification completed locally:
- Production build: 276 canonical routes, 12 stories, 99 bilingual scenes; schema passes and owner-directed release hashes match.
- 110 Node tests; 41 existing/new Chromium journeys plus three additional preview/touch/legacy-save cases.
- 13 WebKit reader, motion and overhaul journeys.
- Static link/asset audit of 461 generated HTML files: no failures.
- Axe WCAG A/AA scan on home EN/HI, collection, reader, Today, Pause and Saved: no reported violations.
- Responsive screenshots at 390, 768 and 1440 pixels; no horizontal document overflow on the five principal views. Screenshots are under docs/qa/motion-overhaul/ locally.

Issues found and corrected during review: save controls could scroll the flow reader to another scene; initial layout could change a restored scene; inherited CSS temporarily disabled view transitions; contextual cursor labels were masked by inner anchors; hero preview controls needed a solid contrast surface; story card padding inherited old directory styles.

Limits: no physical 120Hz device certification or universal 120fps claim. Existing illustrations are reused where scene-specific art is unavailable, with differing focal positions. No 6+ story is relabelled from an older reading band. Independent editorial/artwork review remains pending; this is the previously authorized owner-directed publication, not a claim of independent review.
