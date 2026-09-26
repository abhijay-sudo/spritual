# Story-led experience pass — 25 September 2026

The nine owner-supplied Emergent screenshots are **visual references**, not live product evidence or instructions to copy prices, content, assets or claims. They show a Shiva season cover, a full-screen Watch/Listen/Read player, episode lists with locks, a Hindi home and Explore/Universe/Profile structure, and a trial/paywall.

What worked in the reference: a single expressive cover, one clear start action, compact chapters, an immersive reading surface, persistent language choice, and visible progress. What needed a stronger implementation: the screenshots do not establish that videos, narration, payments, premium access or the Shiva story content exist or are authorized. Their locked episodes and payment figures are therefore not reproduced.

## Implemented

- `/alpha/series/gita` is a dark illustrated three-reading journey linked from Today and Explore. Every actual reading is open, and `0/3` derives only from explicit local read marks.
- `/alpha/episode/:id` is a working four-moment reader: existing arrival text, original Sanskrit and optional IAST, original clearly unreviewed meaning with the existing Gita Supersite source link, and an optional daily action. It has visible Previous/Continue controls, URL-resumable moments, an explicit Mark as read action, a completion screen, an optional Keep in My day action, and an Undo read mark.
- My day gained per-action removal with confirmation. This lets a reader correct a mistaken saved action without clearing unrelated notes or activity.
- English/Hindi choice persists per local demo identity. Finite entrance transitions respect both OS and app reduced-motion settings. Small controls were raised to at least 44 CSS px; the reader preserves scrolling for larger text.
- Existing teacher/Circle fixtures, earlier scripture reader, brand, privacy limits and three source-linked Gita samples remain available. No media mode or premium lock is implied.

## Original visual asset

`web/public/art/gita-chariot-cover-v1.webp` is a 941 × 1672, 161 KB WebP made from a newly generated original illustration. It is not extracted from the reference screenshots. The art is a conceptual depiction, not an authenticated historical image or reviewed religious teaching.

Generation tool: built-in `image_gen`. Final prompt: “Use case: illustration-story. Asset type: original vertical cover artwork for an Indian mobile app's Bhagavad Gita learning journey, no UI. Depict a quiet dawn on the Kurukshetra plain, seen from behind a modest ancient chariot with two respectful human figures: a charioteer in muted indigo and saffron and an archer seated beside him. The moment is contemplative before a hard conversation, not a battle spectacle. Wide luminous sky and a low horizon create strong negative space in the upper third for app typography; foreground has subtle wheel and fabric texture. Sophisticated contemporary Indian editorial painting, cinematic but humane, fine brush grain, deep indigo, warm antique gold, terracotta and charcoal, restrained atmosphere. Portrait composition suitable for a 9:16 cover and crop. No text, no lettering, no logo, no watermark, no additional characters, no gore, no glowing fantasy effects, no imitation of any provided screenshot.”

## Remaining truth boundaries

The alpha has no Shiva season, licensed/human narration, video, broader scripture catalogue, verified teacher review, real account, billing or demonstrated customer preference. The new art and all explanations need product/content review before a public release. This local change does not establish an external service or authorize the screenshot's prices.
