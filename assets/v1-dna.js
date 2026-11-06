/* YEON Paper Trail Evolution: a three-chapter conceptual archive.
   No live laboratory metadata is represented. */
(()=>{
  'use strict';
  const dna=document.querySelector('.experience-v1 .dna-paper-trail');
  if(!dna)return;
  const button=dna.querySelector('#dna-next-chapter');
  const stack=dna.querySelector('#dna-trail-stack');
  const cards=[...dna.querySelectorAll('[data-sheet]')];
  const pagination=dna.querySelector('#dna-trail-page');
  const kicker=dna.querySelector('#dna-trail-kicker');
  const title=dna.querySelector('#dna-trail-summary');
  const description=dna.querySelector('#dna-trail-description');
  if(!button||!stack||cards.length!==3||!pagination||!kicker||!title||!description)return;
  const chapters=[
    {name:'Foundation',kicker:'CHAPTER 01 — FOUNDATION',title:'Trace the starting point',description:"A lab's story starts with the questions it chooses to investigate."},
    {name:'Development',kicker:'CHAPTER 02 — DEVELOPMENT',title:'Watch the methods evolve',description:'New studies refine assumptions, broaden methods, and open different lines of inquiry.'},
    {name:'New directions',kicker:'CHAPTER 03 — RECENT WORK',title:'See the next questions',description:'Recent published work reveals where research interests are moving — without predicting the future.'}
  ];
  let current=0;
  function show(index){
    current=(index+chapters.length)%chapters.length;
    const chapter=chapters[current];
    stack.dataset.chapter=String(current);
    cards.forEach((card,i)=>{
      const distance=(i-current+cards.length)%cards.length;
      const position=distance===0?'front':distance===1?'middle':'back';
      card.dataset.position=position;
      card.setAttribute('aria-hidden',String(position!=='front'));
    });
    pagination.innerHTML=String(current+1).padStart(2,'0')+' <i>/</i> 03';
    kicker.textContent=chapter.kicker;
    title.textContent=chapter.title;
    description.textContent=chapter.description;
    button.setAttribute('aria-label','Switch stage, currently '+chapter.name+'. Next: '+chapters[(current+1)%chapters.length].name);
  }
  button.addEventListener('click',()=>show(current+1));
  show(0);
})();