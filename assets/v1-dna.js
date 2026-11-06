/* YEON Lab DNA visual switcher. The scenes are illustrative, not actual lab data. */
(()=>{
  'use strict';
  const dna=document.querySelector('.experience-v1 .dna-art');
  if(!dna)return;
  const board=dna.querySelector('.dna-artboard');
  const next=dna.querySelector('[data-dna-next]');
  const panes=[...dna.querySelectorAll('[data-dna-mode-pane]')];
  const modeTitle=dna.querySelector('[data-dna-mode-title]');
  const modeNumber=dna.querySelector('[data-dna-mode-number]');
  if(!board||!next||panes.length!==3||!modeTitle||!modeNumber)return;
  const names=['Living timeline','Research branches','Evolving layers'];
  let mode=0;
  function setMode(index){
    mode=(index+panes.length)%panes.length;
    panes.forEach((pane,i)=>{pane.hidden=i!==mode; pane.setAttribute('aria-hidden',String(i!==mode));});
    modeTitle.textContent=names[mode];
    modeNumber.textContent=String(mode+1).padStart(2,'0')+' / 03';
    next.setAttribute('aria-label','Switch Lab DNA animation. Now viewing '+names[mode]+'. Next: '+names[(mode+1)%names.length]);
    board.dataset.dnaMode=String(mode);
  }
  function syncStage(){
    const selected=dna.querySelector('[data-dna-step][aria-pressed="true"]');
    const n=selected?Number(selected.dataset.dnaStep):0;
    board.dataset.dnaStage=Number.isFinite(n)?String(n):'0';
  }
  next.addEventListener('click',()=>{setMode(mode+1);});
  const dots=[...dna.querySelectorAll('[data-dna-step]')];
  // Reflect existing Lab DNA stage selection, including keyboard and label clicks.
  const observer=new MutationObserver(syncStage);
  dots.forEach(b=>observer.observe(b,{attributes:true,attributeFilter:['aria-pressed']}));
  setMode(0);
  syncStage();
})();