# Unframed portrait artwork — 24 October 2026

The owner rejected the oval framing and image softness, and requested more appealing, polished and lively artwork. This continues the prior explicit authorization to QA and publish the same website opening. Four individually generated decorative portraits replace the shared low-resolution sheet. No new deity, brand, story text, app, payment or provider release is included. No independent scholarly/iconographic review is claimed.

## Actual resolution and delivery

The old 2172×724 sheet allocated about 543×724 pixels to each figure. Each new generated PNG is **941×1672**. The built-in generator was asked for 2160×3840, including an additional opaque Rama resolution attempt, but returned 941×1672. These are **not native 4K images**, and they have not been enlarged to manufacture a 4K claim. The opaque alternative was not selected. Original transparent masters are in `assets/portraits/*-master.png`; `release.json` records generator filenames, dimensions and exact hashes.

Responsive WebP delivery uses heights 840, 1280 and 1672, encoded at quality 88 with full-quality alpha. Source masters remain outside deployed output. All four selected 840px assets total 457,930 bytes; 1280px total 933,800; 1672px total 1,420,744. Phones download one suitable variant per figure, not every variant. The rendered image is capped at 800 CSS pixels high on large displays; high-density phones select the full 1672px source. The actual artwork remains below native 4K regardless of the display resolution.

A single 900ms readiness deadline covers all four selected assets. If any fails or arrives late, the site remains immediately usable. Replay retries; no later blank deity frame substitutes for a failed asset. Returning visits and reduced motion do not download portraits merely to play an automatic opening.

## Prompt set and tools

Built-in image generation was used, with the old four-figure sheet as pose/iconography reference and the selected new Rama as the shared style reference for the other three. Common final prompt: one individual full-body devotional portrait, maximum native detail, transparent background, forest green #183D36 forms and engraved antique-gold #B58D46 ornament, precise face/fingers/jewellery/cloth, subtle sage modelling, premium Indian miniature craftsmanship. Preserve two natural arms and the named iconography; keep crown, props and feet fully visible. No circle, oval, halo, arch, border, ground plane, scenery, other figure, text, logo, watermark or particles.

- Rama: standing, facing slightly right, crown, vertical bow, quiver, dhoti and draped sash.
- Shiva: seated cross-legged in meditation; topknot, crescent, tripundra, snake, rudraksha, tiger-skin garment, trident/damaru; hands at knees.
- Krishna: graceful tribhanga, playing a horizontal flute with both hands, peacock feather/crown, flowing dhoti and drape.
- Hanuman: kneeling in devotion, side three-quarter view facing left, monkey face, crown, curving tail, both hands on vertical mace.

Sharp performed delivery resizing/encoding only; no new detail was claimed from resizing. The existing sunrise mark and Fraunces/Manrope/Tiro remain unchanged. Native code supplies all text, controls and finite motion. Current visual evidence: `docs/qa/welcome-portraits-2026-10-24/README.md`.
