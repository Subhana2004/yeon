/* YEON Navigation Studio — four working alternatives inside one existing site.
 * No separate domains; selection is persisted in browser-local storage.
 * This module intercepts only the Tools trigger and Studio buttons, preserving
 * the existing YEON research routing, search, notes and other controls.
 */
(function(){
'use strict';
const MODES=['morph','ribbon','command','side'];
const LABELS={morph:'Morph',ribbon:'Ribbon',command:'Command',side:'Index'};
const IDS={morph:'nav-morph',ribbon:'nav-ribbon',command:'nav-command',side:'nav-side'};
const PAGES=[
 {route:'discover',name:'Explore YEON',detail:'Start with research questions',words:'home landing'},
 {route:'index',name:'Research index',detail:'Browse all fictional lab examples',words:'labs search questions'},
 {route:'compare',name:'Compare',detail:'Contrast two research approaches',words:'methods side by side'},
 {route:'topics',name:'Topic atlas',detail:'Follow related research fields',words:'vision language systems'},
 {route:'doors',name:'Open Doors',detail:'Verify opportunities from sources',words:'eligibility scholarships openings'},
 {route:'fit',name:'Fit Lens',detail:'Find overlap with your interests',words:'matching fields'},
 {route:'faceoff',name:'Research Face-Off',detail:'Challenge a method under stress',words:'experiments claims'},
 {route:'desk',name:'My desk',detail:'Saved questions and personal notes',words:'bookmarks export'}
];
const root=document.body;
const trigger=document.getElementById('tools-trigger');
const studio=document.getElementById('nav-lab-switcher');
const toggles=[...document.querySelectorAll('#nav-lab-switcher button[data-nav-mode]')];
const primary=document.querySelector('.primary-nav');
const morph=document.getElementById('nav-morph');
const ribbon=document.getElementById('nav-ribbon');
const command=document.getElementById('nav-command');
const search=document.getElementById('nav-command-query');
const results=document.getElementById('nav-command-results');
const side=document.getElementById('nav-side');
const shade=document.getElementById('nav-side-shade');
const mobileDock=document.querySelector('.mobile-bottom-nav');
const defaultMobile=mobileDock?.innerHTML||'';
const status=document.querySelector('.nav-lab-hint');
if(!trigger||!studio||!morph||!ribbon||!command||!side||!shade)return;
let mode='morph',open=false,activeResult=-1,mobileSwapped=false;
let previousFocus=null;
const mobile=window.matchMedia('(max-width: 980px)');
function readMode(){
 try{const stored=localStorage.getItem('yeon_nav_studio_choice');return MODES.includes(stored)?stored:'morph';}
 catch{return 'morph';}
}
function storeMode(m){try{localStorage.setItem('yeon_nav_studio_choice',m)}catch{}}
function esc(value){return String(value).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))}
function applyMobileMorph(){
 if(!mobileDock)return;
 if(mode==='morph')trigger.setAttribute('aria-controls',mobile.matches?'mobile-quick-nav':'nav-morph');
 const shouldSwap=open&&mode==='morph'&&mobile.matches;
 if(shouldSwap&&!mobileSwapped){
  mobileDock.innerHTML=[
   ['topics','Topic atlas','⌘'],['doors','Open Doors','◎'],
   ['fit','Fit Lens','✳'],['faceoff','Face-Off','⇄']
  ].map(([route,label,glyph])=>'<a href="#'+route+'" data-route="'+route+'"><span aria-hidden="true">'+glyph+'</span><small>'+label+'</small></a>').join('');
  mobileSwapped=true;
 }else if(!shouldSwap&&mobileSwapped){
  mobileDock.innerHTML=defaultMobile;
  mobileSwapped=false;
 }
 const current=location.hash.slice(1);
 mobileDock.querySelectorAll('[data-route]').forEach(link=>{
  const selected=link.dataset.route===(current.startsWith('lab/')?'index':current||'discover');
  link.classList.toggle('active',selected);
  if(selected)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
 });
}
function hidePanels(){
 morph.hidden=true;ribbon.hidden=true;command.hidden=true;side.hidden=true;shade.hidden=true;
 root.classList.remove('nav-lab-open','nav-lab-side-open');
 trigger.setAttribute('aria-expanded','false');
 open=false;activeResult=-1;
 applyMobileMorph();
}
function close({focus=false}={}){
 if(!open)return;
 hidePanels();
 if(focus)trigger.focus({preventScroll:true});
}
function setMode(newMode){
 if(!MODES.includes(newMode))return;
 close();
 mode=newMode;
 root.dataset.navMode=newMode;
 toggles.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.navMode===newMode)));
 trigger.setAttribute('aria-controls',newMode==='morph'&&mobile.matches?'mobile-quick-nav':IDS[newMode]);
 trigger.setAttribute('aria-label','Open '+LABELS[newMode]+' navigation tools');
 trigger.innerHTML=mode==='command'
  ? '<span aria-hidden="true">⌕</span> Tools <span class="tools-chevron" aria-hidden="true">↗</span>'
  :mode==='side'
  ? '<span aria-hidden="true">☷</span> Tools <span class="tools-chevron" aria-hidden="true">↗</span>'
  :mode==='ribbon'
  ? '<span aria-hidden="true">⌄</span> Tools <span class="tools-chevron" aria-hidden="true">↗</span>'
  : '<span aria-hidden="true">✳</span> Tools <span class="tools-chevron" aria-hidden="true">↗</span>';
 if(status)status.innerHTML='Try <strong>'+LABELS[newMode]+'</strong> — click <strong>Tools ↗</strong>';
 storeMode(newMode);
}
function searchCommands(query){
 const labs=Array.isArray(window.YEON_LABS)?window.YEON_LABS:[];
 const q=query.toLowerCase().trim();
 const candidates=[
   ...PAGES.map(p=>({...p,type:'page'})),
   ...labs.map(l=>({route:l.id,name:l.name,detail:l.question||l.focus,words:[l.field,l.focus,...(l.topics||[])].join(' '),type:'lab'}))
 ];
 const filtered=candidates.filter(p=>!q||[p.name,p.detail,p.words].join(' ').toLowerCase().includes(q));
 results.innerHTML=filtered.length?filtered.slice(0,10).map(p=>
  p.type==='page'
   ? '<a href="#'+esc(p.route)+'" data-route="'+esc(p.route)+'" class="nav-command-item" role="listitem"><span><strong>'+esc(p.name)+'</strong><small>'+esc(p.detail)+'</small></span><span aria-hidden="true">↗</span></a>'
   : '<button type="button" data-lab="'+esc(p.route)+'" class="nav-command-item" role="listitem"><span><strong>'+esc(p.name)+'</strong><small>'+esc(p.detail)+'</small></span><span aria-hidden="true">↗</span></button>'
 ).join(''):'<div class="nav-empty">No matching destination. Try “compare”, “systems”, or “notes”.</div>';
 activeResult=-1;
}
function openMode(){
 if(open){close({focus:true});return}
 previousFocus=document.activeElement;
 open=true;root.classList.add('nav-lab-open');
 trigger.setAttribute('aria-expanded','true');
 trigger.setAttribute('aria-label','Close '+LABELS[mode]+' navigation tools');
 if(mode==='morph'){
  morph.hidden=false;
  applyMobileMorph();
 }else if(mode==='ribbon'){
  ribbon.hidden=false;
  // The ribbon is in the document flow inside the sticky header.
 }else if(mode==='command'){
  command.hidden=false;search.value='';searchCommands('');search.focus({preventScroll:true});
 }else if(mode==='side'){
  side.hidden=false;shade.hidden=false;root.classList.add('nav-lab-side-open');
  document.getElementById('nav-side-close').focus({preventScroll:true});
 }
}
function maybeCloseForOutside(event){
 if(!open)return;
 const inHeader=event.target.closest('#tools-trigger');
 const inPanel=event.target.closest('#nav-morph,#nav-ribbon,#nav-command,#nav-side');
 const inSwitcher=event.target.closest('#nav-lab-switcher');
 if(!inHeader&&!inPanel&&!inSwitcher)close();
}
function cmdElements(){return [...results.querySelectorAll('.nav-command-item')]}
function chooseCmd(delta){
 const all=cmdElements();
 if(!all.length)return;
 activeResult=(activeResult+delta+all.length)%all.length;
 all.forEach((x,i)=>x.classList.toggle('is-result-active',i===activeResult));
 all[activeResult].scrollIntoView({block:'nearest'});
}
function trapSideKey(event){
 const focusables=[...side.querySelectorAll('button:not([disabled]),a[href]')].filter(x=>!x.hidden);
 if(!focusables.length)return;
 const first=focusables[0],last=focusables[focusables.length-1];
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
}
document.addEventListener('click',event=>{
 const variant=event.target.closest('#nav-lab-switcher button[data-nav-mode]');
 if(variant){
  event.preventDefault();event.stopImmediatePropagation();
  setMode(variant.dataset.navMode);variant.focus({preventScroll:true});return;
 }
 if(event.target.closest('#tools-trigger')){
  event.preventDefault();event.stopImmediatePropagation();
  openMode();return;
 }
 if(event.target.closest('#nav-side-close,#nav-side-shade,#nav-command-close')){
  event.preventDefault();event.stopImmediatePropagation();
  close({focus:true});return;
 }
 if(event.target.closest('#nav-side a[data-route],#nav-ribbon a[data-route],#nav-morph a[data-route],#nav-command [data-route],#nav-command [data-lab]')){
  close();return; // Existing YEON click router performs the real navigation.
 }
 maybeCloseForOutside(event);
},true);
search?.addEventListener('input',()=>searchCommands(search.value));
search?.addEventListener('keydown',event=>{
 if(event.key==='ArrowDown'){event.preventDefault();chooseCmd(1)}
 else if(event.key==='ArrowUp'){event.preventDefault();chooseCmd(-1)}
 else if(event.key==='Enter'){
  const items=cmdElements();const chosen=items[activeResult>=0?activeResult:0];
  if(chosen){event.preventDefault();chosen.click();}
 }
});
document.addEventListener('keydown',event=>{
 const quick=document.getElementById('quick-overlay');
 if(open&&event.key==='Escape'&&(quick?.hidden!==false)){
  event.preventDefault();event.stopImmediatePropagation();close({focus:true});return;
 }
 if(open&&mode==='side'&&event.key==='Tab'){trapSideKey(event);return;}
 // Command variant makes the Tools toggle a functional searchable route surface.
 if(mode==='command'&&(event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){
  event.preventDefault();event.stopImmediatePropagation();
  if(open)close({focus:true});else openMode();return;
 }
},true);
window.addEventListener('hashchange',()=>close());
window.addEventListener('resize',()=>applyMobileMorph());
root.classList.add('nav-lab-enabled');
setMode(readMode());
})();
