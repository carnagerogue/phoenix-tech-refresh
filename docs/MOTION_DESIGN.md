# Phoenix Flow — interactive background

## Direction

Original ambient artwork for Phoenix Tech Refresh: silver and teal filaments form slowly folding ribbons against graphite. It carries the Premium Corporate #2 material language through the hero, lifecycle, and final invitation, while retaining the homepage's existing copy, assets, hierarchy, and working controls.

The user referenced https://openai.com/index/gpt-6-astra/ for an immersive, interactive background. Its article was readable, but managed-browser policy blocked direct animated-page inspection. This is an original interpretation of that requested experience, not a verified reproduction of the reference's animation or source code.

## Interaction

Pointer movement influences the local weave with smoothed movement. A background click or tap produces a restrained pulse. Scroll position alters the ribbon curvature. Links, buttons, inputs, dialogs, and disclosure controls retain their normal behavior; the canvas does not capture clicks or hijack scrolling.

A labeled Pause/Resume control is keyboard-operable. OS reduced-motion switches the artwork to a static composition and explains the setting. Optional animation pauses when scenes are offscreen, the page is hidden, or a dialog is open. The control changes all three scenes together; its setting is kept only in current-page memory.

## Technical boundaries

Canvas 2D, no external runtime, video, remote assets, telemetry, or storage. Decorative canvases are hidden from assistive technology. The existing no-tracking privacy behavior is unchanged. Pixel density, strand count, and sampling are capped; compact devices receive a simpler weave. The scheduler targets roughly 30 redraws per second, not a guaranteed measured frame rate on every device. The original readable page remains when the canvas cannot be initialized.

## Verification

35 recorded checks passed in Playwright/Chromium after the final build: original heading and page identity; three scenes; advancing frames; pointer-driven exploration; pause state and keyboard resume; paused rendering behind dialogs; form validation and local review; service navigation/explorer; lifecycle updates; demo portal filtering/export; all four legal documents; cookie preferences; offscreen rendering suspension; no horizontal overflow at 1920, 1440, 1280, 768, 390, and 320 pixels; static reduced-motion rendering and live preference updates; no JavaScript errors or external HTTP requests from the standalone build.

The Browser plugin was unavailable. HTTP/file navigation was blocked by the managed Chromium environment, so the standalone document was rendered using `set_content`. Native hosted storage persistence, real email-client behavior, other browser engines, and public deployment were not established by this run. The opaque origin correctly exercised the existing blocked-storage fallback.

Visual review compared the original desktop preview and the updated hero, lifecycle, and mobile screenshots. Copy, logo, typography, clean-white content sections, graphite/teal palette, image placement, and component geometry remain consistent. Intentional changes: additive background ribbons; a small motion control; extra top spacing on compact screens for that control. The logo asset was compressed to a high-quality WebP rendition rather than replaced with a different mark.

A build defect found during testing was corrected: injecting script text into standalone HTML now uses replacement callbacks, preserving literal dollar signs in the original JavaScript. The complete interaction regression suite passed after that fix.

No formal WCAG conformance, performance-score, legal-compliance, or security-audit claim is made.
