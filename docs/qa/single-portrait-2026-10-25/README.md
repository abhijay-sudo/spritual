# Single-portrait revision — 25 October 2026

Owner rejected paired deity portraits. Implemented eight single, centred stages, each 420ms, with no temporal overlap; complete opening 4.14s. Retained immediate skip, eligible-visit replay, cold-load cancellation, history safety, reduced-motion bypass and no-JS access. Homepage has wider book composition, aligned volume covers, a shorter clear headline and an existing Mithila story as its first narrative invitation.

Desktop and mobile screenshots at 320,390,768,1440 were actually opened and reviewed. Chrome desktop and mobile were inspected through the UI. No horizontal overflow or captured page errors at these widths. Existing bilingual story, source, privacy and saved-page journeys remain functional. The first 4K test found a 680px rendering against a 640px source; corrected the portrait cap to 600px (including scale headroom) and sizes metadata, then passed the same test.

Motion evidence in motion.json: actual playback sampled 248 frames at both 1440 and 390 widths; at most one visible deity throughout; p95 intervals 16.8ms and 16.7ms, zero observed long tasks. Controlled local headless Chrome, not a guarantee of device performance, conversion lift or universal 60fps. No new media masters or native-4K claim.

Build produced 242 pages+404. 80 Node/output cases passed. Opening browser suite: 30 passed initially, one source-upscaling failure corrected and rerun successfully. Twelve focused reading/trust/progressive-enhancement browser cases passed. Full-suite copy-expectation updates and final results recorded in delivery evidence.

No app deployment, payment setup, content approval or analytics was performed. The strategy and pilot drafts are separate development documents; their proposed prices are not live offers.

Final local regression: 170 distinct general browser cases passed across the full run (163) and seven corrected old-copy/old-route assertions rerun (7). The 31 opening cases passed across the suite and focused portrait-size reruns; high-density portrait assertion now requires the sharper 1280 variant. No journey assertion was removed. Two edition-economics tests passed in the development checkout. All new story drafts remain excluded from publication.
