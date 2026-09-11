/* Phoenix Flow — original, local-only ambient artwork. No third-party runtime. */
'use strict';
(() => {
  if (window.PTR_MOTION || !document.querySelector('.hero')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const TAU = Math.PI * 2;
  let paused = false, frame = 0, last = 0, time = 8, draws = 0;
  let pageVisible = !document.hidden, modalOpen = false;
  const scenes = [];
  const hero = document.querySelector('.hero');
  const control = document.createElement('button');
  control.type = 'button';
  control.className = 'motion-control';
  control.setAttribute('aria-label', 'Pause ambient background animation');
  hero.append(control);
  const symbol = playing => `<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${playing ? '<path d="M7 5v10M13 5v10"/>' : '<path d="m7 4 8 6-8 6V4Z"/>'}</svg>`;
  function updateControl() {
    const playing = !paused && !reduced.matches;
    control.innerHTML = symbol(playing) + `<span>${reduced.matches ? 'Reduced motion' : playing ? 'Pause motion' : 'Resume motion'}</span>`;
    control.disabled = reduced.matches;
    control.setAttribute('aria-pressed', String(paused || reduced.matches));
    control.setAttribute('aria-label', reduced.matches ? 'Ambient animation disabled by your reduced-motion preference' : playing ? 'Pause ambient background animation' : 'Resume ambient background animation');
    document.documentElement.dataset.ambientMotion = reduced.matches ? 'reduced' : paused ? 'paused' : 'playing';
  }
  function isRunning() { return !paused && !reduced.matches && pageVisible && !modalOpen; }
  function start() { if (!frame && isRunning() && scenes.some(s => s.visible)) { last = 0; frame = requestAnimationFrame(tick); } }
  function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
  function sync() { updateControl(); if (isRunning()) start(); else stop(); }
  control.addEventListener('click', () => { paused = !paused; sync(); });
  function resize(s) {
    const r = s.host.getBoundingClientRect();
    s.w = Math.max(1, r.width); s.h = Math.max(1, r.height); s.rect = r;
    const dpr = Math.min(devicePixelRatio || 1, coarse.matches ? 1 : 1.5, 2400 / s.w);
    s.canvas.width = Math.round(s.w * dpr); s.canvas.height = Math.round(s.h * dpr);
    s.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    s.compact = coarse.matches || s.w < 760;
    draw(s, time);
  }
  function glow(ctx, x, y, radius, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, radius));
    g.addColorStop(0, color); g.addColorStop(1, 'rgba(26,122,108,0)');
    ctx.fillStyle = g; ctx.fillRect(x-radius, y-radius, radius*2, radius*2);
  }
  // Smooth projected filaments: a folded ribbon, not a video or a particle preset.
  function ribbon(s, t, band) {
    const c = s.ctx, w = s.w, h = s.h;
    const lines = s.compact ? 26 : 64;
    const segments = s.compact ? 68 : 125;
    const phase = t * 0.105 + band * 1.8 + s.phase;
    const scroll = s.progress * 0.38;
    const opacity = s.kind === 'hero' ? 1 : s.kind === 'process' ? 0.50 : 0.8;
    for (let j=0; j<lines; j++) {
      const f = j / (lines-1), v = (f-0.5);
      const shine = Math.pow(Math.max(0, Math.cos(f*TAU*1.15 + phase*.45)), 14);
      const edge = Math.pow(Math.abs(v)*2, 6);
      const a = (0.055 + shine*.34 + edge*.12) * opacity;
      const silver = band === 1 || shine > 0.45;
      const g = c.createLinearGradient(w*.08, h*.72, w, h*.25);
      g.addColorStop(0, `rgba(44,126,117,${a*.12})`);
      g.addColorStop(.42, `rgba(57,172,155,${a*.66})`);
      g.addColorStop(.76, silver ? `rgba(209,235,226,${a})` : `rgba(85,218,190,${a})`);
      g.addColorStop(1, `rgba(36,111,105,${a*.12})`);
      c.strokeStyle = g; c.lineWidth = 0.7 + shine*.9; c.beginPath();
      for (let k=0; k<=segments; k++) {
        const u = k / segments;
        let x = (u * 1.28 - .12) * w;
        const bend = Math.sin(u*5.1 - phase*.34 + band*1.15);
        const fold = Math.cos(u*4.4 + phase*.27 + scroll);
        let y = h*(band === 0 ? .81 : .27) + h*.24*bend;
        y += v*h*(.15 + .33*Math.pow(Math.sin(u*3.5 + phase*.16), 2))*fold;
        y += h*.075*Math.sin(u*9.2 + phase + v*2.8);
        x += v*w*.035*Math.sin(u*4.1 + phase*.36);
        x += (s.px-.5)*26*Math.sin(u*Math.PI);
        y += (s.py-.5)*22*Math.sin(u*Math.PI);
        const dx = x-s.px*w, dy = y-s.py*h;
        const radius = Math.max(180, Math.min(w*.24, 390));
        const proximity = Math.exp(-(dx*dx+dy*dy)/(radius*radius));
        y += proximity*s.presence*(28*Math.sin(u*8-phase)+s.impulse*38*Math.sin(u*14-phase));
        if (k===0) c.moveTo(x,y); else c.lineTo(x,y);
      }
      c.stroke();
    }
  }
  function draw(s, t) {
    const c = s.ctx, w=s.w, h=s.h;
    if (!w || !h) return;
    c.clearRect(0,0,w,h);
    const still = reduced.matches;
    const tt = still ? 8 : t;
    c.globalCompositeOperation = 'source-over';
    glow(c,w*.76,h*.50,Math.max(w*.46,h*.7),'rgba(30,91,81,0.13)');
    if (!still && s.presence>.02) glow(c,s.px*w,s.py*h,260,`rgba(58,173,149,${.045*s.presence})`);
    c.globalCompositeOperation = 'screen';
    ribbon(s,tt,0); ribbon(s,tt,1);
    // A few moving glints along the weave, quiet enough to remain peripheral.
    if (!s.compact) {
      for(let n=0;n<18;n++) {
        const u=((n*.061+tt*.0025+s.phase*.03)%1.1)-.05;
        const x=u*w, y=h*(.8+.24*Math.sin(u*5.1-tt*.035));
        const alpha=.12+.12*Math.sin(n*2.3+tt*.5);
        c.fillStyle=`rgba(164,222,204,${alpha})`; c.beginPath(); c.arc(x,y,n%4===0?1.1:.65,0,TAU); c.fill();
      }
    }
    c.globalCompositeOperation = 'source-over';
    s.canvas.dataset.frames = String(++s.frames); draws++;
  }
  function tick(now) {
    frame=0;
    if (!isRunning()) return;
    if (last && now-last<32) { frame=requestAnimationFrame(tick); return; }
    const dt=last?Math.min((now-last)/1000,.08):1/30; last=now; time+=dt;
    for(const s of scenes) {
      if(!s.visible) continue;
      const lerp=1-Math.exp(-dt*3.8);
      s.px+=(s.tx-s.px)*lerp; s.py+=(s.ty-s.py)*lerp;
      s.presence+=(s.hover-s.presence)*lerp;
      s.impulse*=Math.exp(-dt*1.6);
      draw(s,time);
    }
    if(scenes.some(s=>s.visible)) frame=requestAnimationFrame(tick);
  }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries=>{
    for(const e of entries) { const s=scenes.find(s=>s.host===e.target); if(s) s.visible=e.isIntersecting; }
    if(scenes.some(s=>s.visible)) start(); else stop();
  },{threshold:0.01}) : null;
  for(const [selector,kind,phase] of [['.hero','hero',0],['#process','process',1.3],['#contact','contact',2.6]]) {
    const host=document.querySelector(selector); if(!host) continue;
    const canvas=document.createElement('canvas'); canvas.className='ambient-canvas';
    canvas.setAttribute('aria-hidden','true'); canvas.setAttribute('role','presentation');
    const ctx=canvas.getContext('2d',{alpha:true}); if(!ctx) continue;
    host.classList.add('ambient-scene'); host.prepend(canvas);
    const s={host,canvas,ctx,kind,phase,w:0,h:0,px:.72,py:.48,tx:.72,ty:.48,hover:0,presence:0,impulse:0,progress:0,visible:true,frames:0,rect:null};
    scenes.push(s); resize(s);
    host.addEventListener('pointermove',e=>{
      if(!isRunning() || e.pointerType==='touch') return;
      const r=s.rect||host.getBoundingClientRect();
      s.tx=clamp((e.clientX-r.left)/r.width,0,1); s.ty=clamp((e.clientY-r.top)/r.height,0,1); s.hover=1;
    },{passive:true});
    host.addEventListener('pointerleave',()=>{s.tx=.72;s.ty=.48;s.hover=0;},{passive:true});
    host.addEventListener('pointerdown',e=>{
      if(!isRunning() || e.target.closest('a,button,input,select,textarea,dialog,summary')) return;
      const r=s.rect||host.getBoundingClientRect();
      s.tx=clamp((e.clientX-r.left)/r.width,0,1);s.ty=clamp((e.clientY-r.top)/r.height,0,1);s.impulse=1;s.hover=1;
    },{passive:true});
    host.addEventListener('pointerup',e=>{if(e.pointerType==='touch')s.hover=0;},{passive:true});
    if(observer) observer.observe(host);
    if('ResizeObserver' in window) { const ro=new ResizeObserver(()=>resize(s)); ro.observe(host); }
  }
  let scrollQueued=false;
  addEventListener('scroll',()=>{
    if(scrollQueued) return; scrollQueued=true;
    requestAnimationFrame(()=>{scrollQueued=false; for(const s of scenes){s.rect=s.host.getBoundingClientRect();s.progress=clamp((innerHeight-s.rect.top)/(innerHeight+s.h),0,1);}});
  },{passive:true});
  if(!('ResizeObserver' in window)) addEventListener('resize',()=>scenes.forEach(resize),{passive:true});
  document.addEventListener('visibilitychange',()=>{pageVisible=!document.hidden;sync();});
  const modalObserver=new MutationObserver(()=>{modalOpen=Boolean(document.querySelector('dialog[open]'));sync();});
  document.querySelectorAll('dialog').forEach(d=>modalObserver.observe(d,{attributes:true,attributeFilter:['open']}));
  reduced.addEventListener('change',()=>{sync();scenes.forEach(s=>draw(s,time));});
  coarse.addEventListener('change',()=>scenes.forEach(resize));
  addEventListener('pagehide',stop);
  addEventListener('pageshow',sync);
  window.PTR_MOTION={
    pause(){paused=true;sync();},resume(){paused=false;sync();},
    get status(){return {paused,reduced:reduced.matches,running:isRunning()&&Boolean(frame),frames:draws,scenes:scenes.length,active:scenes.filter(s=>s.visible).length};}
  };
  if(!scenes.length){control.hidden=true;return;}
  sync();
})();
