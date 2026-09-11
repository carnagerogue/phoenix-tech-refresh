# Implementation and visual review notes

> Historical notes from the initial offline handoff, before the motion enhancement and GitHub upload. See `MOTION_DESIGN.md` and `DEPLOYMENT.md` for the current build and hosting workflow.

## Deliverable boundary

This is the complete interactive desktop homepage preview, with responsive fallbacks and complete preview legal documents. It is not the entire multi-page production website. Services, resources, and legal details use native dialogs; legal documents have shareable hash routes. No public domain was deployed, no production repository files were overwritten, and no actual customer data was accessed or transmitted.

## Design source and intentional differences

Approved identity: Premium Corporate logo #2 from the supplied ten-logo board. The symbol is extracted from that approved artwork for the preview. A final vector brand master and licensed typography package remain separate production work.

Visual references: the generated full-page concept boards in the conversation and `docs/DESIGN_DIRECTION.md` in `carnagerogue/phoenix-tech-refresh` on `docs/project-foundation`. The only user-approved visual at this stage is the logo direction; the homepage is a proposal for executive approval.

A direct image review compared the generated reference, the approved mark, and the latest 1440px browser render. The website intentionally does not reproduce unverified content generated in the reference image.

| Comparison | Evidence / implementation | Intentional change or result |
|---|---|---|
| Brand | Silver/teal P, graphite header, Phoenix wordmark, iT1 ownership line. | Approved symbol retained; no phoenix bird or invented entity. |
| Hero copy | Code-native “Your technology’s next chapter. Handled.” and the primary refresh action. | Replaces generated headlines; matches the implementation brief. No decorative hero eyebrow. |
| Hero composition | Large left-aligned type and a separate technician image. | Split composition chosen for legibility, not a screenshot of a website as UI. |
| Palette | Graphite, clean white, cool neutral panels, controlled teal. | No cream shift, excessive neon, or whole-page gradient. |
| Proof | Scoped service details and a due-diligence request path. | Removed generated operating statistics, certification logos, customer logos, fake phone numbers, and testimonials. |
| Lifecycle | Six keyboard-operable steps with an explicitly illustrative evidence record. | Implements source-specified process rather than decorative icons only. |
| Portal | Real HTML controls and tables; four synthetic records, filtering, exports, and explicit demo labels. | No claim of an existing live portal. |
| Imagery | Cropped generated technician and forest imagery. | Both labeled as illustrative; not represented as real facility/staff photography. |
| Personal service | Project ownership, direct conversations, and parent contact paths. | No invented employees, response-time guarantees, or quoted customers. |
| Page continuity | Services → process → reporting → reuse → relationship → industry → resources → FAQ → contact → legal. | Full homepage rather than a hero-only handoff. |
| Legal and cookies | Working dialogs, accessible controls, scoped policy drafts, zero optional vendors. | New code-native functionality required by the user; no inaccurate copied vendor inventory. |
| Responsive rendering | 1920, 1440, 1280, 768, 390, and 320px review widths. | No horizontal overflow observed. |

Above-the-fold copy review: the final hero/header copy matches the implemented brief and contains no generated customer/metric/certification proof. The photography's logo text is part of the asset. No unresolved clipping, missing images, navigation failures, or form-state failures were observed in the final tested render. Final executive design approval remains pending.

## Browser verification method and limitations

The Browser plugin was not available. Playwright used the existing Chromium executable. Managed browser policy blocked local HTTP and file navigation; the standalone HTML was rendered through `set_content`. No administrative restrictions were changed. Request capture showed no HTTP calls. All visible assets were eagerly loaded for final full-page screenshots; normal source uses lazy loading below the fold.

Storage signal/restoration tests used an explicit local-storage fixture because the rendering origin was opaque. Blocked-storage behavior was also tested. Cross-visit native file-origin storage, WebKit/Safari, Firefox, real email-app launch, hosted security behavior, production analytics gating, and formal assistive-technology conformance are not certified by these checks. The optional local server's headers were inspected via a local HTTP request; the browser could not navigate to that server.

No current Core Web Vitals or Lighthouse score is claimed. No production security review, privacy-law opinion, penetration test, or accessibility conformance audit has been completed.

## Production transition

Keep the planned Next.js/React/TypeScript architecture. Break the page into a global shell, server-rendered editorial sections, and focused interactive islands. Use server-side validation, real submission acknowledgments only after backend success, rate limiting, approved anti-spam controls, and a secrets-managed CRM adapter. Do not place CRM secrets in frontend code.

For a future portal, confirm the ERP source of truth, tenant boundaries, authenticated roles, backend authorization, audit logging, identity provider, document-access controls, and retention. The sample data must not become production defaults.

Replace hash-based policy previews with the planned `/legal/privacy`, `/legal/terms`, `/legal/cookies`, and `/legal/accessibility` routes. Add metadata, canonical URLs, and structured data only after the production domain and verified company information are approved. Remove `noindex` only at the approved public launch.

Any new tracking technology needs a real vendor inventory and a tested consent loader, including signal precedence and withdrawal. Do not treat this preview's stored optional preferences as permission for an undisclosed future vendor; version and re-request consent as appropriate following legal review.
