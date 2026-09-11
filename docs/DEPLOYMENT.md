# GitHub Pages deployment

This repository contains the complete static executive-review homepage, not just a README or project plan. `_site` is the publishing artifact; source and internal documents remain separate.

## One-time administrator setting

1. Open `https://github.com/carnagerogue/phoenix-tech-refresh/settings/pages`.
2. Under Build and deployment, select **GitHub Actions** as Source.
3. Open Actions → **Publish executive preview** → Run workflow on `main`.
4. Wait for both build and deploy to succeed. Open the URL in the `github-pages` deployment.

Expected URL: `https://carnagerogue.github.io/phoenix-tech-refresh/`.

Do not treat the expected URL as proof of deployment. Check the actual successful deployment output. A missing-site error in Configure Pages usually means step 2 has not been completed or the account/repository is not eligible.

## Repository visibility and privacy

The workflow does not change the repository from private to public. GitHub Pages for private personal repositories needs an eligible paid plan. Do not change source visibility merely to remove this restriction without the owner's explicit approval.

A public Pages deployment is accessible to visitors even when its source repository is private. `noindex,nofollow`, executive-preview labels, and an unadvertised link do not restrict access. No production customer data or credentials belong in this preview.

The build copies only HTML, CSS, JavaScript, and the three website image assets. It does not publish `docs`, Git history, environment files, or other repository content. The exposed legal dialogs are explicitly review drafts.

## Automatic updates

A push to `main` triggers the workflow after initial enablement. Third-party actions are pinned to verified commit SHAs. Only the deployment job has Pages-write and identity-token permissions; neither job has repository-content write permission. No custom secret or personal token is required for an already-enabled Pages site.

GitHub Pages is static hosting. It does not connect the sample portal to real customer data or convert the local inquiry flow into a submitted quote. Local-server security headers are not automatically applied by Pages. Review the actual hosting data practices and controls before a production release.

## Offline fallback

Run `npm run standalone` and open `dist/Phoenix_Tech_Refresh_Animated_Preview.html` in a browser. No network or installation is required by that exported file.

## Official references

- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://github.com/actions/configure-pages/blob/main/action.yml
