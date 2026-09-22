/* Daylight cinema: independent equipment, native-scroll camera, and a guided lifecycle. */
'use strict';
(() => {
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const control = document.querySelector('.gentle-motion');
  if (!hero || !control) return;

  // Motion is explicitly on by default for this cinematic preview. Every scene
  // shares a manual pause, including on devices requesting reduced OS motion.
  let paused = false;
  try { paused = sessionStorage.getItem('phoenix-motion') === 'paused'; } catch {}
  const equipment = hero.querySelector('.hero-equipment');
  const left = equipment.cloneNode(true);
  left.classList.add('hero-equipment-left');
  left.querySelector('img').removeAttribute('fetchpriority');
  equipment.after(left);
  const floating = document.createElement('button');
  floating.className = 'cinema-control';
  floating.type = 'button';
  floating.hidden = true;
  document.body.append(floating);

  const process = document.querySelector('#process');
  const tabs = [...document.querySelectorAll('[data-process]')];
  const walkthrough = document.createElement('button');
  walkthrough.className = 'walkthrough-control';
  walkthrough.type = 'button';
  process.querySelector('.process-tabs').before(walkthrough);
  let walkthroughPaused = false, elapsed = 0, lastTime = 0, frame = 0;
  const duration = 6500;
  const scenes = [...document.querySelectorAll('.hero,.services,.process,.portal-section,.reuse-section,.cta')];
  const visible = new Set();
  let blocked = false;
  let footerVisible = false;
  const canPlay = () => !paused && !blocked;
  const canTour = () => canPlay() && !walkthroughPaused && visible.has(process);

  function updateTourControl() {
    walkthrough.textContent = walkthroughPaused ? 'Play walkthrough' : 'Pause walkthrough';
    walkthrough.setAttribute('aria-pressed', String(walkthroughPaused));
    walkthrough.disabled = paused;
    process.dataset.walkthrough = canTour() ? 'playing' : 'paused';
  }
  function sync() {
    blocked = document.hidden || !!document.querySelector('dialog[open]');
    root.dataset.ambientMotion = paused ? 'paused' : 'running';
    root.dataset.motionIdle = blocked ? 'paused' : 'running';
    control.textContent = paused ? 'Resume motion' : 'Pause motion';
    floating.textContent = paused ? 'Play cinematic motion' : 'Pause cinematic motion';
    for (const button of [control, floating]) button.setAttribute('aria-pressed', String(paused));
    floating.hidden = visible.has(hero) || footerVisible || blocked || !!document.querySelector('.cookie-banner:not([hidden])');
    for (const scene of scenes) scene.dataset.sceneState = canPlay() && visible.has(scene) ? 'running' : 'paused';
    updateTourControl();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (canTour()) frame = requestAnimationFrame(tick);
  }
  function toggle() {
    paused = !paused;
    try { sessionStorage.setItem('phoenix-motion', paused ? 'paused' : 'running'); } catch {}
    sync();
    camera();
  }
  control.addEventListener('click', toggle);
  floating.addEventListener('click', toggle);
  walkthrough.addEventListener('click', () => { walkthroughPaused = !walkthroughPaused; sync(); });
  const stopTour = event => {
    if (!event.isTrusted) return;
    walkthroughPaused = true;
    elapsed = 0;
    process.style.setProperty('--tour-progress', '0');
    sync();
  };
  process.querySelector('.process-tabs').addEventListener('click', stopTour);
  process.querySelector('.process-tabs').addEventListener('keydown', stopTour);
  // Never change a panel while someone is reading it with keyboard focus.
  process.querySelector('.process-tabs').addEventListener('focusin', stopTour);
  function tick(time) {
    frame = 0;
    if (!canTour()) return;
    if (lastTime) elapsed += Math.min(time - lastTime, 100);
    lastTime = time;
    if (elapsed >= duration) {
      elapsed = 0;
      const current = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
      tabs[(current + 1) % tabs.length].click();
    }
    process.style.setProperty('--tour-progress', String(elapsed / duration));
    frame = requestAnimationFrame(tick);
  }

  // Event-driven camera moves retain native scrolling and never move controls.
  let cameraFrame = 0;
  function camera() {
    cameraFrame = 0;
    if (!canPlay()) return;
    const height = innerHeight;
    for (const scene of visible) {
      const bounds = scene.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (height / 2 - bounds.top - bounds.height / 2) / height));
      scene.style.setProperty('--camera-y', `${(progress * -42).toFixed(2)}px`);
      scene.style.setProperty('--camera-scale', (1 + Math.abs(progress) * .055).toFixed(4));
    }
  }
  function queueCamera() { if (!cameraFrame && canPlay()) cameraFrame = requestAnimationFrame(camera); }
  addEventListener('scroll', queueCamera, { passive: true });
  addEventListener('resize', queueCamera, { passive: true });
  document.addEventListener('visibilitychange', sync);
  const stateObserver = new MutationObserver(sync);
  document.querySelectorAll('dialog,.cookie-banner').forEach(element => stateObserver.observe(element, { attributes: true, attributeFilter: ['open', 'hidden'] }));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target.classList.contains('site-footer')) footerVisible = entry.isIntersecting;
        else if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      sync();
      camera();
    }, { threshold: 0 });
    [...scenes, document.querySelector('.site-footer')].forEach(scene => observer.observe(scene));
  } else scenes.forEach(scene => visible.add(scene));
  sync();
})();
