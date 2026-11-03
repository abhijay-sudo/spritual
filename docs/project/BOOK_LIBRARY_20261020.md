# Source-linked book library — 20 October 2026

## Requested outcome and implementation

The owner requested original mythology stories, sourced from the internet, implemented in the app's book-like storyboard. A broad scrape was rejected as a content strategy: it mixes works, retellings, copyrights and editorial standards. Implemented a complete static reader using the established website stack, keeping source editions distinct from Spritual's retellings.

Public-content scope: 16 already-published bilingual retellings (ten owner-attested-reviewed Ramayana stories plus the six exact owner-selected homepage shorts). This is 16 readings, not 16 newly discovered unique episodes: two tellings of the bow and related Hanuman episodes remain identified by their different titles and formats. New book routes reuse their exact paragraph text and original source links. Original homepage files remain checksum-pinned; build-time navigation adaptations connect the existing invitations to real reading.

Research scope: fresh downloads of all eight existing importer source editions, 25 books and 2,755 parsed sections. Full source files and licences retained. The new book interface renders every section, searchable contents, previous/next section navigation and twelve verified text-matching episode entry points. Historical English only; no generated Hindi is substituted. The edition's idiosyncratic headings and transliterations remain unchanged. Some source paragraphs are very long; the reader grows instead of clipping them.

## Primary source research

Checked 20 October 2026:

- Ramayana, Manmatha Nath Dutt: https://www.gutenberg.org/ebooks/57265 (Bala/Ayodhya), https://www.gutenberg.org/ebooks/57826 (Aranya/Kishkindha/Sundara), https://www.gutenberg.org/ebooks/60188 (Yuddha), https://www.gutenberg.org/ebooks/62496 (Uttara).
- Mahabharata, Kisari Mohan Ganguli: https://www.gutenberg.org/ebooks/15474, https://www.gutenberg.org/ebooks/15475, https://www.gutenberg.org/ebooks/15476, https://www.gutenberg.org/ebooks/15477. All 18 parvas mapped. Gita remains within Bhishma Parva, sections XXV–XLII in this edition; it is not advertised as a new Sanskrit critical edition.
- Project Gutenberg terms: https://www.gutenberg.org/policy/license.html. US public-domain catalogue status does not itself establish rights in every publication territory. Exact downloaded licences preserved, linked from each local source section.
- Valmiki source comparison for Ganga/Shiva: https://sanskritdocuments.org/sites/valmikiramayan/baala/sarga43/balaroman43.htm. Dutt's download combines the narrative under SECTION XLII; importer position 41 is explicitly not represented as Sarga 41. No linked modern translation copied.
- Vishnu Purana, H. H. Wilson 1840: https://sacred-texts.com/hin/vp/index.htm and title-page record https://original.sacred-texts.com/hin/vp/vp000.htm. Bibliographic record: https://www.royalasiaticarchives.org/index.php/the-vishnu-purana-translated-by-h-h-wilson-in-london-1840. Direct file retrieval returned HTTP 403; no bypass attempted, no full text imported or claimed.
- Modern scholarly Vishnu Purana, ANU Press: https://press-files.anu.edu.au/downloads/press/n8264/html/upfront.xhtml?page=1. Explicit CC BY-NC-ND 4.0; not silently used as a commercially republishable/adaptable corpus.
- Bhagavata Purana Sanskrit reference, GRETIL: https://www.gretil.uni-goettingen.de/gretil/corpustei/transformations/html/sa_bhAgavatapurANa.htm. A research reference, not an automatic commercial permission grant or an English/Hindi edition. Not imported.
- Shiva Purana English, J. L. Shastri as listed by host: https://www.wisdomlib.org/hinduism/book/shiva-purana-english. No verified republication licence established. Only existing released shorts and Ramayana/Mahabharata source episodes about Shiva enter the respective readers.

Source fidelity means traceability to a specified text, not proof that mythology is historical fact, universal doctrinal agreement, scan collation or endorsement of the old translators' framing. No AI-generated quotation, fabricated verse, composite “original”, invented reviewer or hidden paid provider was introduced.

## Run and review

From repository root:

- `node website/build.mjs` — public output, independent of research files.
- `node website/serve.mjs` — loopback 4190.
- `node website/scripts/stage-epics.mjs` — explicit research download; not part of public build.
- `node website/books/build-research.mjs` — verify eight source hashes and episode anchors, create separate local book corpus; refuses CI/Vercel.
- `node website/books/audit-research.mjs` — verify every rendered paragraph, source heading, licence file and internal book link.
- `node website/serve.mjs --books-preview` — separate ignored research output on loopback 4193. Use one server at a time.
- `node --test website/tests/*.test.mjs` — public build, content-preservation and state tests.
- `WEBSITE_URL=http://127.0.0.1:4190 npx playwright test --config website/playwright.config.ts website/tests/books.spec.ts website/tests/app-introduction.spec.ts website/tests/app-motion.spec.ts`.

Research output contains noindex/nofollow, disallow robots and a visible local-editorial banner on research pages. These are supplementary disclosures, not the containment boundary: the production build never reads the source staging folder, never builds research routes and never copies the original files. Public source tests enforce this separation. Do not deploy `artifacts/book-research`.

## Acceptance and limits

Verify home → reader; all 16 readings in English/Hindi; page navigation, contents, history, exact language position; keep/reload/resume/remove; storage failures/corruption; source disclosure; empty-search recovery; reduced motion; keyboard focus; no-JavaScript text; 320/390/768/1440 layouts and large Hindi text. Record actual results in the dated QA folder.

The larger corpus needs exact-edition/territory/use rights review and named editorial review before public release. Further source collation, sensitivity review and Hindi translation require human editorial work. The ten existing review attestations are not extended to any imported source or newly written metadata. Native app packaging, accounts, sync, narration, payments and AI integrations are outside this slice.

## Observed baseline gaps addressed

1. Homepage story actions opened only short modal previews or a single phone sample. The same invitations now lead to full standalone reading pages; the modal retains a direct link to its exact story and language.
2. Reading lacked a shared chapter/page structure. The new contents dialog, stable folios, browser history and next-story navigation provide a complete sequence, with language changes keeping the semantic page.
3. The sample notebook was visit-only. The book reader offers a separate explicit kept-page control with real browser persistence, honest errors and deletion. Existing demonstration and legacy storage semantics remain unchanged.

Visual refinements from rendered inspection: replace heavy display-font prose with Georgia/Tiro; reduce the phone cover to a compact title/illustration frontispiece; use a single full-width reading leaf at tablet widths; darken small gold index labels after the accessibility scan measured 4.48:1 contrast. Existing homepage small-label limitations are not claimed to be resolved by these isolated reader changes.

The full-corpus inspection found volume-wide FOOTNOTES appended to some final sections by the historical importer. The book renderer now starts these on separately labelled Edition notes folios without dropping any paragraph; original files remain available. See the [verification report](../qa/book-library-2026-10-20/README.md). Run `node website/scripts/check-book-research.mjs` against the loopback research server for the separate source-reader journey checks.
