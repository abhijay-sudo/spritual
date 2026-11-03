# Shorter continuous welcome

3.4 seconds, down from 5.7. Book opening, restrained forward movement and title fade overlap rather than queue.

80 Node tests passed. Seven Chrome browser checks passed: complete sequence into reader, reduced motion, 320/390/768/1440 viewport compositions, touch-style skip/Hindi reader and landscape. Production build generated 242 pages plus 404. Mid-opening, handoff and settled frames captured; mobile/desktop handoff and final frames opened for visual inspection. Existing stalled-event-loop test time was updated to sample the final portrait on the new timeline; its non-restart assertion remains intact.

No new assets, dependencies, content, tracking or payments. Existing high-resolution art retained. Physical devices and Safari not tested; no frame-rate or conversion claim.
