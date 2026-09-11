# Phoenix Flow 2

## Fix to the published homepage

The site was published by GitHub's branch-based Jekyll workflow. The previous source `index.html` did not load `motion.css` or `motion.js`; only `build.mjs` inserted them. Consequently a successful branch deployment could publish a completely static hero.

The source homepage now explicitly includes both assets, with version `2.0.1` cache keys. The static build validates those imports and copies them unchanged. Both publishing paths render the same experience. `_config.yml` excludes development and review documents from the branch-published website. The alternate Actions publisher is manual-only, preventing two publishing workflows from competing automatically. No repository visibility or account settings are changed by this update.

## Art direction

Replace the faint wire-like backdrop with a single sculpted, reflective silver-and-teal ribbon loop, deliberately recalling the approved metallic identity and the equipment lifecycle. It has a real parametric 3D surface, perspective, continuous normals, a depth buffer, and smoothly interpolated reflections. Rendering uses the local Canvas 2D API, including a bounded software surface renderer, so it does not require WebGL, a GPU driver, a third-party library, video, or a network service.

The hero keeps its original copy, navigation, CTA labels, colors, and human-accountability message. The illustrative technician image becomes a small supporting proof tile, making room for the artwork instead of covering it. A subtle flowing light sheet links the hero, process, and closing invitation; the latter two keep the sculpture low-contrast behind the content. No company capability, legal, certification, customer, or impact claims are added.

## Interaction and accessibility

- Autonomous slow folding and shifting reflections, not a static image.
- Pointer-relative orbit with eased movement.
- Background click/touch creates a traveling deformation; controls and forms do not trigger it.
- Scroll changes the composition subtly, without hijacking navigation or scrolling.
- Keyboard-accessible Pause/Resume control; no persistence or tracking.
- Reduced-motion preference displays the sculpted still by default, with an enabled Play animation button for an explicit page-only opt-in. Pause stops it again. Reloading or changing the system preference clears the override; dialog and background-tab suspension still apply.
- Animation suspends offscreen, in background tabs, and behind native dialogs.
- Decorative canvases are hidden from the accessibility tree and cannot capture pointer events.
- Desktop rendering is capped near 30 updates/second, touch/small-screen rendering near 24; smaller meshes and raster buffers are used on compact devices. These are scheduling limits, not promised device-specific performance.

## Verification

`tests/motion_smoke.py` checks actual pixel changes (not only a running counter), pointer response, ripple response, pause/resume, reduced motion, dialog suspension, offscreen suspension, existing forms and content controls, and layout widths 320–1920px. It writes JSON and browser screenshots outside the source tree.

Local sandbox verification uses standalone HTML because the available browser blocks URL navigation. The GitHub verification workflow separately navigates the built HTTP site and the real public Pages URL. Check the workflow result and its screenshot artifact before claiming hosted verification. The initial local Flow 2 run passed 35 checks with no page errors; this is not a formal accessibility, privacy, security, or Core Web Vitals audit.
