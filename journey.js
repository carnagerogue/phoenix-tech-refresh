/* Phoenix Journey — scroll-directed cameras and live, perspective particle scenes.
 * No scroll interception, remote assets, framework, or animation dependencies.
 */
'use strict';
(() => {
  if(window.PTR_JOURNEY)return;
  const root=document.documentElement,nav=document.querySelector('.journey-nav');
  const opening=document.querySelector('.opening-sequence'),hero=opening?.querySelector('.hero');
  if(!nav||!hero)return;
  const VERSION='5.0.0',TAU=Math.PI*2;
  const compact=matchMedia('(max-width: 760px)');
  const interactive='a,button,input,select,textarea,summary,dialog';
  const pauseButton=nav.querySelector('.journey-pause'),links=[...nav.querySelectorAll('.journey-chapters a')];
  const contact=document.querySelector('#contact'),portal=document.querySelector('.portal-window');
  const hardware=document.querySelector('.service-photo');
  const scenes=[],cleanups=[];
  let clock=0,frame=0,last=0,scrollFrame=0,layoutFrame=0,openingTop=0,openingRange=0,headerHeight=88,contactEnd=0;
  let seed=91728;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
  const mix=(a,b,p)=>a+(b-a)*p;
  const smooth=(a,b,x)=>{const p=clamp((x-a)/(b-a));return p*p*(3-2*p);};
  const listen=(target,event,fn,options)=>{target.addEventListener(event,fn,options);cleanups.push(()=>target.removeEventListener(event,fn,options));};
  const paused=()=>root.dataset.ambientMotion==='paused';
  const allowed=()=>!paused()&&!document.hidden&&!document.querySelector('dialog[open]');
  // Full choreography is intentional, matching the requested always-on experience.
  // The persistent pause control is the visitor’s explicit motion preference.
  const calm=paused;
  const lights=['210,242,239','101,227,193','80,151,166'].map(rgb=>{
    const c=document.createElement('canvas');c.width=c.height=32;
    const ctx=c.getContext('2d'),g=ctx.createRadialGradient(16,16,0,16,16,16);
    g.addColorStop(0,`rgba(${rgb},1)`);g.addColorStop(.20,`rgba(${rgb},.95)`);
    g.addColorStop(.42,`rgba(${rgb},.32)`);g.addColorStop(.70,`rgba(${rgb},.055)`);g.addColorStop(1,`rgba(${rgb},0)`);
    ctx.fillStyle=g;ctx.fillRect(0,0,32,32);return c;
  });
  const stars=Array.from({length:1000},()=>({x:(random()-.5)*8,y:(random()-.5)*6,z:random()*8,light:.2+random()*.6,size:random(),phase:random()*TAU}));
  const particles=Array.from({length:7200},(_,i)=>{
    const axis=i%3,sign=i%2?1:-1,xyz=[random()*1.72-.86,random()*1.72-.86,random()*1.72-.86];xyz[axis]=sign*.86;
    return{x:xyz[0],y:xyz[1],z:xyz[2],theta:random()*TAU,phi:random()*TAU,
      scatter:[(random()-.5)*4,(random()-.5)*4,(random()-.5)*4],phase:random()*TAU,light:.25+random()*.65,size:.65+random()*.7,tone:random()>.68?1:0};
  });
  function point(c,x,y,size,alpha,tone=0){c.globalAlpha=clamp(alpha);c.drawImage(lights[tone],x-size*.5,y-size*.5,size,size);}
  function glow(c,x,y,rx,ry,alpha,tone=1){
    c.save();c.globalAlpha=1;c.translate(x,y);c.scale(rx*.5,ry*.5);
    const rgb=tone?'0,113,96':'26,76,88',g=c.createRadialGradient(0,0,0,0,0,1);
    g.addColorStop(0,`rgba(${rgb},${alpha*.13})`);g.addColorStop(.43,`rgba(${rgb},${alpha*.55})`);g.addColorStop(1,`rgba(${rgb},0)`);
    c.fillStyle=g;c.fillRect(-1,-1,2,2);c.restore();
  }
  function line(c,a,b,alpha,width=.65,color='#9ee6d9'){
    if(!a||!b)return;c.globalAlpha=clamp(alpha);c.strokeStyle=color;c.lineWidth=width;
    c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
  }
  function projection(cx,cy,scale,yaw,pitch,roll){
    const sy=Math.sin(yaw),cyaw=Math.cos(yaw),sx=Math.sin(pitch),cxp=Math.cos(pitch),sz=Math.sin(roll),cz=Math.cos(roll);
    return(x,y,z)=>{
      const xx=x*cyaw+z*sy,zz=z*cyaw-x*sy,yy=y*cxp-zz*sx,depth=y*sx+zz*cxp;
      const perspective=4.7/(4.7+depth);
      return{x:cx+(xx*cz-yy*sz)*scale*perspective,y:cy+(xx*sz+yy*cz)*scale*perspective,depth,k:perspective};
    };
  }
  function drawSpace(s,progress){
    const c=s.ctx,w=s.w,h=s.h,scale=Math.min(w,h)*.82;
    c.save();c.globalCompositeOperation='lighter';
    for(let i=0;i<(compact.matches?460:stars.length);i++){
      const p=stars[i],z=1+((p.z-clock*.075-progress*2.8)%8+8)%8;
      const x=w*.64+p.x*scale/z,y=h*.48+p.y*scale/z;
      if(x<0||x>w||y<0||y>h)continue;
      const fade=Math.min(1,(z-1)*2,(9-z)*1.5),alpha=p.light*fade*(x<w*.43?.23:.68);
      const size=(2.2+p.size*3)/Math.sqrt(z*.45);
      point(c,x,y,size,alpha,i%4===0?1:0);
      if(s.velocity>.015){
        const tail=1+Math.min(.07,s.velocity*.7),tx=w*.64+(x-w*.64)*tail,ty=h*.48+(y-h*.48)*tail;
        line(c,{x,y},{x:tx,y:ty},alpha*.4,.6);
      }
    }
    c.restore();
  }
  function drawCube(s,project,assembly){
    const c=s.ctx;
    // A real 3D lattice: every line and point is projected through the same camera.
    for(const factor of [1,.39]){
      const q=.86*factor;
      for(let axis=0;axis<3;axis++)for(const a of [-q,q])for(const b of [-q,q]){
        const from=[0,0,0],to=[0,0,0];from[axis]=-q;to[axis]=q;from[(axis+1)%3]=to[(axis+1)%3]=a;from[(axis+2)%3]=to[(axis+2)%3]=b;
        const p=project(...from),n=project(...to);
        line(c,p,n,.075*assembly,5);line(c,p,n,.48*assembly,1);
      }
      for(let face=0;face<3;face++)for(const side of [-q,q])for(let i=-4;i<=4;i++){
        const a=[0,0,0],b=[0,0,0];a[face]=b[face]=side;a[(face+1)%3]=b[(face+1)%3]=i*q/5;a[(face+2)%3]=-q;b[(face+2)%3]=q;
        line(c,project(...a),project(...b),.14*assembly,.55);
      }
      for(const x of [-q,q])for(const y of [-q,q])for(const z of [-q,q]){
        const p=project(x,y,z);point(c,p.x,p.y,26*p.k,.68*assembly,1);
        line(c,{x:p.x-9,y:p.y},{x:p.x+9,y:p.y},.30*assembly,.6);
      }
    }
    for(let i=-8;i<=8;i++){
      line(c,project(i*.43,1.18,-3.4),project(i*.43,1.18,3.4),.065,.6);
      line(c,project(-3.4,1.18,i*.43),project(3.4,1.18,i*.43),.065,.6);
    }
  }
  function drawOrbit(s,project,radius,phase,index){
    const c=s.ctx;
    let previous=null;
    for(let i=0;i<=160;i++){
      const angle=i/160*TAU,p=project(Math.cos(angle)*radius,Math.sin(angle)*radius,Math.sin(angle*2+index)*.12);
      if(previous)line(c,previous,p,index%2?.09:.16,.6);previous=p;
    }
    for(let i=24;i>=0;i--){
      const a=phase-i*.018,p=project(Math.cos(a)*radius,Math.sin(a)*radius,Math.sin(a*2+index)*.12);
      point(c,p.x,p.y,i===0?20:2.8, i===0?.82:(1-i/25)*.5,index%2);
    }
  }
  function draw(s,dt){
    if(!s.ctx||s.failed||!s.w)return;
    const c=s.ctx,w=s.w,h=s.h,p=calm()?.3:s.progress;
    s.velocity*=Math.pow(.88,dt*60);
    c.clearRect(0,0,w,h);
    const small=compact.matches,depart=smooth(.68,1,p),assembly=.7+.3*smooth(0,.34,p);
    const cx=w*(small?.52:mix(.72,.62,depart)),cy=h*(small?.72:.49);
    const size=Math.min(w*(small?.34:.27),h*(small?.23:.39))*(1+depart*.66);
    const yaw=s.kind==='protect'?.38+clock*.045+(p-.3)*.72:.15+Math.sin(clock*.14)*.17;
    const pitch=s.kind==='protect'?-.19+Math.sin(clock*.13)*.05:.92+(p-.3)*.55;
    const roll=s.kind==='protect'?.025:-.39+Math.sin(clock*.08)*.04;
    s.pointerX=mix(s.pointerX,s.targetX,Math.min(1,dt*3));s.pointerY=mix(s.pointerY,s.targetY,Math.min(1,dt*3));
    const project=projection(cx,cy,size,yaw+s.pointerX*.06,pitch+s.pointerY*.04,roll);
    glow(c,cx,cy,size*5,size*4,.27+.04*Math.sin(clock*.55));
    glow(c,cx-size*.4,cy-size*.1,size*3,size*4,.13,0);
    drawSpace(s,p);
    c.save();c.globalCompositeOperation='lighter';
    if(s.kind==='protect')drawCube(s,project,assembly);
    for(let i=0;i<(small?3600:particles.length);i++){
      const a=particles[i];let x,y,z;
      if(s.kind==='protect'){
        x=mix(a.scatter[0],a.x,assembly);y=mix(a.scatter[1],a.y,assembly);z=mix(a.scatter[2],a.z,assembly);
        const wave=Math.sin(a.phase+clock*.38)*.014;x+=wave;y+=wave*.5;
        if(i%7===0){x*=.39;y*=.39;z*=.39;}
      }else{
        const theta=a.theta+clock*.11,phi=a.phi+clock*.08,tube=.25+Math.sin(theta*3+clock*.24)*.025;
        x=(1+tube*Math.cos(phi))*Math.cos(theta);y=(1+tube*Math.cos(phi))*Math.sin(theta);z=tube*Math.sin(phi);
      }
      const v=project(x,y,z),light=.67+.33*Math.pow(.5+.5*Math.sin(a.phase+clock*.63+z*2),2);
      const alpha=a.light*light*(v.depth<0?1.35:.8),pixel=(small?3.2:4.2)*a.size*v.k;
      if(v.x<-20||v.x>w+20||v.y<-20||v.y>h+20)continue;
      point(c,v.x,v.y,pixel,alpha,a.tone);
      if(i%137===0)point(c,v.x,v.y,pixel*4.8,alpha*.48,a.tone);
    }
    const orbitProject=s.kind==='protect'?projection(cx,cy,size,yaw,.98,-.08):project;
    for(let i=0;i<4;i++)drawOrbit(s,orbitProject,1.43+i*.15,clock*(.13+i*.018)+i*1.9,i);
    if(s.kind==='protect'){
      // Fine descending filaments connect the protected core to its larger field.
      for(let i=0;i<36;i++){
        const t=i*2.39996,x=Math.cos(t)*.7,z=Math.sin(t)*.7,head=1.6-((clock*.13+i*.13)%3.2);
        line(c,project(x,-1.5,z),project(x,1.5,z),.055,.55);
        const v=project(x,head,z);point(c,v.x,v.y,5,.45,1);
      }
    }
    c.restore();s.frames++;s.stage.dataset.cameraProgress=p.toFixed(3);
  }
  function safeDraw(s,dt){try{draw(s,dt);}catch(error){s.failed=true;s.stage.dataset.journeyError='render';console.warn('Phoenix chapter rendering failed.',error);}}
  function tick(now){
    frame=0;if(!allowed())return;
    if(last&&now-last<1000/30-1){frame=requestAnimationFrame(tick);return;}
    const dt=last?Math.min((now-last)/1000,.05):1/30;last=now;clock+=dt;
    for(const s of scenes)if(s.visible&&!s.failed)safeDraw(s,dt);
    if(scenes.some(s=>s.visible&&s.ctx&&!s.failed))frame=requestAnimationFrame(tick);
  }
  function start(){if(!frame&&allowed()&&scenes.some(s=>s.visible&&s.ctx&&!s.failed)){last=0;frame=requestAnimationFrame(tick);}}
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
  function sync(){
    const off=paused();pauseButton.setAttribute('aria-label',off?'Resume all animation':'Pause all animation');
    pauseButton.innerHTML=`<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${off?'<path d="m7 4 8 6-8 6V4Z"/>':'<path d="M7 5v10M13 5v10"/>'}</svg>`;
    if(allowed())start();else stop();scheduleScroll();
  }
  function applyScroll(){
    scrollFrame=0;
    const y=scrollY,steady=calm(),intro=openingRange>1?clamp((y-openingTop)/openingRange):0;
    const travel=steady||compact.matches?0:smooth(.17,1,intro);
    opening.style.setProperty('--departure-y',`${-travel*80}px`);
    opening.style.setProperty('--departure-opacity',1-smooth(.18,.87,intro));
    opening.style.setProperty('--galaxy-opacity',1-smooth(.76,1,intro));
    window.PTR_MOTION?.setCamera(travel);
    for(const s of scenes){
      const progress=clamp((y-s.top+headerHeight)/Math.max(1,s.height-s.h));
      s.velocity=Math.max(s.velocity,Math.abs(progress-s.progress));s.progress=progress;
      const pinned=s.height-s.h>80&&!steady;
      const fade=pinned?smooth(.76,1,progress):0;
      s.stage.style.setProperty('--scene-copy-opacity',1-fade*.96);
      s.stage.style.setProperty('--scene-copy-y',`${-fade*55}px`);
      if(s.kind==='renew'){
        const entry=steady?1:smooth(0,.28,clamp((innerHeight-(s.top-y))/(innerHeight*.85)));
        s.stage.style.setProperty('--forest-inset',`${(1-entry)*14}%`);
        s.stage.style.setProperty('--forest-radius',`${(1-entry)*28}px`);
        s.stage.style.setProperty('--forest-scale',steady?1:1.20-progress*.18);
        s.stage.style.setProperty('--forest-y',steady?'0px':`${-progress*18}px`);
        s.stage.dataset.cameraProgress=(steady?.3:progress).toFixed(3);
      }
    }
    const first=scenes[0],visible=Boolean(first&&y>first.top-innerHeight*.38&&y<contactEnd-innerHeight*.55);
    nav.hidden=!visible;root.classList.toggle('journey-active',visible);
    let active=0;
    scenes.forEach((s,i)=>{if(y+innerHeight*.48>=s.top)active=i;});
    links.forEach((link,i)=>{
      const next=scenes[i+1]?.top??contactEnd,start=scenes[i].top-innerHeight*.45;
      link.style.setProperty('--chapter-progress',clamp((y-start)/(next-start)));
      if(i===active)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');
    });
    if(portal){
      const r=portal.getBoundingClientRect(),p=steady?1:clamp((innerHeight-r.top)/(innerHeight*.85));
      portal.style.setProperty('--portal-tilt',`${(1-p)*9}deg`);portal.style.setProperty('--portal-y',`${(1-p)*35}px`);
    }
    if(hardware){
      const r=hardware.parentElement.getBoundingClientRect(),p=steady?.5:clamp((innerHeight-r.top)/(innerHeight+r.height));
      hardware.style.setProperty('--hardware-scale',1.14-p*.08);hardware.style.setProperty('--hardware-y',`${(p-.5)*20}px`);
    }
  }
  function scheduleScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(applyScroll);}
  function layout(){
    layoutFrame=0;headerHeight=document.querySelector('.site-header').offsetHeight;
    root.style.setProperty('--journey-header',headerHeight+'px');
    opening.style.setProperty('--opening-height',hero.offsetHeight+'px');
    openingTop=opening.getBoundingClientRect().top+scrollY;openingRange=opening.offsetHeight-hero.offsetHeight;
    contactEnd=contact.getBoundingClientRect().bottom+scrollY;
    for(const s of scenes){
      const r=s.host.getBoundingClientRect();s.top=r.top+scrollY;s.height=r.height;s.w=s.stage.clientWidth;s.h=s.stage.clientHeight;
      if(s.ctx){const dpr=Math.min(devicePixelRatio||1,compact.matches?1.5:1.7,2600/s.w);s.canvas.width=Math.round(s.w*dpr);s.canvas.height=Math.round(s.h*dpr);s.ctx.setTransform(dpr,0,0,dpr,0,0);safeDraw(s,0);}
    }
    applyScroll();start();
  }
  function scheduleLayout(){if(!layoutFrame)layoutFrame=requestAnimationFrame(layout);}
  const observer=new IntersectionObserver(entries=>{
    for(const e of entries){const s=scenes.find(s=>s.stage===e.target);if(s){s.visible=e.isIntersecting;s.host.classList.toggle('scene-visible',s.visible);}}
    if(scenes.some(s=>s.visible&&s.ctx))start();else stop();
  },{threshold:.003});
  for(const host of document.querySelectorAll('[data-journey-scene]')){
    const stage=host.querySelector('.cinema-stage'),kind=host.dataset.journeyScene;
    const s={host,stage,kind,top:0,height:0,w:0,h:0,progress:0,velocity:0,frames:0,visible:false,failed:false,pointerX:0,pointerY:0,targetX:0,targetY:0};
    if(kind!=='renew'){
      const canvas=document.createElement('canvas');canvas.className='journey-canvas';canvas.setAttribute('aria-hidden','true');
      const ctx=canvas.getContext('2d',{alpha:true});if(ctx){s.canvas=canvas;s.ctx=ctx;stage.prepend(canvas);}
    }
    scenes.push(s);observer.observe(stage);
    listen(stage,'pointermove',e=>{if(e.pointerType==='touch'||e.target.closest(interactive))return;const r=stage.getBoundingClientRect();s.targetX=(e.clientX-r.left)/r.width-.5;s.targetY=(e.clientY-r.top)/r.height-.5;},{passive:true});
    listen(stage,'pointerleave',()=>{s.targetX=s.targetY=0;},{passive:true});
  }
  root.classList.add('cinema-ready');
  listen(pauseButton,'click',()=>{if(paused())window.PTR_MOTION?.resume();else window.PTR_MOTION?.pause();});
  listen(window,'scroll',scheduleScroll,{passive:true});listen(window,'resize',scheduleLayout,{passive:true});
  listen(document,'visibilitychange',sync);listen(compact,'change',scheduleLayout);
  listen(window,'pagehide',stop);listen(window,'pageshow',()=>{scheduleLayout();sync();});
  const mutations=new MutationObserver(sync);mutations.observe(root,{attributes:true,attributeFilter:['data-ambient-motion']});
  document.querySelectorAll('dialog').forEach(d=>mutations.observe(d,{attributes:true,attributeFilter:['open']}));
  const resize=new ResizeObserver(scheduleLayout);resize.observe(hero);scenes.forEach(s=>resize.observe(s.stage));
  document.fonts?.ready.then(scheduleLayout);layout();sync();
  window.PTR_JOURNEY={version:VERSION,
    get status(){return{version:VERSION,running:allowed()&&Boolean(frame),paused:paused(),scenes:scenes.map(s=>({kind:s.kind,progress:s.progress,frames:s.frames,visible:s.visible,failed:s.failed}))};},
    destroy(){stop();cancelAnimationFrame(scrollFrame);cancelAnimationFrame(layoutFrame);observer.disconnect();resize.disconnect();mutations.disconnect();cleanups.forEach(fn=>fn());scenes.forEach(s=>s.canvas?.remove());root.classList.remove('cinema-ready','journey-active');nav.hidden=true;window.PTR_MOTION?.setCamera(0);delete window.PTR_JOURNEY;}
  };
})();
