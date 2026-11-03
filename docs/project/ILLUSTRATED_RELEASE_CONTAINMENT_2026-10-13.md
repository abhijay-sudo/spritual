# Illustrated Edition production containment

## 14 October update — controlled replacement prepared, not published

The owner's latest instruction authorizes making tested, release-eligible changes live. A replacement public projection now contains the original ten reviewed retellings, existing approved artwork, three finite selected-story journeys and 48 bilingual availability pages for the twelve pending chapter IDs. Saved records for those chapters remain intact. The twelve new narratives, expanded maps and 35 paintings are excluded; the old `--sanatan-release` path fails closed. The complete draft edition remains available locally.

Direct Vercel connector/CLI access is unavailable, but the ordinary Git-connected route has now been verified: GitHub grants push permission, production HEAD is `90821ac10475f5ad7842d6c66253d1c74066ef6b`, and that commit's successful Production deployment points to `spritual1/spritual-website`. The authorized replacement can use this existing route without changing credentials or project settings. At release preparation no push/revert had occurred; the live-body observations below are historical, not post-release evidence. See [MANUSCRIPT_SANCTUARY_HANDOFF.md](MANUSCRIPT_SANCTUARY_HANDOFF.md) for exact implementation, tests and release verification. This update supersedes the earlier unresolved choice of containment option, not the missing editorial/art approvals.

## Historical investigation

Date: 13 October 2026

## Observed production state

- `spritual.co.in` is serving the Illustrated Edition released from commit `90821ac10475f5ad7842d6c66253d1c74066ef6b` on branch `codex/public-website`.
- That release contains 22 bilingual chapters, three journeys, twelve new connecting chapters, 35 generated paintings and 105 responsive derivatives.
- GitHub Actions run `38446983398` completed successfully for that release.
- The homepage redesign prepared after that release is local only and has not been committed, pushed or deployed.

## Approval gap

The only release record found is `OWNER_RELEASE_APPROVAL_2026-10-13.md`. It treats the owner's general instruction — “Whatever what left to push, please push it on live website asap.” — as release approval for the assembled static build. The same record explicitly says this does **not** extend named editorial review to the twelve connecting chapters or the new artwork and does not claim independent scholarly, theological, iconographic or legal certification.

No separate exact-version record was found showing named human approval of those twelve chapters, exact source maps, or new paintings. Therefore:

- do not add a global “Source-Verified Retellings · Editorial Review by Puja Bhagat” claim;
- do not make another production release until the owner resolves the intended publication scope or provides the exact approval record;
- retain the current local redesign and its evidence without presenting it as deployed.

## Recoverable containment options

1. **Freeze the current production revision while the exact-version audit is completed.** This makes no additional production change, but the presently published material remains public.
2. **Revert commit `90821ac` on `codex/public-website`.** Use a normal revert commit, never a force-push or history reset. This is the clearest immediate containment if the owner confirms that the Illustrated Edition should come down.
3. **Prepare a replacement public build with only the ten previously reviewed anchors and no guarded artwork.** The repository's default `node website/build.mjs` path is the starting boundary. Inspect its rendered output and deploy only after explicit scope authorization.

No option above has been executed by this local handoff.

## Verification after an authorized containment release

- Confirm the production deployment SHA and successful CI/deployment checks.
- Check the apex and English/Hindi homepages directly.
- Confirm all twelve connecting chapter routes are absent or return the intended not-found page.
- Confirm the sitemap exposes only the authorized routes.
- Confirm `/assets/illustrated/` files are not referenced by public HTML, CSS or JavaScript.
- Verify the ten-anchor copy, source links, language switching, Saved state and `/alpha` boundary.
- Record before/after screenshots and the exact tested revision.

## Local redesign disposition

The uncommitted homepage redesign remains in `website/` with its generated `website/dist` output ignored. It can be reviewed locally without changing production. Its editorial wording deliberately scopes Puja Bhagat's review to the original ten anchors and keeps the twelve connecting chapters and new paintings separately disclosed.
