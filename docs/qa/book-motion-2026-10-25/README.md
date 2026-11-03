# Book motion — 25 October 2026

Implemented 640ms entry cover, 480ms bidirectional page hinge, horizontal touch swipe and 500ms welcome book unfold. No dependencies or new image requests. Existing content, bookmark schema and source routes unchanged.

## Verification
- 80 Node tests passed; production build generated 242 pages plus 404.
- 13 existing reader journey tests passed; 6 new motion tests passed (320/390/768/1440, repeated input, resize cancellation, reduced motion, deep links, Hindi, selection and touch-style gestures).
- 6 Chrome welcome tests passed, including eight single portraits, real reader destination, reduced motion and four viewport sizes.
- Opened and inspected opening, turn and welcome screenshots; corrected mirrored-text bleed by limiting the hinge angle and refining easing. Actual Chrome next-page interaction verified.
- Controlled requestAnimationFrame sample during turns: 390px 54 frames, 1440px 55 frames, maximum interval 16.8ms and zero intervals over 50ms in each. This is local desktop Chrome with emulated viewport, not a device/frame-rate guarantee. Initial video-recorded sample had one 333ms interval on mobile; the controlled repeat excluded automation setup and recording overhead. Raw samples retained.
- Native vertical scroll, pinch zoom, keyboard controls, no-JS prose, enlarged Hindi and saved-page recovery retained. Physical Android/iOS and Safari were not tested.

Videos: reading-390.webm and reading-1440.webm (local artifacts). Screenshots show deliberately paused mid-turn frames, not settled typography.
