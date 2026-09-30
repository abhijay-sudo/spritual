# Spritual public website

30 September 2026: the owner explicitly authorized building and publishing a website on **spritual.co.in** using the Spritual Vercel account open in Chrome. This authorization covers this website; it does not supply religious-content rights, human approvals, payments or a production app backend.

## Scope and commands

A dependency-free static website inside the existing app repository. Node renders six HTML pages plus a real 404. Small native JavaScript enhances reflection selection and the quiet-moment journey. No framework migration, app changes or remote database is needed.

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

Public HTML includes canonical/hreflang, descriptions, social metadata, sitemap and privacy notice. The site stays readable without JavaScript. No analytics, third-party font requests, email collection, payment, account, AI provider, app-store availability claim or religious prose is shipped. Ordinary Vercel hosting logs remain. The scripture app is explicitly in development. App fixture assets and routes return 404.

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

## Live delivery and domain blocker — 30 September 2026

The production website is public at **https://spritual-co-in.vercel.app/**. The initial `project-11b20.vercel.app` address redirects to it. The custom domain is not live yet. Vercel deploys this branch automatically; code revision `65e3320` was served publicly and passed all **11 Chromium journey tests against the live HTTPS site**. The separate seven Node checks and GitHub CI [36742919401](https://github.com/abhijay-sudo/spritual/actions/runs/36742919401) passed. CSP, security headers and anonymous HTTP 200 were verified. Default deployment protection remains intact; unique deployment URLs may require Vercel authentication while the production alias is public.

GoDaddy reports **Registrar Hold / KYC validation required** and disables DNS editing. The owner must complete the contact-verification consent in the open GoDaddy domain settings. No KYC consent, contact changes or DNS edits were submitted. Public DNS currently returns NXDOMAIN. Vercel also reports the custom domain attached to another account, requiring the ownership TXT shown in its domain settings. Both apex production and `www` → apex 308 redirect are configured in Vercel but await verification.

After the registrar releases the hold, read current DNS before changing anything: replace only the parked apex A with Vercel's currently displayed value (`216.198.79.1` at inspection), add the exact `_vercel` ownership TXT from Vercel, and reconcile `www` with its displayed CNAME. Preserve nameservers, SOA, Domain Connect, DMARC and any unrelated records. Recheck Vercel ownership, public resolution, HTTPS and the complete browser suite on the custom domain. Do not report the custom domain live before these pass. Public preview share links remain usable on the preview host; canonical and sitemap target the intended custom domain.

No app store release, full scripture publication, production app authentication, database migration, payment or AI provider was enabled by this website deployment.
