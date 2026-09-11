# Website deployment

## Current publishing mode

GitHub's branch-based Pages workflow publishes `main`. This was confirmed from successful workflow run 34566459023, which ran Build with Jekyll and deployed the source homepage. The root `index.html` now directly loads the versioned motion stylesheet and script, fixing the previous dependency on build-time insertion.

No Pages settings or repository visibility changes are required for this animation update. The owner controls those settings. The alternate custom Pages workflow is manual-only to avoid two automatic publishers competing for the same environment.

## Public website

https://carnagerogue.github.io/phoenix-tech-refresh/

After a push, check the Pages deployment for that commit and the Verify homepage and published motion workflow. The latter waits for the versioned animation imports, then opens the real website in Chromium and verifies actual changing pixels, pointer/click interaction, pause/resume, reduced motion, dialogs, core controls, and responsive layouts. Screenshots and JSON results are stored in the workflow artifact `phoenix-motion-browser-evidence` for seven days.

The website is an executive preview. Noindex discourages indexing but provides no authentication. Do not publish sensitive client records or confidential documents. The Jekyll configuration excludes development and review documentation from website routes; the explicit Node build allowlist does the same for `_site`.

## Optional future Actions-source publishing

When intentionally switching the repository's Pages source to GitHub Actions, use the manual Publish executive preview workflow to deploy `_site`. Re-enable its push trigger only as part of that source change. Both source and built entry points contain the same animation imports.

## Production boundaries

The portal, project form, company claims, and legal policy drafts retain their existing executive-preview limitations. Hosting the page does not connect a CRM, authenticate users, approve legal content, or complete the multi-page production website.
