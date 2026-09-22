/* Gentle motion only. No canvas, pointer tracking, pinned scenes, or scroll loops. */
'use strict';
(() => {
  const root=document.documentElement, hero=document.querySelector('.hero');
  const control=document.querySelector('.gentle-motion');
  if(!hero||!control)return;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=false, visible=true;
  function sync(){
    const reduced=preference.matches;
    root.dataset.ambientMotion=paused||reduced?'paused':'running';
    root.dataset.motionIdle=!visible||document.hidden||document.querySelector('dialog[open]')?'paused':'running';
    control.textContent=reduced?'Reduced motion':paused?'Resume motion':'Pause motion';
    control.setAttribute('aria-pressed',String(paused||reduced));
    control.disabled=reduced;
  }
  control.addEventListener('click',()=>{paused=!paused;sync();});
  preference.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(hero);
  sync();
})();
