import { readFile, writeFile, mkdir, rm, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

// Publish only the website allowlist, not development or review documents.
const root = fileURLToPath(new URL('.', import.meta.url));
const out = join(root, '_site');
const files = ['styles.css', 'icons.js', 'content.js', 'app.js', 'design.css', 'design.js', 'light.css', 'light.js',
  'assets/hero-light.webp', 'assets/equipment-light.webp', 'assets/manrope.ttf', 'assets/manrope-OFL.txt', 'assets/hardware.webp', 'assets/security.webp', 'assets/forest-river.webp', 'assets/logo.webp', 'assets/hero.webp', 'assets/forest.webp'];
await rm(out, { recursive: true, force: true });
await mkdir(join(out, 'assets'), { recursive: true });
await Promise.all(files.map(f => copyFile(join(root, f), join(out, f))));
let html = await readFile(join(root, 'index.html'), 'utf8');
// The light theme must be present; cinematic engines are intentionally retired.
if (!html.includes('light.css?v=6.0.0') || !html.includes('light.js?v=6.0.0')) throw new Error('Light theme assets are missing');
if (!html.includes('noindex,nofollow')) throw new Error('Executive preview must retain noindex.');
await writeFile(join(out, 'index.html'), html);
await writeFile(join(out, '.nojekyll'), '');
if (process.argv.includes('--standalone')) {
  for (const f of ['styles.css', 'design.css', 'light.css']) {
    const css = await readFile(join(root, f), 'utf8');
    html = html.replace(new RegExp(`<link rel="stylesheet" href="${f.replaceAll('.', '\\.')}(?:\\?[^"<>]*)?">`), () => `<style>${css}</style>`);
  }
  for (const f of ['icons.js', 'content.js', 'app.js', 'design.js', 'light.js']) {
    const script = await readFile(join(root, f), 'utf8');
    html = html.replace(new RegExp(`<script src="${f.replaceAll('.', '\\.')}(?:\\?[^"<>]*)?"></script>`), () => `<script>${script}</script>`);
  }
  for (const f of files.filter(f => f.endsWith('.webp'))) html = html.replaceAll(f, `data:image/webp;base64,${(await readFile(join(root, f))).toString('base64')}`);
  html = html.replaceAll('assets/manrope.ttf', `data:font/ttf;base64,${(await readFile(join(root, 'assets/manrope.ttf'))).toString('base64')}`);
  await mkdir(join(root, 'dist'), { recursive: true });
  await writeFile(join(root, 'dist', 'Phoenix_Tech_Refresh_Animated_Preview.html'), html);
}
console.log('Built _site with the complete homepage, light design and equipment imagery.');
