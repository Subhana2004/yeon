/* YEON Field Notes: interactive, clearly illustrative research journeys.
   Works with static GitHub Pages. There is deliberately no fake research feed. */
(()=>{
  'use strict';
  const root=document.querySelector('.experience-v1');
  if(!root)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion=reduced?'auto':'smooth';
  const easeOut='cubic-bezier(.22,1,.36,1)';
  function easeInContent(element){
    if(reduced||!element||typeof element.animate!=='function')return;
    element.getAnimations().forEach(animation=>{
      if(animation.id==='yeon-content')animation.cancel();
    });
    const animation=element.animate(
      [{opacity:.38,transform:'translate3d(0,8px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],
      {duration:380,easing:easeOut,fill:'none'}
    );
    animation.id='yeon-content';
  }


  // HERO: the original note tabs now control a diagram and a keyboard-friendly pager.
  const card=root.querySelector('.editorial-card[data-switch]');
  if(card){
    const tabs=Array.from(card.querySelectorAll('[data-step]'));
    const map=card.querySelector('.research-map');
    const counter=card.querySelector('.journey-counter');
    function refreshHero(button){
      const i=tabs.indexOf(button);
      if(i<0)return;
      map.dataset.focus=button.dataset.step;
      counter.innerHTML=String(i+1).padStart(2,'0')+' <span class="journey-muted">/ 03 · EXPLORE THE NOTE</span>';
    }
    tabs.forEach(b=>b.addEventListener('click',()=>refreshHero(b)));
    function move(delta){
      const current=Math.max(0,tabs.findIndex(x=>x.getAttribute('aria-pressed')==='true'));
      tabs[(current+tabs.length+delta)%tabs.length].click();
    }
    card.querySelector('[data-prev]')?.addEventListener('click',()=>move(-1));
    card.querySelector('[data-next]')?.addEventListener('click',()=>move(1));
    card.addEventListener('keydown',e=>{
      if(!e.target.matches('.tab'))return;
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
        e.preventDefault();move(e.key==='ArrowRight'?1:-1);
        tabs.find(x=>x.getAttribute('aria-pressed')==='true')?.focus();
      }
    });
    refreshHero(tabs[0]);
  }

  // FEATURES: open a functional local concept specimen, never fictional 'live' data.
  const featureList=['compare','constellation','radar','doors','fit','faceoff'];
  const cards=Array.from(root.querySelectorAll('[data-feature]'));
  const inspector=root.querySelector('#feature-inspector');
  if(!inspector||!cards.length)return;
  const title=inspector.querySelector('#inspector-title');
  const description=inspector.querySelector('#inspector-description');
  const number=inspector.querySelector('#inspector-number');
  const sample=inspector.querySelector('#inspector-sample');
  const count=inspector.querySelector('#inspector-count');
  const specs={
    compare:{kicker:'02 / COMPARISON',title:'Lab Compare',desc:'Use the same questions to examine different laboratories. See research focus, documented work and evidence without assigning invented rankings.',
      html:`<div class="scene-top"><h4>Two research directions</h4><span class="scene-tag">ILLUSTRATIVE</span></div><div class="scene-columns" id="compare-columns"><div class="scene-card"><small>GROUP A</small><strong>Computer vision</strong><p>Methods, datasets and recent work</p></div><div class="scene-card"><small>GROUP B</small><strong>Language models</strong><p>Methods, datasets and recent work</p></div></div><button type="button" class="scene-action" data-compare-swap>⇄ Swap comparison</button>`},
    constellation:{kicker:'03 / DISCOVERY',title:'Constellation',desc:'Explore connections as paths supported by publications—not as assumptions about formal collaboration. Choose a node to inspect what each link would mean.',
      html:`<div class="scene-top"><h4>Trace a connection</h4><span class="scene-tag">MODEL / NOT DATA</span></div><div class="scene-map"><svg viewBox="0 0 360 140" aria-hidden="true"><path d="M56 38L172 77L303 30M56 38L303 30" stroke-dasharray="4 5"/></svg><button type="button" class="scene-node n-a" data-node="0" aria-pressed="true" aria-label="Research group A">A</button><button type="button" class="scene-node n-b" data-node="1" aria-pressed="false" aria-label="Published work">W</button><button type="button" class="scene-node n-c" data-node="2" aria-pressed="false" aria-label="Research group B">B</button></div><div class="scene-result" id="connection-result">Group A → an authored work. Clicking a node reveals the link type we would verify.</div>`},
    radar:{kicker:'04 / UPDATES',title:'Radar',desc:'Follow topics and researchers to make newly indexed public work easier to notice. Here, try a follow state without creating an account.',
      html:`<div class="scene-top"><h4>Research watchlist</h4><span class="scene-tag">LOCAL DEMO</span></div><div class="scene-card"><small>TOPIC</small><strong>Multimodal AI</strong><p>Public papers and code updates would appear here.</p></div><button type="button" class="scene-action" data-radar-follow aria-pressed="false">＋ Follow topic</button><div class="scene-result" id="radar-result">No topics followed in this preview.</div>`},
    doors:{kicker:'05 / OPPORTUNITIES',title:'Open Doors',desc:'Recruitment information needs a precise evidence state. Compare how an advertised notice, archived notice and unverified claim should appear.',
      html:`<div class="scene-top"><h4>Opportunity verification</h4><span class="scene-tag">STATUS EXAMPLE</span></div><div class="scene-choice"><button type="button" data-door="current" aria-pressed="true">Published</button><button type="button" data-door="archived" aria-pressed="false">Archived</button><button type="button" data-door="unknown" aria-pressed="false">Unverified</button></div><div class="scene-result" id="door-result">Published: cite the official notice and include a last-checked date. A public notice does not guarantee a position is still available.</div>`},
    fit:{kicker:'06 / RESEARCH INTERESTS',title:'Fit Lens',desc:'Match an interest to visible research evidence, not to an admissions prediction. Choose a topic to see what a transparent match explanation could show.',
      html:`<div class="scene-top"><h4>Explore interest overlap</h4><span class="scene-tag">EXPLAINABLE / CONCEPT</span></div><div class="scene-choice"><button type="button" data-fit="vision" aria-pressed="true">Vision</button><button type="button" data-fit="nlp" aria-pressed="false">Language</button><button type="button" data-fit="systems" aria-pressed="false">Systems</button></div><div class="scene-result" id="fit-result">Vision → show cited work involving image understanding; clearly separate direct matches from broad topic similarity.</div>`},
    faceoff:{kicker:'07 / METHODOLOGY',title:'Research Face-Off',desc:'Compare methods against the same question, while respecting differences in benchmarks and assumptions. Change the comparison lens below.',
      html:`<div class="scene-top"><h4>Method comparison lens</h4><span class="scene-tag">EXAMPLE / NO RANKING</span></div><div class="scene-choice"><button type="button" data-lens="approach" aria-pressed="true">Approach</button><button type="button" data-lens="evaluation" aria-pressed="false">Evaluation</button><button type="button" data-lens="limits" aria-pressed="false">Limitations</button></div><div class="scene-columns" style="margin-top:13px"><div class="scene-card"><small>METHOD A</small><strong id="method-a">Retrieval</strong><p id="method-a-detail">Uses external evidence.</p></div><div class="scene-card"><small>METHOD B</small><strong id="method-b">Verification</strong><p id="method-b-detail">Checks generated claims.</p></div></div>`}
  };
  let active=-1,lastCard=null;
  function show(index,focusTitle=false){
    const i=(index+featureList.length)%featureList.length;
    const spec=specs[featureList[i]];
    active=i;
    number.textContent=spec.kicker;
    title.textContent=spec.title;
    description.textContent=spec.desc;
    sample.innerHTML=spec.html;
    easeInContent(sample);
    count.textContent=String(i+1).padStart(2,'0')+' / 06';
    inspector.hidden=false;
    cards.forEach((c,n)=>{c.classList.toggle('is-active',n===i);c.setAttribute('aria-expanded',String(n===i));});
    if(focusTitle){inspector.scrollIntoView({behavior:motion,block:'nearest'});title.focus({preventScroll:true});}
  }
  function close(){
    inspector.hidden=true;cards.forEach(c=>{c.classList.remove('is-active');c.setAttribute('aria-expanded','false');});active=-1;
    lastCard?.focus({preventScroll:true});
  }
  cards.forEach((card,i)=>{
    card.addEventListener('click',()=>{lastCard=card;show(i,true);});
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();lastCard=card;show(i,true);}});
  });
  inspector.querySelector('.inspector-close')?.addEventListener('click',close);
  inspector.querySelector('[data-inspector-prev]')?.addEventListener('click',()=>show(active-1));
  inspector.querySelector('[data-inspector-next]')?.addEventListener('click',()=>show(active+1));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!inspector.hidden&&active>=0)close();});
  sample.addEventListener('click',e=>{
    const button=e.target.closest('button');if(!button)return;
    if(button.hasAttribute('data-compare-swap')){
      const columns=sample.querySelector('#compare-columns');const changed=columns.classList.toggle('swapped');
      button.textContent=changed?'⇄ Reset comparison':'⇄ Swap comparison';
    }
    if(button.hasAttribute('data-node')){
      const i=Number(button.dataset.node);
      sample.querySelectorAll('[data-node]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      sample.querySelector('#connection-result').textContent=[
        'Group A: the lab identity requires a verified institutional or laboratory source.',
        'Published work: the actual paper and author list would provide the connection evidence.',
        'Group B: coauthorship can indicate a research link, not necessarily formal collaboration.'
      ][i];
    }
    if(button.hasAttribute('data-radar-follow')){
      const on=button.getAttribute('aria-pressed')!=='true';
      button.setAttribute('aria-pressed',String(on));
      button.textContent=on?'✓ Following topic':'＋ Follow topic';
      sample.querySelector('#radar-result').textContent=on?'One topic followed for this preview. No account or notifications are created.':'No topics followed in this preview.';
    }
    const filters={
      door:{current:'Published: cite the official notice and include a last-checked date. A public notice does not guarantee a position is still available.',archived:'Archived: show the original notice with its historical date; never present it as an open position.',unknown:'Unverified: do not infer an opening. Ask users to check the official laboratory website.'},
      fit:{vision:'Vision → show cited work involving image understanding; clearly separate direct matches from broad topic similarity.',nlp:'Language → surface the lab’s published language-processing research, with paper references.',systems:'Systems → look for source-backed work on data systems, scaling and infrastructure.'}
    };
    for(const attr of ['door','fit'])if(button.hasAttribute('data-'+attr)){
      const val=button.dataset[attr];sample.querySelectorAll('[data-'+attr+']').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      sample.querySelector('#'+attr+'-result').textContent=filters[attr][val];
    }
    if(button.hasAttribute('data-lens')){
      const values={
        approach:['Retrieval','Uses external evidence.','Verification','Checks generated claims.'],
        evaluation:['Evidence quality','How well sources support answers.','Claim fidelity','Whether checked claims remain correct.'],
        limits:['Source availability','Missing or outdated source material.','Verifier coverage','Unchecked claims or unsupported assumptions.']
      }[button.dataset.lens];
      sample.querySelectorAll('[data-lens]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      ['method-a','method-a-detail','method-b','method-b-detail'].forEach((id,i)=>{sample.querySelector('#'+id).textContent=values[i];});
    }
  });
})();