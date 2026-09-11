# Phoenix Galaxy

## Art and interaction

The hero is a galaxy of glowing square pixels shaped like the approved Phoenix mark. The renderer samples the existing transparent `assets/logo.webp`, retaining the silver upper arc, teal center, and silver stem. About 3,300 points shimmer and drift gently, surrounded by orbiting dust, violet/teal nebula light, and a sparse star field. The process and contact sections use quieter star fields.

Moving the mouse through the mark repels nearby pixels; spring forces return them to their original locations. Touch presses and moves use the same interaction, releasing on touch end/cancel so the mark reforms. Event listeners are passive and do not capture scrolling or interfere with links, forms, or buttons.

## Playback

Per the project owner's request, animation starts automatically on every page load, including when `prefers-reduced-motion` is enabled. There is no Play gate or saved preference. A keyboard-accessible Pause/Resume button remains available for visitors who need it. Animation suspends when offscreen, behind a dialog, or in a hidden tab and resumes when visible again. Decorative canvases remain hidden from the accessibility tree.

Rendering uses local Canvas 2D without libraries, tracking, remote assets, or WebGL. Updates are capped near 30 per second with smaller star/dust counts on compact devices, bounded device-pixel ratios, and a shared animation scheduler. The logo source is read from the existing brand image, including its inline data URL in the standalone build.

## Publication and verification

The branch-based Pages entry point explicitly loads `motion.css` and `motion.js` with version `3.0.0` cache keys. The static build validates and preserves these imports. Both publishing paths use the same renderer.

`tests/motion_smoke.py` verifies actual pixel changes, logo sampling, mouse displacement and reformation, mobile touch displacement and reformation, autoplay under reduced motion, keyboard pause/resume, dialog/offscreen suspension, existing website controls, and overflow at widths 320–1920px. It runs against the local HTTP build and real GitHub Pages URL and saves JSON and screenshots outside the source tree. These tests are not a formal accessibility or performance audit.
