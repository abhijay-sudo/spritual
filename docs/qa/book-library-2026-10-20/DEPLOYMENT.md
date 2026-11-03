# Public book-reader deployment

- Implementation commit: `ee03d3359912e6935e28d2c222b95c8b05f22c65`, pushed to `codex/public-website`.
- Vercel reported success for this commit: https://vercel.com/spritual1/spritual-website/6YHqoWAHUVZGcfgT9cF74hM9Kz8K
- Live result: https://spritual.co.in/books/ and https://spritual.co.in/hi/books/ . Opened the public shelf and clicked into the actual reader in Codex's built-in browser.
- `live-parity.json`: homepage, English/Hindi shelves, first reader, book CSS/JS/state and homepage bridge match the local build byte-for-byte. Historical source index, chapter and original-edition file return 404 publicly.
- `live-browser.log`: all 13 book-reader tests passed against production (26 seconds), including all 32 story/language routes, keyboard, touch emulation, exact saved-page resume, no-JS/reduced-motion and storage failures. All four viewport checks were rerun against the live website.
- The first live run found two strict-locator test races immediately after bookmark navigation. The tests now wait for the single enhanced page before checking its exact ID; no functionality or assertion was removed. Production code was unchanged by this test correction.
- Full GitHub regression status is recorded separately when the workflow completes. Local focused regression was 27/27; local unit checks 58/58; twelve automated accessibility scans had no reported violations.

The downloaded historical corpus remains local, uncommitted and unpublished. Its builder and validation tools are committed; they refuse CI/Vercel execution. Exact-edition rights and named editorial review remain the publication blockers. Prior user changes and the unrelated Android line-ending modification remain untouched.

## Final regression result

The corrected code/test head `9c6594f79113bb3434010dc3c4783b47768ab416` passed the full [GitHub website workflow](https://github.com/abhijay-sudo/spritual/actions/runs/39311954634). The prior head had 150 browser passes and one premature strict-locator failure, resolved by the initialization wait described above. See `ci-status.json` and `ci-summary.log` for final counts. Vercel also reported success for `9c6594f` at https://vercel.com/spritual1/spritual-website/HByUwF4XcsfqZTZyfasJaR7SZub6 . Only tests/evidence changed after the byte-verified implementation deployment.

The full source-library preview is left running on loopback port 4193 and opened in the built-in browser. The public test server was stopped. Both the live book reader and local research library are available for the owner to inspect.
