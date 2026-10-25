# Illustrated homepage — 25 October 2026

Owner reference: codex-clipboard-cb988838-c3e7-4358-972e-8859b4ff1e6d.png. Compared using view_image against rendered Chrome captures, with interactive Chrome inspection through the browser tool.

Implemented: open-book hero using a generated presentation of the existing forest illustration; centred desktop brand preserving the original logo; six cloth-bound story covers; native mobile shelf; featured story and real reader links. Existing app preview, filters, source notes, saved places, availability dialog and eight single-deity opening survive.

Comparison points reviewed: ivory/forest/gold palette; serif hierarchy; open-book silhouette and image crop; distinct bindings and six-book desktop rhythm; featured story artwork/contrast; deliberate stacked phone layout. Fixed the old floating note obscuring the artwork, pill-shaped cover labels, smallest-screen orphan word and tablet title/art crowding.

Intentional differences from the reference: the shelf contains six actual published stories rather than pretending to offer six complete scripture editions; the featured story is the available bow-at-Mithila retelling with its existing prose; the existing logo and honest app availability are retained; the storyboard is not exposed as a website section. The existing app demonstration remains below the featured story. The headline now matches the reference. Original descriptive copy is retained to explain the actual collection. These are product-truth decisions, not pixel-equivalence claims.

Verification:
- Both preview and dependency-free production builds: 242 pages + 404.
- 80 distinct Node tests passed across the full run (79 passed initially) and six-test rerun after updating the assertion for the accessible image-link invitation.
- 32 application/book/motion browser tests passed (13 + 19); four opening-size checks passed. Seven responsive-delivery/recovery checks and the delayed-hero network-priority check also passed (44 browser cases total).
- Separate Chrome captures at 320, 390, 768, 1440: no page errors or horizontal overflow; hero loaded appropriate responsive asset; featured link reached /books/read/rama-bow/ at each width. Screenshot helper initially attempted decoding before the viewport loader supplied src; changed to wait for actual loaded image, then all checks passed.
- Manually followed Find your story and featured Continue reading in Chrome. Existing tests cover all six bilingual previews, filters, keyboard/focus, touch-style interactions, no-JS, reduced-motion/rapid-input cancellation, saved-page reload and Hindi large text.
- Opened and visually inspected all four hero captures plus desktop/mobile shelf and feature captures. Reinspected 320/768 after typography refinements.
- No frame-rate, conversion lift, native device, Safari or accessibility certification claimed.

New hero WebP derivatives: 640px 99,132 bytes; 1024px 248,250 bytes; 1536px 514,684 bytes. Build validates SHA-256 and sizes, no image library required in deployment. No new package dependency, tracking, billing, app release or story rights claim.

Publication: commit 8da488c deployed successfully through Vercel. Live HTML, CSS and hero asset returned 200 and byte-matched the tested build; see live-verification.json. Chrome opened the live homepage.
