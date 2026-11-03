# Full-screen book portal

Local Chrome verified at 320, 390, 768 and 1440 CSS pixels, plus touch-style skip/Hindi navigation and short landscape. Captures were opened and visually inspected. Larger existing artwork fixes the earlier enlarged low-resolution mobile view.

80 Node tests passed. Seven targeted Chrome tests passed; four viewport tests were rerun with explicit open-before-title and zoom-beyond-viewport assertions. Production build: 242 pages plus 404. The first browser run exposed a stale 4.5s timeout; updated to the intentional 5.7s sequence while preserving completion, focus, state-order and actual reader assertions.

No physical-device, Safari, frame-rate or conversion guarantee. Changes preserve the reader and all source/content boundaries.
