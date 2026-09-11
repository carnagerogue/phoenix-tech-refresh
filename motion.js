/* Phoenix Galaxy — the Phoenix mark, formed from interactive stardust.
 * Local Canvas 2D rendering. No dependencies, tracking, or remote assets.
 */
'use strict';
(() => {
  if (window.PTR_MOTION || !document.querySelector('.hero')) return;
  const VERSION = '3.0.0', TAU = Math.PI * 2;
  const coarse = matchMedia('(pointer: coarse)');
  const interactive = 'a,button,input,select,textarea,dialog,summary,[role="tab"]';
  const scenes=[],cleanups=[];
  let frame=0,last=0,time=0,draws=0,userPaused=false;
  let visiblePage=!document.hidden,modalOpen=Boolean(document.querySelector('dialog[open]'));
  let logoPoints=[];
  // Deterministic positions prevent stars from jumping on resize.
  let seed=71421;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const stars=Array.from({length:640},()=>({u:random(),v:random(),phase:random()*TAU,size:.5+random()*1.5,depth:random(),tone:random()}));
  const dust=Array.from({length:900},()=>({angle:random()*TAU,radius:.35+random()*.95,phase:random()*TAU,size:.55+random()*1.35}));
  function on(target,event,fn,options){target.addEventListener(event,fn,options);cleanups.push(()=>target.removeEventListener(event,fn,options));}
  const control=document.createElement('button');
  control.className='motion-control';control.type='button';
  function updateControl(){
    control.innerHTML=`<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${userPaused?'<path d="m7 4 8 6-8 6V4Z"/>':'<path d="M7 5v10M13 5v10"/>'}</svg><span>${userPaused?'Resume animation':'Pause animation'}</span>`;
    control.setAttribute('aria-label',userPaused?'Resume galaxy animation':'Pause galaxy animation');
    document.documentElement.dataset.ambientMotion=userPaused?'paused':'playing';
  }
  // Autoplay is intentional for this experience, including reduced-motion browsers.
  // A manual pause remains available. Invisible surfaces never consume frames.
  const allowed=()=>!userPaused&&visiblePage&&!modalOpen;
  function start(){if(!frame&&allowed()&&scenes.some(s=>s.visible&&!s.failed)){last=0;frame=requestAnimationFrame(tick);}}
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
  function sync(){updateControl();if(allowed())start();else stop();}
  function pause(){userPaused=true;sync();}
  function resume(){userPaused=false;sync();}
  on(control,'click',()=>{if(userPaused)resume();else pause();});
  function glow(c,x,y,rx,ry,color){
    c.save();c.translate(x,y);c.scale(rx,ry);
    const g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=g;c.fillRect(-1,-1,2,2);c.restore();
  }
  function layout(s){
    const r=s.host.getBoundingClientRect();s.w=Math.max(1,r.width);s.h=Math.max(1,r.height);
    s.compact=s.w<760||coarse.matches;
    const visual=s.host.querySelector('.hero-visual');
    if(visual){
      const a=visual.getBoundingClientRect(),height=Math.max(180,a.height-106);
      s.art={x:a.left-r.left+a.width*.5,y:a.top-r.top+height*.49,w:Math.min(a.width*.80,height*.88),h:height};
    }else s.art={x:s.w*.77,y:s.h*.52,w:Math.min(s.w*.36,380),h:s.h};
    const dpr=Math.min(devicePixelRatio||1,s.compact?1.5:2,2600/s.w);
    s.canvas.width=Math.round(s.w*dpr);s.canvas.height=Math.round(s.h*dpr);s.ctx.setTransform(dpr,0,0,dpr,0,0);
    safeDraw(s,0);
  }
  function populate(){
    for(const s of scenes){s.particles=s.kind==='hero'?logoPoints.map(p=>({...p,dx:0,dy:0,vx:0,vy:0})):[];safeDraw(s,0);}
  }
  // Sample the supplied transparent mark, preserving its exact silhouette and colors.
  // Reading the existing image also works in the self-contained offline build.
  const logo=document.querySelector('.brand img');
  function sampleLogo(){
    try{
      const mask=document.createElement('canvas');mask.width=200;mask.height=Math.round(200*logo.naturalHeight/logo.naturalWidth);
      const ctx=mask.getContext('2d',{willReadFrequently:true});ctx.drawImage(logo,0,0,mask.width,mask.height);
      const data=ctx.getImageData(0,0,mask.width,mask.height).data;
      for(let y=0;y<mask.height;y+=2)for(let x=0;x<mask.width;x+=2){
        const i=(y*mask.width+x)*4,r=data[i],g=data[i+1],b=data[i+2];
        if(data[i+3]<170||Math.max(r,g,b)<48)continue;
        const teal=g>r*1.2&&b>r*1.1;
        logoPoints.push({u:(x-mask.width/2)/mask.width,v:(y-mask.height/2)/mask.width,phase:random()*TAU,size:.7+random()*.65,light:.5+Math.max(r,g,b)/510,color:teal?'72,239,218':y<mask.height*.3?'207,229,255':'153,211,225'});
      }
      populate();
    }catch(error){console.warn('Phoenix Galaxy could not sample the logo.',error);scenes.forEach(s=>{s.host.dataset.motionError='logo';});}
  }
  function draw(s,dt){
    if(s.failed||!s.w)return;
    const c=s.ctx,w=s.w,h=s.h,a=s.art,hero=s.kind==='hero';
    c.clearRect(0,0,w,h);
    const pulse=.88+Math.sin(time*.27)*.12;
    glow(c,a.x-w*.04,a.y,a.w*.92,a.h*.7,`rgba(51,32,115,${.32*pulse})`);
    glow(c,a.x+a.w*.27,a.y+a.h*.16,a.w*.66,a.h*.52,'rgba(0,131,132,.21)');
    glow(c,a.x-a.w*.24,a.y-a.h*.20,a.w*.50,a.h*.43,'rgba(62,87,168,.19)');
    // Sparse drifting field across the scene; keep the text side deliberately quiet.
    for(let i=0;i<(s.compact?300:stars.length);i++){
      const p=stars[i],x=(p.u*w+time*(1+p.depth*3))%w,y=p.v*h+Math.sin(time*.18+p.phase)*5;
      const alpha=(.24+.44*(.5+.5*Math.sin(time*(.6+p.depth)+p.phase)))*(hero&&x<w*.48?.23:hero?1:.42);
      c.fillStyle=`rgba(${p.tone>.8?'153,138,239':p.tone>.5?'104,218,220':'210,228,255'},${alpha})`;
      c.fillRect(x,y,p.size,p.size);
      if(p.depth>.97){c.globalAlpha=alpha*.6;c.fillRect(x-2,y+.5,p.size+4,.6);c.fillRect(x+.5,y-2,.6,p.size+4);c.globalAlpha=1;}
    }
    if(hero){
      c.save();c.globalCompositeOperation='lighter';
      // A tilted galaxy of fine dust wraps the mark without obscuring its shape.
      for(let i=0;i<(s.compact?500:dust.length);i++){
        const p=dust[i],angle=p.angle+time*.035,r=p.radius;
        const xx=Math.cos(angle)*a.w*.80*r,yy=Math.sin(angle)*a.w*.33*r;
        const x=a.x+xx*.91+yy*.42,y=a.y-xx*.42+yy*.91;
        c.fillStyle=`rgba(${i%3?'112,156,227':'97,245,220'},${(.12+.24*(.5+.5*Math.sin(p.phase+time*.8)))*(1-r*.45)})`;
        c.fillRect(x,y,p.size,p.size);
      }
      const size=a.w,step=dt*60,radius=s.compact?72:110;
      let displacement=0,affected=0;
      for(const p of s.particles){
        const bx=a.x+p.u*size+Math.sin(time*.65+p.phase)*1.3;
        const by=a.y+p.v*size+Math.sin(time*.48)*5+Math.cos(time*.55+p.phase)*1.3;
        if(dt){
          if(s.pointerActive){
            const dx=bx+p.dx-s.mx,dy=by+p.dy-s.my,d=Math.hypot(dx,dy);
            if(d<radius){const force=(1-d/radius)*2.8,angle=d<.1?p.phase:Math.atan2(dy,dx);p.vx+=Math.cos(angle)*force*step;p.vy+=Math.sin(angle)*force*step;affected++;}
          }
          p.vx+=-p.dx*.022*step;p.vy+=-p.dy*.022*step;
          const damping=Math.pow(.86,step);p.vx*=damping;p.vy*=damping;p.dx+=p.vx*step;p.dy+=p.vy*step;
        }
        const offset=Math.hypot(p.dx,p.dy);displacement=Math.max(displacement,offset);
        const shimmer=.70+.30*Math.sin(time*1.3+p.phase),pixel=(s.compact?1.35:1.65)*p.size;
        const alpha=Math.min(1,p.light*shimmer+.20);
        const x=bx+p.dx,y=by+p.dy;
        c.fillStyle=`rgba(${p.color},${alpha*.09})`;c.fillRect(x-2,y-2,pixel+4,pixel+4);
        c.fillStyle=`rgba(${offset>10?'143,246,255':p.color},${alpha})`;c.fillRect(x,y,pixel,pixel);
        if(p.size>1.31){c.fillStyle=`rgba(225,250,255,${alpha*.65})`;c.fillRect(x-2,y+pixel*.5,pixel+4,.7);c.fillRect(x+pixel*.5,y-2,.7,pixel+4);}
      }
      s.displacement=displacement;s.affected=affected;c.restore();
    }
    s.frames++;draws++;
  }
  function safeDraw(s,dt){try{draw(s,dt);}catch(error){s.failed=true;s.host.dataset.motionError='render';console.warn('Phoenix Galaxy rendering failed.',error);}}
  function tick(now){
    frame=0;if(!allowed())return;
    if(last&&now-last<1000/30-1){frame=requestAnimationFrame(tick);return;}
    const dt=last?Math.min((now-last)/1000,.05):1/30;last=now;time+=dt;
    for(const s of scenes)if(s.visible&&!s.failed)safeDraw(s,dt);
    if(scenes.some(s=>s.visible&&!s.failed))frame=requestAnimationFrame(tick);
  }
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    for(const e of entries){const s=scenes.find(s=>s.host===e.target);if(s){s.visible=e.isIntersecting;if(!s.visible)s.pointerActive=false;}}
    if(scenes.some(s=>s.visible))start();else stop();
  },{threshold:.005}):null;
  for(const [selector,kind] of [['.hero','hero'],['#process','process'],['#contact','contact']]){
    const host=document.querySelector(selector);if(!host)continue;
    const canvas=document.createElement('canvas');canvas.className='ambient-canvas';canvas.setAttribute('aria-hidden','true');
    const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)continue;
    const r=host.getBoundingClientRect();
    const s={host,canvas,ctx,kind,w:0,h:0,art:null,particles:[],pointerActive:false,mx:0,my:0,displacement:0,affected:0,frames:0,failed:false,visible:r.bottom>0&&r.top<innerHeight};
    host.classList.add('ambient-scene');host.dataset.motionVersion=VERSION;host.prepend(canvas);scenes.push(s);layout(s);
    function pointer(e){
      if(!allowed()||e.target.closest(interactive)){s.pointerActive=false;return;}
      const r=host.getBoundingClientRect();s.mx=e.clientX-r.left;s.my=e.clientY-r.top;s.pointerActive=true;
    }
    on(host,'pointermove',pointer,{passive:true});on(host,'pointerdown',pointer,{passive:true});
    on(host,'pointerleave',()=>{s.pointerActive=false;},{passive:true});
    on(host,'pointerup',e=>{if(e.pointerType==='touch')s.pointerActive=false;},{passive:true});
    on(host,'pointercancel',()=>{s.pointerActive=false;},{passive:true});
    if(observer)observer.observe(host);
    if('ResizeObserver' in window){const ro=new ResizeObserver(()=>layout(s));ro.observe(host);cleanups.push(()=>ro.disconnect());}
  }
  if(!scenes.length)return;
  const hero=document.querySelector('.hero');hero.append(control);
  const hint=document.createElement('span');hint.className='motion-hint';hint.setAttribute('aria-hidden','true');
  function updateHint(){hint.textContent=coarse.matches?'Touch the stardust':'Move through the stardust';}
  updateHint();hero.append(hint);
  if(!('ResizeObserver' in window))on(window,'resize',()=>scenes.forEach(layout),{passive:true});
  const dialogs=new MutationObserver(()=>{modalOpen=Boolean(document.querySelector('dialog[open]'));sync();});
  document.querySelectorAll('dialog').forEach(d=>dialogs.observe(d,{attributes:true,attributeFilter:['open']}));
  on(document,'visibilitychange',()=>{visiblePage=!document.hidden;sync();});
  on(coarse,'change',()=>{updateHint();scenes.forEach(layout);});
  on(window,'pagehide',stop);on(window,'pageshow',sync);
  if(logo?.complete&&logo.naturalWidth)sampleLogo();else if(logo)on(logo,'load',sampleLogo,{once:true});
  window.PTR_MOTION={version:VERSION,pause,resume,
    get status(){return{version:VERSION,shape:'logo-pixels',paused:userPaused,running:allowed()&&Boolean(frame),frames:draws,logoPoints:logoPoints.length,active:scenes.filter(s=>s.visible).length,scenes:scenes.map(s=>({kind:s.kind,frames:s.frames,visible:s.visible,failed:s.failed,particles:s.particles.length,pointerActive:s.pointerActive,displacement:s.displacement,affected:s.affected}))};},
    destroy(){stop();observer?.disconnect();dialogs.disconnect();cleanups.forEach(fn=>fn());scenes.forEach(s=>{s.canvas.remove();s.host.classList.remove('ambient-scene');delete s.host.dataset.motionVersion;});control.remove();hint.remove();delete document.documentElement.dataset.ambientMotion;delete window.PTR_MOTION;}
  };
  sync();
})();
