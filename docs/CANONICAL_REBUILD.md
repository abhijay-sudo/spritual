# Canonical rebuild — review candidate

The runtime content authority is `website/content/stories.json`. The exact requested TypeScript contract is `schema.ts`; `taxonomy.mjs` defines Universe → Collection → Book → Arc → Story → Page. `prepare.mjs` is an explicit editorial import, not part of ordinary builds: rerunning it replaces manual changes to the canonical JSON.

The candidate contains six collections, 12 bilingual episodes and 99 illustrated scenes. Every scene passes the 60–140 whitespace-word limit independently in English and Hindi. Estimated episode lengths are 6–10 minutes, using the slower of English at 150 words/minute and Hindi at 130 words/minute. These are reading estimates, not measured participant results.

New adaptations expand Govardhana, Ganga and Dhruva and introduce Devi's two requests, Ganesha's nearer world and Yudhishthira's companion. Six longer Ramayana episodes preserve existing prose. Tests prove that every original short scene remains verbatim at its mapped page. 184 legacy aliases preserve old entry points and scene positions; saved storage accepts both URL formats without changing its key/schema.

## Local review

From this checkout:

```sh
node website/build.mjs
node website/content/build.mjs
python3 -m http.server 4191 --bind 127.0.0.1 --directory artifacts/canonical-site
```

Open http://127.0.0.1:4191/ and use the language link for Hindi. Browse all six collections, sources, character links, filters and saved pages. No login or provider service is needed. The preview is noindex and has a disallow robots policy.

## Verification

```sh
node --test website/tests/*.test.mjs
node website/content/qa.mjs
npx playwright test -c website/canonical.playwright.config.ts
npx tsc --noEmit --skipLibCheck --module NodeNext --moduleResolution NodeNext --target ES2022 website/content/schema.ts
```

Browser coverage includes 390/768/1440 widths, language and current-page persistence, illustration visibility after page one, saving/resuming, legacy scene migration, composed filters, source drawer focus, first-arrival keyboard controls, reduced motion and no-JavaScript content. Static auditing covers 460 HTML files (276 canonical routes plus 184 legacy landing pages). Physical-device Safari and 120fps performance are not established by this coverage. Illustrations are reused story plates, not 99 unique artworks.

## Publication boundary

This candidate has not replaced production. `website/vercel.json` remains unchanged. The proposed production configuration is `website/content/vercel-release.json`, with 301 aliases and canonical-only output. Local static previews exercise fallback redirects; production HTTP 301 behavior still requires deployment verification.

`artifacts/canonical-migration-report.json` records exact content/art hashes. All stories remain drafts. Named editorial and art review must be recorded in `website/content/review.json` against these hashes, with approved rights, before setting stories to published. Do not fabricate or infer review. The release build fails closed until these records match.

After review: set publication status, activate the prepared Vercel configuration, build with `--release`, deploy through the authorized account, then verify Ready status, production aliases, deployed revision and representative old/new routes in both languages. A Git push alone is not deployment proof.

## Owner-directed release — 29 October

The owner subsequently instructed: “Once you are done, push it live.” This supersedes the prior publication hold for this candidate. `review.json` records that instruction against the exact content and artwork hashes, separately from independent review, which remains pending. The active Vercel configuration now builds the canonical release. Publication status indicates availability, not a claim of independent scholarly approval.
