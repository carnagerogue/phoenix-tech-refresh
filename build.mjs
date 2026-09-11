import { readFile, writeFile, mkdir, rm, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

// Publish an explicit allowlist. Internal planning/legal-review documents stay private.
const root = fileURLToPath(new URL('.', import.meta.url));
const out = join(root, '_site');
const files = ['styles.css', 'icons.js', 'content.js', 'app.js', 'motion.css', 'motion.js',
  'assets/logo.webp', 'assets/hero.webp', 'assets/forest.webp'];
await rm(out, { recursive: true, force: true });
await mkdir(join(out, 'assets'), { recursive: true });
await Promise.all(files.map(f => copyFile(join(root, f), join(out, f))));
let html = await readFile(join(root, 'index.html'), 'utf8');
// Keep the original review document as the source template. Add the motion enhancement here.
if (!html.includes('href="motion.css"')) html = html.replace('</head>', '<link rel="stylesheet" href="motion.css"></head>');
if (!html.includes('src="motion.js"')) html = html.replace('</body>', '<script src="motion.js"></script></body>');
if (!html.includes('noindex,nofollow')) throw new Error('Executive preview must retain noindex.');
await writeFile(join(out, 'index.html'), html);
await writeFile(join(out, '.nojekyll'), '');
if (process.argv.includes('--standalone')) {
  for (const f of ['styles.css', 'motion.css']) {
    const css = await readFile(join(root, f), 'utf8');
    html = html.replace(`<link rel="stylesheet" href="${f}">`, () => `<style>${css}</style>`);
  }
  for (const f of ['icons.js', 'content.js', 'app.js', 'motion.js']) {
    const script = await readFile(join(root, f), 'utf8');
    html = html.replace(`<script src="${f}"></script>`, () => `<script>${script}</script>`);
  }
  for (const f of files.filter(f => f.endsWith('.webp'))) html = html.replaceAll(f, `data:image/webp;base64,${(await readFile(join(root, f))).toString('base64')}`);
  await mkdir(join(root, 'dist'), { recursive: true });
  await writeFile(join(root, 'dist', 'Phoenix_Tech_Refresh_Animated_Preview.html'), html);
}
console.log('Built _site with the complete homepage, original assets, and Phoenix Flow.');
