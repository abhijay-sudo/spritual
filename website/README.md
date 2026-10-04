# Spritual public website

## Editorial reading room and durable return — 4 October 2026

The public story reader now opens as a responsive reading room: existing approved artwork and real story position sit beside a live turning-point rail on desktop, then become a compact art-first journey map on mobile. Story overview turning points link directly to the same bilingual sections. This is a presentation and wayfinding upgrade to the ten existing Ramayana retellings; it adds no story, scripture quotation, audio, review or paid capability.

Local reading state now caps bookmarks at 100 before writing, tolerates retired catalogue IDs without losing current data, distinguishes a saved story from a place at its first paragraph, and restores only the removed item on Undo so later preferences/progress remain intact. Legacy untyped bookmarks remain readable. The browser never rewrites a valid record merely because the catalogue changed; normalized data is persisted on the next explicit reading-state change.

Verification: implementation revision `5a3524e` was published through the existing Git-connected production branch. A subsequent independent QA pass found that saving immediately after a journey-rail jump could retain the preceding passage. Correction revision `078feed` makes explicit section/block navigation authoritative for Save place and covers immediate and 2.2-second delayed saves in English and Hindi, including Saved → reopen. It was published through the same production branch: `https://spritual.co.in/read/across-the-ocean/` returned HTTP 200, its live `reading.js` matched the corrected build byte-for-byte, all 29 Node tests and 72 Chromium journeys passed, and the exact-revision Public website and Verify alpha GitHub checks passed. The production build contains 152 public pages plus 404. Responsive/browser coverage includes 320/390/768/1440px, keyboard, changed-reader 200% text, reduced motion, dark reader appearance, exact resume and storage failure. Before/after captures remain local in ignored `website/test-results/reading-room/`.

## Local Sanatan reading redesign — 2 October 2026

A substantial free, reading-first redesign is now the normal production website build. It adds ten original bilingual Ramayana retellings, real detail and scroll-reader routes, source/context disclosures, library filters, Daily story, character pages, glossary sheets, reader appearance/type controls, robust device-only progress/bookmarks and a public corrections route. Build and release boundaries are documented in [`docs/SANATAN_READING_PREVIEW.md`](../docs/SANATAN_READING_PREVIEW.md).

Run `node website/build.mjs` for the production output in `website/dist/`. For a local noindex inspection build, run `node website/build.mjs --sanatan-preview` and `node website/serve.mjs --sanatan-preview`, then open `http://127.0.0.1:4192/`. The owner-attested review/rights record for this exact revision is in [`docs/SANATAN_RELEASE_RECORD_2026-10-03.md`](../docs/SANATAN_RELEASE_RECORD_2026-10-03.md); it names Puja Bhagat without inventing credentials or independent legal clearance.

**Current: live at https://spritual.co.in/ and https://spritual.co.in/library/.** GoDaddy KYC/hold and Vercel ownership blockers below are historical and were resolved on 30 September. The full-text scripture publication gates remain unresolved.

30 September 2026: the owner explicitly authorized building and publishing a website on **spritual.co.in** using the Spritual Vercel account open in Chrome. This authorization covers this website; it does not supply religious-content rights, human approvals, payments or a production app backend.

1 October 2026 release attestation: after being asked whether they had reviewed and approved all 32 original bilingual guide orientations and seven generated art families for publication, including their source and usage rights, the owner replied, “Yeah. Do it.” This records owner publication approval for the current website release. It is not represented as a separate scholarly, theological or tradition-institution review, does not change source facts, and does not authorize imported full scripture prose. The exact scope and rollback reference are recorded in `docs/project/OWNER_RELEASE_APPROVAL_2026-10-01.md`.

## Hush craft update — 1 October 2026

Implemented a six-section homepage, two balanced hero entry points, a keyboard-contained mobile menu, context-only library navigation, original collection marks, search-first controls, a narrower reading measure, focus-mode exit, and a smooth animation-frame pause timer. Motion is restrained and respects reduced motion. Hindi typography, 44px controls, enlarged-text reflow, consent-based saving and failure recovery remain supported. Completion is deliberately explicit; reaching zero does not save or declare completion. Cross-document view transitions were removed after a Chromium reload error; ordinary page/reveal motion remains.

Verified locally: 14 Node/output tests and 31 Chromium journeys passed, including screenshots/reflow at 390/768/1024/1440/1680 and existing 320px checks, EN/HI, keyboard, reduced motion, storage failures and no-JavaScript reading. Hindi phone home/menu, desktop home, tablet library, guide and pause/completion screenshots were visually inspected. Five Lighthouse accessibility audits (home, library, Adi guide, pause, Hindi home) scored 100; these are automated checks, not a WCAG certification or screen-reader/device study. Reports remain local under `artifacts/hush-lighthouse-*.json` and screenshots under `test-results/hush-*`.

Live verification: Vercel successfully deployed source revision `aa0841b`; all 31 Chromium journeys then passed against **https://spritual.co.in**. The published desktop homepage was visually inspected in Chrome.

The local-only editorial reader still passed its eight-source integrity audit across 25 books and 2,755 sections after the shared-template changes. This does not establish publication rights or editorial approval. No imported prose, payment, analytics, account service or app/native change is included.

## Scope and commands

A dependency-free static website inside the existing app repository. Node renders 80 English/Hindi HTML pages plus a real 404. Small native JavaScript enhances library search, explicit saved places, reading controls, reflection selection and the quiet-moment journey. No framework migration, app changes or remote database is needed.

From the repository root:

- `node website/build.mjs` — generate the allowlisted `website/dist` output.
- `node website/serve.mjs` — loopback preview on 4190.
- `node --test website/tests/*.test.mjs` — storage, timer, URL and public-output checks (build first).
- `npx playwright test --config website/playwright.config.ts` — website journeys with existing repo Playwright. Reuses 4190 if running.
- `WEBSITE_URL=https://spritual.co.in npx playwright test --config website/playwright.config.ts` — same checks against deployment. Tests only this browser's local storage; no service mutations.
- `node website/generate-social.mjs` — regenerate the original OG image with the existing repository's Sharp dependency; not required by production build.

Vercel: intended **Spritual** team (`spritual1`), root directory **website**, preset **Other**, build `node build.mjs`, output `dist`, install command from `vercel.json`. No secrets or environment variables required. The Mac CLI is authenticated to a different Vercel account; do not silently deploy there or replace its credentials.

## Acceptance and boundaries

Home → reflection choice → silent timed pause → explicit finish → optional preset intention save → reload → remove. English and Hindi. Timer pauses when document becomes hidden. No timer auto-completion record; no journaling or faith-profile collection. Save is deliberate, local, unencrypted and removable, with honest failure feedback. Corrupt records require explicit deletion. Shared links contain only language and a known public reflection ID.

Public HTML includes canonical/hreflang, descriptions, social metadata, sitemap and privacy notice. The site stays readable without JavaScript. No analytics, third-party font requests, email collection, payment, account, AI provider, app-store availability claim or imported religious prose is shipped. Ordinary Vercel hosting logs remain. The scripture app is explicitly in development. App fixture assets and routes return 404.

The original landscape is authored vector artwork, not a depiction of a named deity, licensed photograph, historical painting or sacred site. `brand.svg` is the unchanged project favicon. Fraunces is the existing OFL font; its license is included. The product illustration shows this working website pause, not a fabricated screenshot of a released mobile app.

## Competitive evidence and decisions

Primary pages inspected 30 September 2026; advertised features are not independent efficacy or retention evidence:

- [Sri Mandir](https://www.srimandir.com/): strong devotional service entry points, bilingual navigation, temple/puja/chadhava emphasis and extensive trust claims. Adopt clear intent and familiar language; do not imply temple fulfilment, offer blessings for payment or borrow their proof.
- [Headspace](https://www.headspace.com/): need-based entry choices, distinctive illustration, tangible sample sessions, product explanation and FAQ. Desktop page visually inspected in Chrome. Adopt immediate try-before-account value and clear choices, with Spritual's own visual language and no medical claims.
- [Hallow](https://hallow.com/home./): prayer-focused positioning and guided-practice invitation. Adopt a clearly stated spiritual purpose; do not borrow Catholic content, celebrity endorsements or membership statistics.
- [Calm](https://www.calm.com/app): meditation/sleep focus. Adopt quiet pacing and bounded attention; avoid claiming therapeutic benefits.
- [Sadhguru app](https://isha.sadhguru.org/sg/en/sadhguru-app): teacher-led yoga, meditation and ongoing learning. Spritual does not have a named approved teacher, so no authority is implied.
- [Sattva](https://www.sattva.life/webapp/meditations): meditation timer/tracker positioning. A small usable pause is appropriate; competitive rankings, habit impact and customer preference remain unvalidated.

Considered a screenshot-only launch page versus a full public app. Chosen: a polished product website with a functioning bounded pause, because app corpus rights and production integrations are still missing. A static build provides fast indexed pages, a small payload and an explicit asset allowlist. The existing React/Vite mobile app stays unchanged.

## Remaining decisions

The real approved scripture catalogue, editorial operators, app-store launch date, customer retention, live AI, payments, future app pricing and a public contact inbox remain unverified. Do not invent them to increase conversion. Broader religious publication still requires the existing rights/review process.

## Local verification, 30 September

Seven Node/build-output checks and 11 Chromium browser tests passed. Browser coverage includes all public page types at 320/390/768/1440px, English/Hindi, reduced motion, enlarged text, keyboard/FAQ, JavaScript disabled, complete pause/save/reload/delete, hidden-page timer pause, invalid storage, denied writes and clipboard fallback. Desktop home, phone home, Hindi pause and browser screenshots were visually inspected. No customer research, native device or screen-reader validation is implied. Hosted verification and DNS status are recorded after deployment below.

## Hosting setup

Vercel project `spritual-website`, ID `prj_xkulmp32dAg96BHwHFL5SW0L4XbR`, in the existing `spritual1` Hobby team. Git is connected to `abhijay-sudo/spritual`; production tracks `codex/public-website`; root is `website` and outside-root build files are disabled. Default Other preset with `vercel.json` build settings. No environment secrets or paid upgrade. Optional project model-training sharing was turned off. Hosted GitHub CI run [36741362410](https://github.com/abhijay-sudo/spritual/actions/runs/36741362410) passed all website checks on `6f7e557`.

## Historical initial delivery and domain blocker — 30 September 2026

The production website is public at **https://spritual-co-in.vercel.app/**. The initial `project-11b20.vercel.app` address redirects to it. The custom domain is not live yet. Vercel deploys this branch automatically; code revision `65e3320` was served publicly and passed all **11 Chromium journey tests against the live HTTPS site**. The separate seven Node checks and GitHub CI [36742919401](https://github.com/abhijay-sudo/spritual/actions/runs/36742919401) passed. CSP, security headers and anonymous HTTP 200 were verified. Default deployment protection remains intact; unique deployment URLs may require Vercel authentication while the production alias is public.

Update after owner verification, 30 September at approximately 23:15 IST: the owner completed the KYC flow, and the browser returned a successful completion result. After a full dashboard reload, GoDaddy still reports **Registrar Hold / pending WHOIS verification**, with DNS editing disabled. Public DNS at Cloudflare still returns NXDOMAIN. [GoDaddy documents up to 24 hours for KYC processing](https://se.godaddy.com/help/about-in-domains-5835?lc=en-US). Do not ask the owner to repeat KYC solely because the hold has not cleared; if it persists beyond that window, registrar support must investigate. No registrant contact changes or DNS edits were made by the agent. Vercel also reports the custom domain attached to another account, requiring the ownership TXT shown in its domain settings. Both apex production and `www` → apex 308 redirect are configured in Vercel but await verification.

After the registrar releases the hold, read current DNS before changing anything: replace only the parked apex A with Vercel's currently displayed value (`216.198.79.1` at inspection), add the exact `_vercel` ownership TXT from Vercel, and reconcile `www` with its displayed CNAME. Preserve nameservers, SOA, Domain Connect, DMARC and any unrelated records. Recheck Vercel ownership, public resolution, HTTPS and the complete browser suite on the custom domain. Do not report the custom domain live before these pass. Public preview share links remain usable on the preview host; canonical and sitemap target the intended custom domain.

No app store release, full scripture publication, production app authentication, database migration, payment or AI provider was enabled by this website deployment.

Post-KYC follow-up: all seven Node checks and all eleven live-preview Chromium journeys passed again. The remaining blocker is registrar processing followed by DNS and Vercel ownership verification, not a website build failure.


## Library expansion — 30 September 2026

**Implemented public journey:** Home → Library → collection → source guide → original external edition. Search across English/Hindi names, combine a collection filter, recover from no results, explicitly save a section, reload, switch language, resume and remove it. All 18 Mahabharata parvas, seven Ramayana kandas and seven Shiva Purana samhitas have stable bilingual guide routes. These 32 guides are bibliographic navigation, **not a released full-text scripture library**. The collection artwork is original abstract SVG; the liked ivory/forest/Fraunces theme is retained. Source text on external hosts is English; Hindi navigation does not imply a Hindi translation. Private shelf pages are noindex. Public contents remain navigable without JavaScript.

Saved places contain only known section IDs on this device. Search, text size and focus state are not persisted. No reading history, time-spent profile or automatic completion is collected. Storage corruption and denied writes have visible recovery states; cross-tab edits refresh the shelf. No account, checkout, premium lock, fabricated price or entitlement is enabled.

### Actual source reading, available only on this Mac

- `node website/scripts/stage-epics.mjs` downloads/reuses eight original Gutenberg files, preserves their complete licenses, records SHA-256/size/edition URLs, and segments their text into ignored `artifacts/library-source/`. It is an explicit research step, never part of production build.
- `node website/build.mjs --editorial-preview` builds ignored `artifacts/editorial-site/`. It refuses to run in CI or Vercel. The normal public build never loads the staged file and never emits `/read/` or `/sources/`.
- `node website/serve.mjs --editorial-preview` serves this separate reader on **127.0.0.1:4191**, with clear local-only status, source/license links, preserved original prose, source introductions, text-size controls and previous/next navigation.
- `node website/scripts/audit-staged-epics.mjs` verifies all eight file hashes/licenses, 25 books, every nonempty rendered section and every reader link. Run after staging and editorial build. Missing files are an explicit error.

The current import contains **2,755 parsed source sections** across Ganguli's 18 Mahabharata books and Manmatha Nath Dutt's seven Ramayana kandas. This is parser coverage, not a canonical chapter count, scan collation or a critical edition. Original headings include numbering gaps/duplicates; do not silently renumber them as scripture references. Internal ordinal route IDs are importer positions, not canonical verse identifiers. Raw source files preserve the original material and license. The earlier Griffith candidate was rejected because its Uttara account was abridged; Dutt's separate seventh-volume source is included instead.

Source editions: Mahabharata Gutenberg [15474](https://www.gutenberg.org/ebooks/15474), [15475](https://www.gutenberg.org/ebooks/15475), [15476](https://www.gutenberg.org/ebooks/15476), [15477](https://www.gutenberg.org/ebooks/15477); Ramayana [57265](https://www.gutenberg.org/ebooks/57265), [57826](https://www.gutenberg.org/ebooks/57826), [60188](https://www.gutenberg.org/ebooks/60188), [62496](https://www.gutenberg.org/ebooks/62496). Gutenberg's US public-domain designation is not worldwide commercial clearance; retain its [license](https://www.gutenberg.org/policy/license.html) and clear the exact edition, territory and use before release.

**Shiva blocker:** the [Wisdom Library Shiva Purana](https://www.wisdomlib.org/hinduism/book/shiva-purana-english) provides a useful seven-samhita directory but its modern English translation does not provide verified permission for Spritual republication. Only short bibliographic names/links are used. No full Shiva prose was imported. Shiva traditions also span multiple works; one Purana cannot honestly be advertised as every Shiva story. A cleared translation or commissioned, source-grounded and human-reviewed story collection is required.

### Competition and a defensible future paid layer

Additional primary sources inspected 30 September; advertised features are not verified demand or customer research:

| Product | Observed offer | Spritual decision |
| --- | --- | --- |
| [Gita Seva](https://apps.apple.com/in/app/gita-seva/id1418594830) | Advertises free scripture ebooks, audio and video, including the epics | Keep source discovery free; a text paywall alone is weak differentiation |
| [Amar Chitra Katha](https://digital.amarchitrakatha.com/all/all) | Packaged illustrated narratives and digital purchase/subscription offers | Explore separately licensed, reviewed story seasons with consistent art and narration |
| [Sadhguru app](https://isha.sadhguru.org/global/en/sadhguru-app) and [Exclusive terms](https://isha.sadhguru.org/in/en/sadhguru-exclusive/terms-conditions) | Guided practice and paid exclusive content | Paid value needs a credible teacher/editor and a coherent learning journey; do not invent authority |
| [Sri Mandir](https://www.srimandir.com/) | Temple-linked puja/chadhava services | Remain a reading/learning product here; fulfilment commerce requires separate operations |

Proposed commercial structure, **not an approved price or live integration**: free source directory and samples; a one-time purchase per finished narrated story season; optionally a membership for a regularly delivered reviewed catalogue. Do not promise an ongoing membership until editorial/narration capacity can sustain it. Start with one complete licensed season, not a huge unreviewed paywall. Validate willingness to pay before committing to a subscription schedule.

For each prospective paid edition retain collection/section ID, revision, language, translator/adaptor/narrator, source citations, territory/use-specific rights evidence, approval actor/time/version, media rights and delivered asset checksums. Publication must use the existing app's reviewed publication system; `catalog.mjs` has a fail-closed policy contract only, not a deployed entitlement service. Before charging, implement authenticated server-side entitlements, verified idempotent payment webhooks, refund/revocation handling, restore access, invoices and support. Never unlock from a client boolean or payment redirect alone. Those integrations are deliberately absent.

Track contribution per order as collected price less taxes, payment/store fees, royalties, refunds and variable delivery/support. Track editorial, translation, narration and artwork costs per season separately; break-even paid orders = fixed season cost / positive contribution per order. Actual costs, customer willingness to pay and prices are unknown. No invented ARR, conversion or subscriber targets are used as evidence.

### Verification and remaining release gates

Local evidence: **14 Node tests and 21 Chromium journeys passed**. Coverage includes the new search/filter/empty state, explicit shelf/save/reload/remove, Hindi switching, corrupt/denied storage, font/focus controls, external-source safety, no-JavaScript navigation and 320/390/768/1440px layouts. The original pause journeys still pass. Desktop library, Hindi phone source guide and actual local imported reader were visually inspected. The separate local import audit passed for all 2,755 sections. This does not establish factual textual accuracy, customer preference, screen-reader or native-device performance.

Full-text public release remains blocked by exact-edition worldwide/commercial rights evidence, named human editorial review and scan/source collation; Hindi content needs its own translated edition and review. Shiva requires a cleared source or commissioned adaptation. Audio, paid access, identity and app-store launch remain unavailable. Do not claim that full texts or subscriptions are public because the directory is live. Hosting/custom-domain status above remains separate from content readiness.


## Custom-domain connection completed — 30 September, 23:50 IST

GoDaddy released the registrar hold after the owner's KYC. Read and preserved the existing seven-record zone, then changed only parked apex A to Vercel's displayed `216.198.79.1`, changed `www` CNAME to `516fb657af903685.vercel-dns-017.com.`, and added the two ownership TXT records Vercel requested at `_vercel`. NS, SOA, Domain Connect and DMARC remained unchanged; no registrant details, paid service, nameservers or security settings changed. Public Cloudflare DNS returned all new A/CNAME/TXT values. Vercel ownership validation succeeded.

Redeployed tested source `854c1c8` as `dpl_ASDWDF8Pt8Wg8Y6cHzNbhfheSKj6` to assign the now-verified domains. Anonymous HTTPS `https://spritual.co.in/library/` returned 200 with the new catalogue; `https://www.spritual.co.in/library/` returned 308 to the matching apex path. TLS validation was not bypassed. The custom-domain page was opened and visually inspected in Chrome. GitHub [Public website](https://github.com/abhijay-sudo/spritual/actions/runs/36757211179) and [Verify alpha](https://github.com/abhijay-sudo/spritual/actions/runs/36757210850) passed for the implementation revision. All 21 browser tests also passed against the Vercel public alias.

Final custom-domain verification: **all 21 Chromium journeys passed against https://spritual.co.in**, including source-guide availability, private-reader 404s, bilingual layouts and the entire pause/saved-place flows.
