/* Lightweight page choreography. Native scroll, no dependencies. */
'use strict';
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const header=document.querySelector('.site-header');
  let frame=0;
  function update(){
    frame=0;
    const distance=document.documentElement.scrollHeight-innerHeight;
    header.style.setProperty('--reading',distance>0?Math.min(1,Math.max(0,scrollY/distance)):0);
    header.classList.toggle('scrolled',scrollY>25);
    if(scrollY<300)document.querySelectorAll('.nav-links .current').forEach(a=>a.classList.remove('current'));
  }
  function scroll(){if(!frame)frame=requestAnimationFrame(update);}
  addEventListener('scroll',scroll,{passive:true});
  addEventListener('resize',scroll,{passive:true});
  update();
  if('IntersectionObserver' in window){
    const reveal=new IntersectionObserver(entries=>{
      for(const e of entries)if(e.isIntersecting){e.target.classList.add('revealed');reveal.unobserve(e.target);}
    },{threshold:.08,rootMargin:'0px 0px -25px 0px'});
    if(!reduced.matches){
      document.querySelectorAll('.section-head,.value-grid article,.service-layout,.process-detail,.portal-grid,.reuse-copy,.people-grid,.parent-note,.industry-tabs,.industry-detail,.resource,.faq-grid,.cta .wrap').forEach(el=>{
        if(el.getBoundingClientRect().top>innerHeight){el.classList.add('reveal-ready');reveal.observe(el);}
      });
    }
    reduced.addEventListener('change',()=>{if(reduced.matches){reveal.disconnect();document.querySelectorAll('.reveal-ready').forEach(el=>el.classList.add('revealed'));}});
    const links=[...document.querySelectorAll('.nav-links a[href^="#"]')];
    const sections=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const nav=new IntersectionObserver(entries=>{
      for(const e of entries)if(e.isIntersecting)links.forEach(a=>a.classList.toggle('current',a.getAttribute('href')==='#'+e.target.id));
    },{rootMargin:'-15% 0px -65% 0px'});
    sections.forEach(el=>nav.observe(el));
  }
  document.fonts?.ready.then(()=>dispatchEvent(new Event('resize')));
})();
