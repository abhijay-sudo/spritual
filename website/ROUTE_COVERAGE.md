# Spritual website route and state coverage

This matrix describes the local public build. It is not a deployment record.

| Route family | EN | HI | Useful content and actions | States verified by tests |
| --- | ---: | ---: | --- | --- |
| `/` and `/hi/` | 1 | 1 | Value proposition, library entry, quiet moment, product approach, FAQ | mobile menu, keyboard moment choice, reduced motion, responsive layout |
| `/pause/` | 1 | 1 | Silent one-minute pause, optional preset intention, device-only save, share link | initial, running, paused, completed, saved, storage failure, no-JS |
| `/privacy/` | 1 | 1 | Current website storage and hosting disclosures | noindex, external privacy link |
| `/library/` | 1 | 1 | Three illustrated collections, search/filter, 32-guide directory, saved-place entry | results, no results, reset, no-JS, storage warning |
| `/library/{collection}/` | 3 | 3 | Collection context, edition note, ordered guide list, exact external catalogue | first-guide CTA, responsive list |
| `/library/{collection}/{guide}/` | 32 | 32 | Unique orientation, figures, themes, edition caveat, optional reflection, precise source locators | save/remove, focus, font size, next/previous, reduced motion |
| `/library/saved/` | 1 | 1 | Honest empty shelf, three real starting points, all-guides CTA, device-only saved list | empty, populated, removal, corrupt/denied storage, no-JS |
| `404.html` | 1 | shared | Clear recovery to Spritual home | noindex |

Totals: 80 generated public pages plus a 404 page. All 32 guide keys render in both languages. Imported scripture prose and `/read/` routes remain excluded from public output.

## Contextual-world coverage

Every public surface exposes the same six-choice visual-world navigation: neutral Still, honest generic Mahabharata, Rama, Krishna, Hanuman and Shiva. It changes atmosphere, art, shell colours, accents, card geometry and reader chrome; it never hides or silently filters the catalogue.

Precedence is deterministic:

1. An explicit valid `?world=` URL choice wins and is shareable/back-forward safe.
2. Without an override, Mahabharata routes use the generic epic world; Ramayana uses Rama; Kishkindha and Sundara use Hanuman; Shiva routes use Shiva.
3. A saved preference applies only on neutral routes.
4. Invalid or unavailable storage falls back to neutral without blocking the page.

The explicit choice is retained through internal navigation and EN/HI switching. A visible Still choice returns to the neutral atmosphere. A blocking head script applies the chosen world before CSS, avoiding a theme flash. Reduced motion removes transitions without removing content or state.

Library discovery keeps all 32 guides in the document for no-JavaScript access, while enhanced pages progressively disclose the three collection groups. Search and collection filter state are URL-backed, survive refresh and language switching, keep result counts visible and never treat a visual world as a content filter. Saved places remain a stable language-neutral guide ID on this device; the homepage offers a continuation only when that valid record exists.

## Content-state rules

- Guide text is original editorial orientation, visibly marked **unreviewed** and **not scripture or licensed translation**.
- Source links identify editions or selected passages; they do not imply that every interpretive sentence is a quotation or rights-cleared.
- Optional reflection is visually and textually separated from canonical source metadata.
- Empty, error, denied-storage, no-result and no-JavaScript states always include a useful explanation or next action.

## Release approval and remaining limits

- The project owner explicitly attested on 1 October 2026 that they reviewed and approved all 32 guide orientations and seven art families for publication, including source and usage rights. This is owner release approval, not an independent scholarly/tradition review; see `docs/project/OWNER_RELEASE_APPROVAL_2026-10-01.md`.
- Six IIT Kanpur locators remain intermittently unavailable; their citations are retained and edition-labelled working alternate locators are provided. Kishkindha 4.9 was reachable.
- Rights evidence before publishing any full scripture translation or source import.
- Real-user Core Web Vitals measurement; LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 remain targets, not measured claims.
- Independent cultural review beyond the owner's explicit publication approval for the seven art families documented in `assets/GENERATED_ART.md`.
