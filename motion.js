/* Phoenix Flow 2 — a sculpted, reflective lifecycle ribbon.
 * Local canvas rendering only: no network, dependencies, tracking or persistence.
 * Explicit imports in index.html support both branch Pages and the static build.
 */
'use strict';
(() => {
  if (window.PTR_MOTION || !document.querySelector('.hero')) return;
  const VERSION = '2.0.0';
  const TAU = Math.PI * 2;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const mix = (a, b, t) => a + (b - a) * t;
  const normalize = a => { const l = Math.hypot(...a) || 1; return a.map(n => n / l); };
  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const dot = (a, b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const interactive = 'a,button,input,select,textarea,dialog,summary,[role="tab"]';
  let time = 11, frame = 0, last = 0, draws = 0, userPaused = false;
  let modalOpen = Boolean(document.querySelector('dialog[open]'));
  let visiblePage = !document.hidden;
  const scenes = [], cleanups = [];
  const keyLight = normalize([-0.7, -0.65, 1.4]);
  const fillLight = normalize([0.8, 0.2, 0.65]);
  const view = [0,0,1];
  const halfLight = normalize(keyLight.map((v,i)=>v+view[i]));

  // A small, keyboard-accessible control is never captured by the artwork.
  const control = document.createElement('button');
  control.className = 'motion-control'; control.type = 'button';
  const controlIcon = playing => `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${playing ? '<path d="M7 5v10M13 5v10"/>' : '<path d="m7 4 8 6-8 6V4Z"/>'}</svg>`;
  function updateControl() {
    const playing = !userPaused && !reduced.matches;
    control.innerHTML = controlIcon(playing) + `<span>${reduced.matches ? 'Reduced motion' : playing ? 'Pause motion' : 'Resume motion'}</span>`;
    control.disabled = reduced.matches;
    control.setAttribute('aria-pressed', String(!playing));
    control.setAttribute('aria-label', reduced.matches ? 'Ambient animation respects your reduced-motion preference' : playing ? 'Pause ambient background animation' : 'Resume ambient background animation');
    document.documentElement.dataset.ambientMotion = reduced.matches ? 'reduced' : userPaused ? 'paused' : 'playing';
  }
  const allowed = () => !userPaused && !reduced.matches && visiblePage && !modalOpen;
  function start() { if (!frame && allowed() && scenes.some(s=>s.visible)) {last=0;frame=requestAnimationFrame(tick);} }
  function stop() { cancelAnimationFrame(frame);frame=0;last=0; }
  function sync() { updateControl();if(allowed())start();else stop(); }
  control.addEventListener('click',()=>{userPaused=!userPaused;sync();});

  function rotation(p, angles) {
    const [cx,sx,cy,sy,cz,sz] = angles;
    let y=p[1]*cx-p[2]*sx, z=p[1]*sx+p[2]*cx;
    let x=p[0]*cy+z*sy; z=-p[0]*sy+z*cy;
    return [x*cz-y*sz,x*sz+y*cz,z];
  }
  function getAngles(x,y,z){return [Math.cos(x),Math.sin(x),Math.cos(y),Math.sin(y),Math.cos(z),Math.sin(z)];}

  // Analytic ribbon: a continuous three-dimensional surface, with actual normals
  // and perspective rather than a flat particle/line preset. Periodic deformations
  // travel around the loop; the pointer orbits it and a tap launches a soft wave.
  function surface(u,v,t,s,band) {
    const breath = Math.sin(t*.31+u*3)*.045;
    const theta = u + .075*Math.sin(u*2-t*.17);
    const twist = u*1.5 + .30*Math.sin(u*2+t*.18) + .16*Math.sin(t*.22);
    const width = (band ? .18 : .39) * (1+.16*Math.cos(u*2-t*.2));
    const radius = 1.17 + .085*Math.sin(u*3+t*.21) + (band ? .13 : 0);
    const ripple = s.energy * .14 * Math.cos(u*5-s.wave*3.8) * Math.exp(-s.wave*.22);
    const r = radius + v*width*Math.cos(twist) + breath + ripple;
    return [r*Math.cos(theta)*1.16,r*Math.sin(theta)*.88,v*width*Math.sin(twist)+.15*Math.sin(u*2-t*.19)+(band?-.13:0)];
  }
  function metal(normal,v,u,t,band) {
    let n = normal;
    if(n[2]<0)n=n.map(x=>-x);
    const diffuse = Math.max(0,dot(n,keyLight));
    const fill = Math.max(0,dot(n,fillLight));
    const specular = Math.pow(Math.max(0,dot(n,halfLight)),34);
    const fresnel = Math.pow(1-Math.max(0,n[2]),2.5);
    // Broad environment reflections give satin metal its volume. A narrow softbox
    // reflection and a teal rim create a distinct edge without using bloom filters.
    const env = Math.pow(Math.max(0,Math.cos(n[0]*2.7+n[1]*1.9-.5)),8);
    const strip = Math.pow(Math.max(0,Math.cos(n[0]*5.1-n[1]*1.3+.4)),38);
    const teal = clamp(.46 + .52*Math.sin(u*1.05+t*.08) + (band?.35:0) - v*.25,0,1);
    const light = .17 + diffuse*.40 + fill*.12 + env*.47;
    const base = [mix(194,7,teal),mix(210,141,teal),mix(219,130,teal)];
    const brightness = 1;
    return base.map((c,i)=>Math.round(clamp(c*light*brightness+specular*170+strip*65+fresnel*[21,91,83][i],0,255)));
  }
  function renderSculpture(s,t) {
    const c=s.ctx,w=s.w,h=s.h,mobile=w<760;
    const art=s.art;
    const scale=s.kind==='hero' && art ? Math.min(art.w/3.8,(art.h-108)/2.95) : Math.min(w*.19,h*.49,210);
    const centerX=s.kind==='hero' && art ? art.x+art.w*.50 : w*.83;
    const centerY=s.kind==='hero' && art ? art.y+(art.h-108)*.46 : h*.43;
    const angles=getAngles(.33+Math.sin(t*.15)*.19+(s.py-.5)*.32,-.32+Math.sin(t*.12)*.29+(s.px-.5)*.65,-.56+Math.sin(t*.13)*.14+s.scroll*.18);
    const size=s.compact?420:720;
    if(!s.raster || s.raster.size!==size){
      const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
      const ctx=canvas.getContext('2d');
      s.raster={canvas,ctx,size,image:ctx.createImageData(size,size),depth:new Float32Array(size*size)};
    }
    const raster=s.raster,data=raster.image.data,zbuf=raster.depth;
    data.fill(0);zbuf.fill(-100);
    const N=s.compact?140:224,M=s.compact?20:34, zoom=size/4.4;
    const project=p=>{const k=4.9/(4.9-p[2]);return [size*.5+p[0]*zoom*k,size*.5+p[1]*zoom*k,p[2]];};
    // Gouraud rasterization: smooth per-vertex reflections and a depth buffer.
    // It avoids the visibly faceted, flat-filled polygons of a basic canvas mesh.
    // Works even when hardware acceleration or WebGL is unavailable.
    function triangle(a,b,c) {
      let den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
      if(Math.abs(den)<.001)return;
      const minX=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),maxX=Math.min(size-1,Math.ceil(Math.max(a[0],b[0],c[0])));
      const minY=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),maxY=Math.min(size-1,Math.ceil(Math.max(a[1],b[1],c[1])));
      const ax=(b[1]-c[1])/den,ay=(c[0]-b[0])/den,bx=(c[1]-a[1])/den,by=(a[0]-c[0])/den;
      const zA=a[2]-c[2],zB=b[2]-c[2],rA=a[3]-c[3],rB=b[3]-c[3],gA=a[4]-c[4],gB=b[4]-c[4],bA=a[5]-c[5],bB=b[5]-c[5];
      let rowA=ax*(minX+.5-c[0])+ay*(minY+.5-c[1]),rowB=bx*(minX+.5-c[0])+by*(minY+.5-c[1]);
      for(let y=minY;y<=maxY;y++,rowA+=ay,rowB+=by){
        let wa=rowA,wb=rowB,offset=y*size+minX;
        for(let x=minX;x<=maxX;x++,offset++,wa+=ax,wb+=bx){
          if(wa<-.001||wb<-.001||wa+wb>1.001)continue;
          const z=c[2]+wa*zA+wb*zB;if(z<=zbuf[offset])continue;zbuf[offset]=z;
          const i=offset*4;data[i]=c[3]+wa*rA+wb*rB;data[i+1]=c[4]+wa*gA+wb*gB;data[i+2]=c[5]+wa*bA+wb*bB;data[i+3]=255;
        }
      }
    }
    for(let band=0;band<1;band++){
      const grid=[];
      for(let i=0;i<=N;i++){
        const row=[];for(let j=0;j<=M;j++)row.push(rotation(surface(i/N*TAU,j/M*2-1,t,s,band),angles));grid.push(row);
      }
      const verts=[];
      for(let i=0;i<=N;i++){
        const row=[];
        for(let j=0;j<=M;j++){
          const a=grid[Math.max(0,i-1)][j],b=grid[Math.min(N,i+1)][j],d=grid[i][Math.max(0,j-1)],e=grid[i][Math.min(M,j+1)];
          const n=normalize(cross(b.map((x,k)=>x-a[k]),e.map((x,k)=>x-d[k])));
          const col=metal(n,j/M*2-1,i/N*TAU,t,band);
          row.push([...project(grid[i][j]),...col]);
        }verts.push(row);
      }
      for(let i=0;i<N;i++)for(let j=0;j<M;j++){
        const a=verts[i][j],b=verts[i+1][j],c=verts[i+1][j+1],d=verts[i][j+1];triangle(a,b,c);triangle(a,c,d);
      }
    }
    raster.ctx.putImageData(raster.image,0,0);
    c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
    const extent=scale*4.4;
    c.drawImage(raster.canvas,centerX-extent*.5,centerY-extent*.5,extent,extent);
  }
  function glow(c,x,y,r,rgba) {
    const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba);g.addColorStop(1,'rgba(3,13,17,0)');
    c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
  }
  // A quiet sheet of moving light links the hero sculpture to the process and close.
  function renderTide(s,t) {
    const c=s.ctx,w=s.w,h=s.h, count=s.compact?25:44;
    const process=s.kind==='process';
    for(let i=0;i<count;i++) {
      const v=i/(count-1), phase=t*.24+s.phase;
      const g=c.createLinearGradient(0,0,w,h);
      g.addColorStop(0,'rgba(24,86,83,0)');g.addColorStop(.45,`rgba(49,156,137,${.07+v*.10})`);g.addColorStop(.75,`rgba(134,226,201,${.09+v*.15})`);g.addColorStop(1,'rgba(30,95,90,0)');
      c.strokeStyle=g;c.lineWidth=.7;c.beginPath();
      for(let j=0;j<=80;j++){
        const u=j/80;let x=u*w;
        let y=h*(process?.83:.91)+Math.sin(u*4.7-phase)*h*.1+(v-.5)*h*.23*Math.sin(u*3.8+phase*.4);
        y+=(s.py-.5)*22*Math.sin(u*Math.PI)+s.scroll*25;
        if(j===0)c.moveTo(x,y);else c.lineTo(x,y);
      }c.stroke();
    }
  }
  function draw(s,t) {
    if(!s.w||!s.h||s.failed)return;
    const c=s.ctx,w=s.w,h=s.h;
    c.clearRect(0,0,w,h);
    const mobile=w<760;
    glow(c,w*(mobile?.55:.77),h*(mobile?.69:.39),Math.min(w*.50,h*.65),'rgba(15,116,105,.21)');
    glow(c,w*.99,h*.02,Math.min(w*.4,400),'rgba(45,83,100,.10)');
    c.save();c.globalAlpha=s.kind==='hero'?1:s.kind==='contact'?.58:.18;
    renderSculpture(s,t);c.restore();
    renderTide(s,t);
    s.frames++;draws++;
  }
  function safeDraw(s,t){try{draw(s,t);}catch(e){s.failed=true;s.host.dataset.motionError='render';console.warn('Phoenix Flow uses the static fallback.',e);}}
  function resize(s) {
    const r=s.host.getBoundingClientRect();s.w=Math.max(r.width,1);s.h=Math.max(r.height,1);
    const visual=s.host.querySelector('.hero-visual');
    if(visual){const a=visual.getBoundingClientRect();s.art={x:a.left-r.left,y:a.top-r.top,w:a.width,h:a.height};}
    s.compact=coarse.matches||s.w<760;
    const dpr=Math.min(devicePixelRatio||1,s.compact?1.25:1.5,2400/s.w);
    s.canvas.width=Math.round(s.w*dpr);s.canvas.height=Math.round(s.h*dpr);s.ctx.setTransform(dpr,0,0,dpr,0,0);
    safeDraw(s,time);
  }
  function tick(now) {
    frame=0;if(!allowed())return;
    const target=scenes.some(s=>s.visible&&s.compact)?1000/24:1000/30;
    if(last&&now-last<target-1){frame=requestAnimationFrame(tick);return;}
    const dt=last?Math.min((now-last)/1000,.12):1/30;last=now;time+=dt;
    for(const s of scenes)if(s.visible&&!s.failed){
      const blend=1-Math.exp(-dt*3.4);s.px+=(s.tx-s.px)*blend;s.py+=(s.ty-s.py)*blend;
      s.energy*=Math.exp(-dt*.8);s.wave+=dt;s.scroll+=(s.targetScroll-s.scroll)*blend;
      safeDraw(s,time);
    }
    if(scenes.some(s=>s.visible&&!s.failed))frame=requestAnimationFrame(tick);
  }
  function on(target,event,callback,options){target.addEventListener(event,callback,options);cleanups.push(()=>target.removeEventListener(event,callback,options));}
  const observer='IntersectionObserver' in window ? new IntersectionObserver(entries=>{
    for(const e of entries){const s=scenes.find(x=>x.host===e.target);if(s)s.visible=e.isIntersecting;}
    if(scenes.some(s=>s.visible))start();else stop();
  },{threshold:.005}):null;
  for(const [selector,kind,phase] of [['.hero','hero',0],['#process','process',1.2],['#contact','contact',2.4]]){
    const host=document.querySelector(selector);if(!host)continue;
    const canvas=document.createElement('canvas');canvas.className='ambient-canvas';canvas.setAttribute('aria-hidden','true');
    const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)continue;
    const s={host,canvas,ctx,kind,phase,w:0,h:0,px:.5,py:.5,tx:.5,ty:.5,energy:0,wave:0,scroll:0,targetScroll:0,frames:0,visible:false,failed:false};
    host.classList.add('ambient-scene');host.dataset.motionVersion=VERSION;host.prepend(canvas);scenes.push(s);
    const bounds=host.getBoundingClientRect();s.visible=bounds.bottom>0&&bounds.top<innerHeight;
    resize(s);
    on(host,'pointermove',e=>{
      if(!allowed()||e.pointerType==='touch')return;
      // Read current geometry so hover stays accurate after layout shifts/scroll.
      const r=host.getBoundingClientRect();s.tx=clamp((e.clientX-r.left)/r.width,0,1);s.ty=clamp((e.clientY-r.top)/r.height,0,1);
    },{passive:true});
    on(host,'pointerleave',()=>{s.tx=.5;s.ty=.5;},{passive:true});
    on(host,'pointerdown',e=>{
      if(!allowed()||e.target.closest(interactive))return;
      const r=host.getBoundingClientRect();s.tx=clamp((e.clientX-r.left)/r.width,0,1);s.ty=clamp((e.clientY-r.top)/r.height,0,1);s.energy=1;s.wave=0;
    },{passive:true});
    on(host,'pointerup',e=>{if(e.pointerType==='touch'){s.tx=.5;s.ty=.5;}},{passive:true});
    if(observer)observer.observe(host);
    if('ResizeObserver' in window){const ro=new ResizeObserver(()=>resize(s));ro.observe(host);cleanups.push(()=>ro.disconnect());}
  }
  const hero=document.querySelector('.hero');
  if(!scenes.length)return;
  hero.append(control);
  // The hint is an affordance for the requested interaction, not a fake status badge.
  const hint=document.createElement('span');hint.className='motion-hint';hint.setAttribute('aria-hidden','true');hint.textContent=coarse.matches?'Touch to set it in motion':'Move to explore · Click to ripple';hero.append(hint);
  let scrollQueued=false;
  on(window,'scroll',()=>{if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{
    scrollQueued=false;for(const s of scenes){const r=s.host.getBoundingClientRect();s.targetScroll=clamp((innerHeight-r.top)/(innerHeight+s.h),0,1);}
  });},{passive:true});
  if(!('ResizeObserver' in window))on(window,'resize',()=>scenes.forEach(resize),{passive:true});
  const dialogs=new MutationObserver(()=>{modalOpen=Boolean(document.querySelector('dialog[open]'));sync();});
  document.querySelectorAll('dialog').forEach(d=>dialogs.observe(d,{attributes:true,attributeFilter:['open']}));
  on(document,'visibilitychange',()=>{visiblePage=!document.hidden;sync();});
  on(reduced,'change',()=>{sync();scenes.forEach(s=>safeDraw(s,time));});
  on(coarse,'change',()=>scenes.forEach(resize));
  on(window,'pagehide',stop);on(window,'pageshow',sync);
  window.PTR_MOTION={
    version:VERSION,
    pause(){userPaused=true;sync();},resume(){userPaused=false;sync();},
    get status(){return {version:VERSION,paused:userPaused,reduced:reduced.matches,running:allowed()&&Boolean(frame),frames:draws,active:scenes.filter(s=>s.visible).length,scenes:scenes.map(s=>({kind:s.kind,frames:s.frames,visible:s.visible,failed:s.failed,pointer:[s.px,s.py],energy:s.energy}))};},
    destroy(){stop();observer?.disconnect();dialogs.disconnect();cleanups.forEach(fn=>fn());scenes.forEach(s=>{s.canvas.remove();s.host.classList.remove('ambient-scene');delete s.host.dataset.motionVersion;});control.remove();hint.remove();delete window.PTR_MOTION;}
  };
  sync();
})();
