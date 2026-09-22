# Phoenix Tech Refresh

Executive-review website for **Phoenix Tech Refresh, an iT1 company**. Release **6.0.0** replaces the dark cinematic direction with a bright, equipment-led design inspired by the owner's Workwize reference.

## Website and publishing

https://carnagerogue.github.io/phoenix-tech-refresh/?v=6.0.0#top

GitHub Pages publishes `main` directly. The root homepage and static build load the same versioned light theme. Check the Pages deployment and **Verify light homepage and published site** workflow before treating a commit as live. The manual alternate publisher should not run concurrently.

`_config.yml` excludes development/review documents and retired cinematic engines from Pages. `noindex` is not authentication; this remains a publicly accessible executive preview.

## Local development

Node.js 20 or later, no runtime packages or credentials.

```sh
npm start
npm run check
npm run build
npm run standalone
```

The server runs at http://127.0.0.1:4173. The standalone preview is `dist/Phoenix_Tech_Refresh_Animated_Preview.html`.

## Current design

- White and pale-mint surfaces, teal actions, locally hosted Manrope typography.
- Physical equipment imagery replaces the particle logo and geometric chapters. No canvas engines, pinned scroll scenes, or pointer tracking load on the homepage.
- Gentle equipment motion has a manual pause, respects reduced motion, and suspends for offscreen content, dialogs and hidden tabs.
- Eight-service explorer, lifecycle tabs, portal demonstration, reuse, people, industries, resources, FAQ, and project inquiry remain functional.
- Security & compliance and customer outcome sections prominently explain what evidence matters. Certifications and case-study results are explicitly pending; no unverified badges, customer logos, metrics or endorsements are inserted.
- Reed's input brief: [docs/REED_CONTENT_BRIEF.md](docs/REED_CONTENT_BRIEF.md).

`styles.css` and `design.css` provide established controls and responsive layout; `light.css` owns the current visual theme. `light.js` controls modest equipment motion. `design.js` provides native scroll reveals and navigation feedback. Historical `motion.*`, `journey.*`, and their tests are retained as version-5 reference files but are not built, loaded, or run in current CI.

New equipment assets were generated with built-in Image Gen and converted to WebP. They are illustrative, not evidence of actual Phoenix equipment or facilities. Other concept imagery remains similarly illustrative. Manrope is distributed under the SIL Open Font License in `assets/manrope-OFL.txt`. No remote runtime fonts, analytics or advertising services load.

## Review boundaries

The client portal uses labeled synthetic data. There is no authenticated account or backend. Project requests prepare a local summary and an optional email draft; nothing is submitted automatically. Legal documents remain drafts, and Phoenix contact routing and production integrations still require owner decisions.

Certification names, applicable entities/sites, scope and expiry must be verified before publication. Customer results need source records, clear metric definitions, dates and publication permission. See the Reed content brief and `docs/LEGAL_REVIEW.md`.

## Browser tests

CI installs pinned Python Playwright as test tooling only and runs:

```sh
python tests/light_smoke.py --url http://127.0.0.1:4173 --output /tmp/phoenix-light-qa
python tests/redesign_smoke.py --url http://127.0.0.1:4173 --output /tmp/phoenix-flow-qa
```

The light suite also runs against the actual published Pages URL with `--wait-for-publish`. It covers theme visibility, physical imagery, pause/reduced motion, evidence notices, compliance controls, mobile layouts and footer access. The existing flow suite covers service browsing, inquiry validation/download, lifecycle navigation, portal filtering/export, resources and mobile menus. These are functional checks, not a formal accessibility or security audit.
