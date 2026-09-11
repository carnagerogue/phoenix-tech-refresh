# Phoenix Tech Refresh

Complete executive-review homepage for **Phoenix Tech Refresh, an iT1 company**, with the approved Premium Corporate #2 identity and the original interactive **Phoenix Galaxy** background.

## Website

https://carnagerogue.github.io/phoenix-tech-refresh/

The current branch-based GitHub Pages configuration publishes `main` directly. The root homepage explicitly includes versioned `motion.css` and `motion.js`. The static build validates those same imports, so the source and built websites cannot silently diverge into animated and non-animated versions.

Check the successful Pages deployment and **Verify homepage and published motion** workflow before treating a source commit as live. That verification workflow tests actual rendered pixel changes, particle interaction, pause/resume, autoplay with reduced motion enabled, and existing website controls on both a local HTTP build and the real Pages URL. Browser evidence is saved as a workflow artifact.

The alternate `.github/workflows/pages.yml` publisher is manual-only for an eventual switch to GitHub Actions as the Pages source. Do not run competing publishing methods concurrently. `_config.yml` excludes development and review documents from the branch-published website. Repository visibility is controlled by the owner and is not changed by these workflows. `noindex` is not access control; the executive preview is not authenticated.

## Local development

Node.js 20 or later. No runtime packages, credentials, or installation are required.

```sh
npm start          # Build and serve at http://127.0.0.1:4173
npm run check      # JavaScript syntax checks
npm run build      # Complete static site in _site/
npm run standalone # Self-contained offline HTML in dist/
```

The original copy, content, illustrations, cookies, and legal review drafts remain in place. The hero gives the dimensional artwork room to breathe, with the technician illustration retained as a small supporting tile. See `docs/MOTION_DESIGN.md` for the published-animation fix and intentional design changes.

## Included experience

- Approved Premium Corporate #2 logo and iT1 parent-company identification.
- Eight services, six-step lifecycle, industry perspectives, resource guides, and FAQs.
- Synthetic client-portal records, asset search, document examples, and sample exports.
- Local-only project summary with validation; email draft opens only on user action.
- Working privacy preferences, no installed analytics or advertising vendors.
- Privacy, Terms of Use, Cookie Policy, and Accessibility review drafts.
- Animated galaxy of silver and teal pixels sampled from the approved logo, with drifting stars and nebula light. Mouse/touch scatters the pixels, which spring back into the mark. Autoplay starts on every load, including reduced-motion browsers; manual pause and offscreen/dialog/hidden-tab suspension remain available.

## Scope and launch gates

This is the working executive homepage, not the proposed multi-page Next.js production release. There is no live CRM, authenticated portal, client database, or submission endpoint. Demonstration records are synthetic; illustrations are not proof of actual facilities or employees. No new certifications, operating statistics, customer endorsements, or environmental outcomes are asserted by this animation update.

Legal documents remain drafts. iT1 must approve the operator/controller, domain, contacts, vendor inventory, retention, request routing, and final policies before production. See `docs/LEGAL_REVIEW.md` and the original project-foundation documents.

## Browser tests

The website has no Playwright runtime dependency. CI installs pinned Python Playwright solely for verification. To run the same checks in a test environment with Playwright installed:

```sh
python tests/motion_smoke.py --url http://127.0.0.1:4173 --output /tmp/phoenix-qa
```

Verification navigates both the local HTTP build and the published GitHub Pages site. Passing these checks is not a formal accessibility, security, privacy, or Core Web Vitals audit.
