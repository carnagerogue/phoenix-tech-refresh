/* Phoenix Galaxy — the Phoenix mark, formed from interactive stardust.
 * Local Canvas 2D rendering. No dependencies, tracking, or remote assets.
 */
'use strict';
(() => {
  if (window.PTR_MOTION || !document.querySelector('.hero')) return;
  const VERSION = '5.0.0', TAU = Math.PI * 2;
  const coarse = matchMedia('(pointer: coarse)');
  const interactive = 'a,button,input,select,textarea,dialog,summary,[role="tab"]';
  const scenes=[],cleanups=[];
  let frame=0,last=0,time=0,draws=0,userPaused=false;
  let visiblePage=!document.hidden,modalOpen=Boolean(document.querySelector('dialog[open]'));
  let logoPoints=[],cameraTravel=0;
  // Deterministic positions prevent stars from jumping on resize.
  let seed=71421;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const stars=Array.from({length:1100},()=>({u:random(),v:random(),phase:random()*TAU,size:.5+random()*1.5,depth:random(),tone:random()}));
  const dust=Array.from({length:900},()=>({angle:random()*TAU,radius:.35+random()*.95,phase:random()*TAU,size:.55+random()*1.35}));
  // Small cached light sprites give stars a fine core and a soft optical halo.
  const palette=['210,228,249','83,222,208','153,178,218','220,194,166'];
  const lights=palette.map(color=>{
    const canvas=document.createElement('canvas');canvas.width=canvas.height=32;
    const c=canvas.getContext('2d'),g=c.createRadialGradient(16,16,0,16,16,16);
    g.addColorStop(0,`rgba(${color},1)`);g.addColorStop(.20,`rgba(${color},.95)`);
    g.addColorStop(.42,`rgba(${color},.32)`);g.addColorStop(.70,`rgba(${color},.06)`);g.addColorStop(1,`rgba(${color},0)`);
    c.fillStyle=g;c.fillRect(0,0,32,32);return canvas;
  });
  function star(c,x,y,size,alpha,tone=0){c.globalAlpha=alpha;c.drawImage(lights[tone],x-size*.5,y-size*.5,size,size);}
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
      const a=visual.getBoundingClientRect(),height=Math.max(180,a.height-35);
      s.art={x:a.left-r.left+a.width*.5,y:a.top-r.top+height*.49,w:Math.min(a.width*.88,height*.88),h:height};
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
      // Random continuous positions avoid the stamped bitmap grid of the first version.
      for(let attempt=0;attempt<100000&&logoPoints.length<6500;attempt++){
        const x=random()*mask.width,y=random()*mask.height,i=(Math.floor(y)*mask.width+Math.floor(x))*4;
        const r=data[i],g=data[i+1],b=data[i+2];
        if(data[i+3]<170||Math.max(r,g,b)<48)continue;
        const teal=g>r*1.2&&b>r*1.1,depth=random();
        logoPoints.push({u:(x-mask.width/2)/mask.width,v:(y-mask.height/2)/mask.width,
          phase:random()*TAU,orbit:random()*TAU,depth,z:(random()-.5)*.22,
          speed:.11+random()*.15,drift:2+random()*5,size:.6+random()*.65,
          light:.55+random()*.35,tone:teal?1:depth>.84?2:0});
      }
      populate();
    }catch(error){console.warn('Phoenix Galaxy could not sample the logo.',error);scenes.forEach(s=>{s.host.dataset.motionError='logo';});}
  }
  function draw(s,dt){
    if(s.failed||!s.w)return;
    const c=s.ctx,w=s.w,h=s.h,hero=s.kind==='hero';
    const travel=hero?cameraTravel:0;
    const a=hero?{...s.art,x:s.art.x+(w*.5-s.art.x)*travel,w:s.art.w*(1+travel*1.8)}:s.art;
    c.clearRect(0,0,w,h);
    const breath=Math.sin(time*.72),pulse=.82+breath*.18;
    const floatX=Math.sin(time*.36)*a.w*.025,floatY=Math.sin(time*.48)*a.w*.032;
    const cx=a.x+floatX,cy=a.y+floatY;
    glow(c,cx-w*.04,cy,a.w*(.96+breath*.06),a.h*.74,`rgba(22,72,82,${.33*pulse})`);
    glow(c,cx+a.w*(.19+Math.sin(time*.29)*.12),cy+a.h*.12,a.w*.66,a.h*.52,`rgba(0,145,137,${.24+pulse*.08})`);
    glow(c,cx-a.w*.24,cy-a.h*(.16+Math.cos(time*.31)*.07),a.w*.58,a.h*.49,'rgba(62,87,128,.20)');
    // Deep, slowly translating stars with only a few bright diffraction glints.
    // The foreground and distant layers travel at different speeds.
    c.save();c.globalCompositeOperation='lighter';
    for(let i=0;i<(s.compact?550:stars.length);i++){
      const p=stars[i],x=(p.u*w+time*(1.1+p.depth*4.2))%w;
      const y=(p.v*h+time*(.3+p.depth*.65)+Math.sin(time*.18+p.phase)*6)%h;
      const textSide=hero&&(s.compact?y<a.y-a.h*.48:x<w*.48);
      const edge=Math.min(1,x/30,(w-x)/30);
      const alpha=(.32+p.depth*.45)*(.81+.19*Math.sin(time*.65+p.phase))*(textSide?.10:hero?.68:.22)*edge;
      const tone=p.tone>.95?3:p.tone>.76?1:0;
      const size=2+p.size*(p.depth>.9?3.4:1.5);
      star(c,x,y,size,alpha,tone);
      if(p.depth>.992){
        c.globalAlpha=alpha*.38;
        const length=5+p.size*3;
        const g=c.createLinearGradient(x-length,y,x+length,y);
        g.addColorStop(0,'rgba(210,239,250,0)');g.addColorStop(.5,'rgba(210,239,250,.8)');g.addColorStop(1,'rgba(210,239,250,0)');
        c.fillStyle=g;c.fillRect(x-length,y-.35,length*2,.7);
        c.save();c.translate(x,y);c.rotate(Math.PI/2);c.translate(-x,-y);c.fillRect(x-length,y-.35,length*2,.7);c.restore();
        star(c,x,y,22,alpha*.28,tone);
      }
    }
    c.restore();
    if(hero){
      c.save();c.globalCompositeOperation='lighter';
      // Differential speeds keep the dust circulating like a current, with
      // visible travel even when a visitor has not moved the pointer.
      for(let i=0;i<(s.compact?380:650);i++){
        const p=dust[i],speed=.055+.075*(1.3-p.radius),angle=p.angle+time*speed;
        const r=p.radius+Math.sin(time*.35+p.phase)*.035;
        const xx=Math.cos(angle)*a.w*.75*r,yy=Math.sin(angle)*a.w*.40*r;
        const x=cx+xx*.94+yy*.34,y=cy-xx*.34+yy*.94;
        const alpha=(.23+.12*Math.sin(p.phase+time*.55))*(1-r*.40);
        if(i%19===0){
          // Short, tapered wakes reveal the direction of travel.
          for(let trail=5;trail>0;trail--){
            const t=angle-trail*.013,tx=Math.cos(t)*a.w*.75*r,ty=Math.sin(t)*a.w*.40*r;
            star(c,cx+tx*.94+ty*.34,cy-tx*.34+ty*.94,2+p.size,alpha*(1-trail/6)*.65,1);
          }
        }
        star(c,x,y,2+p.size*1.9,alpha,i%3?2:1);
      }
      // Precessing orbits and luminous wakes give the still page a clear rhythm.
      c.globalAlpha=1;
      for(let orbit=0;orbit<2;orbit++){
        const rotation=(orbit?-.58:-.32)+Math.sin(time*.24+orbit*2)*.10;
        const rx=a.w*(orbit?.83:.76)*(1+breath*.014),ry=a.w*(orbit?.39:.58);
        c.save();c.globalAlpha=1;c.translate(cx,cy);c.rotate(rotation);
        c.strokeStyle=orbit?'rgba(101,227,193,.13)':'rgba(181,224,216,.21)';
        c.lineWidth=.65;c.beginPath();c.ellipse(0,0,rx,ry,0,0,TAU);c.stroke();
        const direction=orbit?-1:1,angle=time*(orbit?-.15:.19)+(orbit?2.4:5.2);
        for(let trail=30;trail>0;trail--){
          const tail=angle-direction*trail*.021,next=tail+direction*.023;
          c.globalAlpha=(1-trail/31)*.62;
          c.strokeStyle=orbit?'#65e3c1':'#c9e9f4';c.lineWidth=.7+(1-trail/31)*.7;
          c.beginPath();c.ellipse(0,0,rx,ry,0,tail,next,direction<0);c.stroke();
        }
        star(c,Math.cos(angle)*rx,Math.sin(angle)*ry,orbit?19:24,.94,orbit?1:0);
        c.restore();
      }
      const size=a.w*(1+breath*.025),step=dt*60,radius=s.compact?72:110;
      let displacement=0,affected=0;
      const yaw=Math.sin(time*.32)*.21,roll=Math.sin(time*.26)*.035,driftScale=size/355;
      const cosRoll=Math.cos(roll),sinRoll=Math.sin(roll),cosYaw=Math.cos(yaw),sinYaw=Math.sin(yaw);
      const lightBand=Math.sin(time*.43)*.8;
      for(const p of s.particles){
        // Continuous, slow trajectories through a coherent flow field. Each star
        // changes position, rather than just blinking on a fixed logo bitmap.
        const phase=time*p.speed*2.1+p.phase;
        const flowX=Math.sin(p.v*5+time*.52)*7+Math.cos(phase)*p.drift;
        const flowY=Math.cos(p.u*5+time*.43)*5+Math.sin(phase+p.orbit)*p.drift;
        const localX=(p.u*cosYaw+p.z*sinYaw)*size+flowX*driftScale;
        const localY=p.v*size+flowY*driftScale;
        const bx=cx+localX*cosRoll-localY*sinRoll,by=cy+localX*sinRoll+localY*cosRoll;
        if(p===s.particles[0])s.driftSample=[bx,by];
        if(dt){
          if(s.pointerActive){
            const dx=bx+p.dx-s.mx,dy=by+p.dy-s.my,d=Math.hypot(dx,dy);
            if(d<radius){const force=(1-d/radius)*2.8,angle=d<.1?p.phase:Math.atan2(dy,dx);p.vx+=Math.cos(angle)*force*step;p.vy+=Math.sin(angle)*force*step;affected++;}
          }
          p.vx+=-p.dx*.022*step;p.vy+=-p.dy*.022*step;
          const damping=Math.pow(.86,step);p.vx*=damping;p.vy*=damping;p.dx+=p.vx*step;p.dy+=p.vy*step;
        }
        const offset=Math.hypot(p.dx,p.dy);displacement=Math.max(displacement,offset);
        // A broad traveling highlight moves through the mark like reflected light;
        // it never switches the silhouette off or flashes the whole scene.
        const bandDistance=(p.u*.55+p.v-lightBand)/.18;
        const shimmer=Math.exp(-bandDistance*bandDistance);
        const alpha=Math.min(1,p.light*(.73+.12*Math.sin(time*.6+p.phase)+shimmer*.42));
        const x=bx+p.dx,y=by+p.dy,pixel=(s.compact?3.5:4.2)*p.size;
        // Fine points form the mark; a sparse, defocused layer adds depth.
        star(c,x,y,p.depth>.92?pixel*2.2:pixel,alpha*(p.depth>.92?.5:1),offset>10?1:p.tone);
        if(p.depth>.986)star(c,x,y,pixel*(3+shimmer*2),shimmer*.28,p.tone);
      }
      s.displacement=displacement;s.affected=affected;c.restore();
    }
    if(s.kind==='contact'){
      // A continuous field of fine points carries the lifecycle motif into the closing invitation.
      c.save();c.globalCompositeOperation='lighter';
      const cols=s.compact?95:210,rows=s.compact?22:38;
      for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
        const u=col/(cols-1),v=row/(rows-1);
        const x=u*w,y=h*(.79+Math.sin(u*6.4+time*.14+v*.8)*.13)+(v-.5)*h*.27;
        const alpha=(.20+v*.36)*(u<.43?.38:1);
        star(c,x,y,2.6+v*2.4,alpha,1);
      }
      c.restore();
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
    setCamera(value){cameraTravel=Math.min(1,Math.max(0,Number(value)||0));},
    get status(){return{version:VERSION,shape:'logo-pixels',paused:userPaused,running:allowed()&&Boolean(frame),frames:draws,logoPoints:logoPoints.length,active:scenes.filter(s=>s.visible).length,scenes:scenes.map(s=>({kind:s.kind,frames:s.frames,visible:s.visible,failed:s.failed,particles:s.particles.length,pointerActive:s.pointerActive,displacement:s.displacement,affected:s.affected,driftSample:s.driftSample}))};},
    destroy(){stop();observer?.disconnect();dialogs.disconnect();cleanups.forEach(fn=>fn());scenes.forEach(s=>{s.canvas.remove();s.host.classList.remove('ambient-scene');delete s.host.dataset.motionVersion;});control.remove();hint.remove();delete document.documentElement.dataset.ambientMotion;delete window.PTR_MOTION;}
  };
  sync();
})();
