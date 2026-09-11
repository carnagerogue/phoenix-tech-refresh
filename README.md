# Phoenix Tech Refresh

Complete executive-review homepage for **Phoenix Tech Refresh, an iT1 company**. The approved Premium Corporate #2 logo anchors a graphite, silver, white, and teal identity, with the original **Phoenix Flow** interactive background.

## View the website

GitHub Pages is prepared through `.github/workflows/pages.yml`. A repository administrator must enable **Settings → Pages → Build and deployment → Source: GitHub Actions**. Then run **Publish executive preview** from the Actions tab. The workflow's deployment output is the authoritative live URL; a committed workflow alone does not mean a site is live.

Expected project URL after successful deployment:

`https://carnagerogue.github.io/phoenix-tech-refresh/`

The source repository remains private. GitHub Pages from a private personal repository requires an eligible GitHub plan, and the published Pages site is normally public. This workflow never changes repository visibility. Executive-preview labels and `noindex` discourage indexing but are not authentication or access control.

## Local preview

Node.js 20 or later; no packages, credentials, or dependency installation required.

```sh
npm start
```

Open `http://127.0.0.1:4173`. The server builds and serves `_site`, not the source template.

```sh
npm run check       # JavaScript syntax checks
npm run build       # Complete static site in _site/
npm run standalone  # Also creates dist/Phoenix_Tech_Refresh_Animated_Preview.html
```

The standalone HTML includes all styles, scripts, images, and animation for offline executive review. Open that file in a current desktop browser. The repository-root `index.html` is the original source template: the build adds `motion.css` and `motion.js` without changing its content or layout.

## Included experience

- Complete desktop-first homepage, approved logo, and iT1 parent identification.
- Eight services, six lifecycle stages, six industry perspectives, three editorial guides, FAQs, and inquiry flow.
- Synthetic client-portal records with search, status filtering, CSV exports, and sample documents.
- Privacy, Terms of Use, Cookie Policy, Accessibility, and preference controls.
- Phoenix Flow: local Canvas artwork with slow teal/silver ribbons, pointer response, background-click/tap pulses, and scroll-responsive curvature in the hero, lifecycle, and closing invitation.
- Pause/resume control; OS reduced-motion alternative; suspended rendering offscreen, behind dialogs, and when the tab is hidden.

## Boundaries

This is the full interactive homepage preview, **not the full multi-page production release, an authenticated portal, or a connected CRM**. Inquiries are prepared in the browser, not submitted. Email drafts open only on an explicit user action. Demonstration assets and recovery values are synthetic; imagery is illustrative. No customer logos, certifications, testimonials, operating statistics, or environmental-performance results have been invented.

Legal content remains an iT1-review draft. The animation adds no analytics, cookies, identifiers, or remote dependencies. The eventual hosting provider may process access logs independently of this client code. Confirm hosting and the rest of the actual production data inventory before adopting a final policy.

## Source map

- `index.html`, `styles.css`: original homepage structure and visual system.
- `content.js`, `icons.js`, `app.js`: content, interface icons, forms, dialogs, portal examples, privacy logic.
- `motion.js`, `motion.css`: additive interactive artwork and accessible controls.
- `assets/`: local logo and illustrative photos.
- `build.mjs`: dependency-free, allowlisted static build and offline export.
- `serve.mjs`: localhost-only preview server.
- `docs/`: original project foundation, legal review, presentation notes, motion specification, and deployment instructions.

Only the allowlisted `_site` output is published. Internal planning and review documents are excluded from the Pages artifact.

## Verification and next phase

The animated standalone build passed 35 Playwright/Chromium checks, covering motion lifecycle, pause/resume, reduced-motion updates, dialogs, navigation, forms, portal filtering/export, legal documents, and layout widths of 320, 390, 768, 1280, 1440, and 1920 pixels. The Browser plugin was unavailable; managed Chromium blocked HTTP/file navigation, so tests rendered the bundled HTML with `set_content`. Native hosted persistence, other browser engines, and actual public deployment behavior require separate verification. These results are not an accessibility certification, a security audit, or a Core Web Vitals score.

The planned Next.js/React/TypeScript production architecture remains documented in `docs/TECHNICAL_ARCHITECTURE.md`. Move this approved experience into that architecture when production implementation is authorized.
