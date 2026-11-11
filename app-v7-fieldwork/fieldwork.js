/* YEON Fieldwork — skill-first original UI
 * Local, fictional demo records. No network API, verified opportunities or university claims.
 * Interaction: browse -> read -> compare -> follow -> collect notes -> verify.
 */
(function(){
'use strict';
const labs=Array.isArray(window.YEON_LABS)?window.YEON_LABS:[];
const TOPICS=['Vision','Language','Multimodal','Systems'];
const VIEWS=[['discover','Explore'],['index','Research index'],['compare','Compare'],['topics','Topic atlas'],['desk','My desk'],['doors','Open Doors'],['fit','Fit Lens'],['faceoff','Research Face-Off'],['about','About']];
const CHECKS=[
 'The listing appears on the university or lab’s official website.',
 'Publication date, deadline and application status are verified.',
 'Eligibility and expectations match the original announcement.',
 'Funding, compensation or fees are explicitly described.',
 'Contact information and application links are confirmed on an official domain.'
];
const SCENARIOS={
 shift:{label:'Distribution shift',question:'What happens when the environment changes?',detail:'A system succeeds on the original test set. Real-world inputs change. Which claims remain supported?',checks:['Name the original test conditions and assumptions.','Design a new stress test with shifted inputs.','State the result that would falsify a claim of robustness.']},
 evidence:{label:'Missing evidence',question:'Can a system admit what it cannot know?',detail:'A key input is absent or conflicts with another source. Explain the uncertainty before comparing models.',checks:['Identify indispensable inputs and missing records.','Measure what happens when sources disagree.','Describe an abstention or uncertainty mechanism.']},
 reproduce:{label:'Reproducibility',question:'Could someone else retrace the experiment?',detail:'A result looks promising, but the original environment and artifact history are incomplete.',checks:['Recover revisions, seeds, configurations and provenance.','Link claims to reproducible outputs and independent evaluation.','Design an explicit failure and rerun criterion.']}
};
const el=document.getElementById('app');
const inputQuick=document.getElementById('quick-input');
const overlay=document.getElementById('quick-overlay');
function load(k,f){try{const s=localStorage.getItem(k);return s===null?f:JSON.parse(s)}catch{return f}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function n(n){return String(n).padStart(2,'0')}
function lab(id){return labs.find(x=>x.id===id)||labs[0]}
function valid(id){return labs.some(x=>x.id===id)}
function bullets(items){return '<ul>'+items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'}
function options(selected){return labs.map(l=>'<option value="'+esc(l.id)+'"'+(l.id===selected?' selected':'')+'>'+esc(l.name)+'</option>').join('')}
function tags(items){return '<div class="tags">'+items.map(x=>'<span class="tag">'+esc(x)+'</span>').join('')+'</div>'}
function sButtons(id,cls='btn ghost small'){return '<button type="button" class="'+cls+'" data-save-lab="'+esc(id)+'" aria-pressed="'+S.saved.has(id)+'">'+(S.saved.has(id)?'✓ Saved':'+ Save')+'</button>'}
const savedFromStore=load('yeon_fieldwork_saved',[]);
const topicFromStore=load('yeon_fieldwork_interests',['Language','Systems']);
const checksFromStore=load('yeon_fieldwork_checks',[]);
const notesFromStore=load('yeon_fieldwork_notes',{});
const S={route:'discover',feature:'mosaic',trail:'mosaic',search:'',topic:'All',selected:'mosaic',tab:'story',a:'mosaic',b:'vertex',axis:'question',
 saved:new Set(Array.isArray(savedFromStore)?savedFromStore.filter(valid):[]),
 notes:notesFromStore&&typeof notesFromStore==='object'&&!Array.isArray(notesFromStore)?notesFromStore:{},
 interests:new Set(Array.isArray(topicFromStore)?topicFromStore.filter(x=>TOPICS.includes(x)):[]),
 checks:new Set(Array.isArray(checksFromStore)?checksFromStore.filter(x=>Number.isInteger(x)&&x>=0&&x<CHECKS.length):[]),
 faceA:'horizon',faceB:'vertex',scenario:'shift',
 commandOpen:false,mobileOpen:false};
let toastTimer=null,previousFocus=null;
function tell(message){let t=document.getElementById('toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2300)}
function updateNavigation(){
 const active=S.route.startsWith('lab/')?'index':S.route;
 document.querySelectorAll('[data-route]').forEach(x=>{const on=x.dataset.route===active;x.classList.toggle('active',on);on?x.setAttribute('aria-current','page'):x.removeAttribute('aria-current')});
 document.querySelectorAll('.save-counter').forEach(x=>x.textContent=S.saved.size);
 const isTool=['topics','doors','fit','faceoff'].includes(active);
 document.getElementById('tools-trigger')?.classList.toggle('active',isTool);
 let label=(S.route.startsWith('lab/')?lab(S.route.slice(4)).name:VIEWS.find(x=>x[0]===S.route)?.[1]||'Fieldwork');
 document.title=label+' / YEON Fieldwork';
}
function headline(id,title,description,number){
 const hints={02:'Search the index · Open a profile · Save what matters',03:'Choose two labs · Pick one lens · Compare evidence',04:'Choose a research field · Follow a related question',05:'Your saved questions and notes, in one place',06:'Check official sources before contacting a lab',07:'Select your interests · Explore related labs',08:'Select a challenge · Test your assumptions',09:'How YEON handles examples, sources and privacy'};
 const hint=hints[number]||'Read · Question · Save';
 return '<header class="page-header"><div class="page-header-breadcrumb"><a href="#discover" data-route="discover">Home</a><span aria-hidden="true">/</span><span>'+esc(title.replace(/[.!]$/,''))+'</span><span class="page-chapter">FIELD NOTE '+esc(number)+'</span></div>'+
 '<div class="page-header-content"><div class="page-header-copy"><h1>'+esc(title)+'</h1><p>'+esc(description)+'</p></div>'+
 '<div class="page-header-guide"><span class="micro accent">HOW TO USE THIS PAGE</span><p>'+esc(hint)+'</p></div></div></header>';
}
function prototypeNote(){return '<p class="notice"><strong>Prototype disclosure:</strong> All eight laboratories and their research records are fictional. Topic overlap does not prove collaboration. No actual research opportunities, faculty details or admissions information have been verified.</p>'}
function featured(){
 const l=lab('mosaic');
 return '<aside class="hero-feature" aria-label="Example research field note">'+
 '<div class="feature-top"><span class="micro">FIELD NOTE / 02</span><span class="feature-status">ILLUSTRATIVE RESEARCH</span></div>'+
 '<div class="feature-body"><span class="micro accent">A QUESTION WORTH OPENING</span>'+
 '<h2>'+esc(l.question)+'</h2>'+
 '<p>'+esc(l.thesis)+'</p>'+
 '<div class="feature-insights"><div><span class="micro">THE APPROACH</span><strong>'+esc(l.methods[0])+'</strong></div><div><span class="micro">THE UNCERTAINTY</span><strong>'+esc(l.limits[0])+'</strong></div></div>'+
 '<button class="feature-open" type="button" data-lab="'+l.id+'"><span>Read this field note</span><span aria-hidden="true">↗</span></button></div>'+
 '<div class="feature-bottom"><span>QUESTION</span><span class="feature-connection" aria-hidden="true">───────</span><span>EVIDENCE</span><span class="feature-connection" aria-hidden="true">───────</span><span>LIMITS</span></div></aside>';
}
/* Guided research explorer.
   Make the first action obvious: choose one question, preview its evidence,
   then choose whether to read the complete research story. */
const HOME_TRAILS=['mosaic','horizon','vertex','dialogue'];
const TRAIL_LABELS={
 mosaic:{title:'Reliable answers',hint:'Fresh information'},
 horizon:{title:'Learning to adapt',hint:'Changing conditions'},
 vertex:{title:'Tracing evidence',hint:'Check sources'},
 dialogue:{title:'Explaining AI',hint:'Clear explanations'}
};
function guidedChoice(id,index){
 const l=lab(id),title=TRAIL_LABELS[id],active=S.trail===id;
 return '<button class="guided-choice'+(active?' is-active':'')+'" type="button" data-trail="'+esc(id)+'" aria-pressed="'+active+'" aria-controls="guided-preview-content">'+
  '<span class="guided-choice-index">'+n(index+1)+' <span>/ 04</span></span>'+
  '<span class="guided-choice-title">'+esc(title.title)+'</span>'+
  '<span class="guided-choice-hint">'+esc(title.hint)+'</span>'+
  '<span class="guided-choice-indicator" aria-hidden="true">'+(active?'✓':'↗')+'</span>'+
  '</button>';
}
function guidedPreview(id){
 const l=lab(id),position=HOME_TRAILS.indexOf(id)+1;
 return '<div class="guided-preview-body"><div class="guided-preview-main">'+
  '<span class="micro">YOU SELECTED · QUESTION '+n(position)+' OF 04</span>'+
  '<h3>'+esc(l.question)+'</h3>'+
  '<p>'+esc(l.thesis)+'</p>'+
  '<button type="button" class="btn primary guided-read" data-lab="'+esc(id)+'">Read the full research story <span aria-hidden="true">↗</span></button>'+
  '</div><div class="guided-preview-facts">'+
  '<div class="guided-fact"><span class="guided-fact-number">01</span><div><span class="micro">HOW THEY EXPLORE IT</span><p>'+esc(l.methods[0])+'</p></div></div>'+
  '<div class="guided-fact"><span class="guided-fact-number">02</span><div><span class="micro">WHAT TO QUESTION</span><p>'+esc(l.limits[0])+'</p></div></div>'+
  '<p class="guided-prototype-note">Illustrative research profile, not a verified laboratory.</p>'+
  '</div></div>';
}
function guidedExplorer(){
 if(!HOME_TRAILS.includes(S.trail))S.trail=HOME_TRAILS[0];
 return '<div class="guided-explorer">'+
  '<div class="guided-options" role="group" aria-label="Choose one research question">'+HOME_TRAILS.map(guidedChoice).join('')+'</div>'+
  '<section class="guided-preview" id="guided-preview" aria-label="Selected question preview">'+
   '<div id="guided-preview-content" aria-live="polite" aria-atomic="true">'+guidedPreview(S.trail)+'</div>'+
  '</section></div>';
}
function activateTrail(id,{keyboard=false}={}){
 if(!HOME_TRAILS.includes(id))return;
 S.trail=id;
 document.querySelectorAll('[data-trail]').forEach(btn=>{
  const active=btn.dataset.trail===id;btn.classList.toggle('is-active',active);
  btn.setAttribute('aria-pressed',String(active));
  const icon=btn.querySelector('.guided-choice-indicator');
  if(icon)icon.textContent=active?'✓':'↗';
 });
 const preview=document.getElementById('guided-preview-content');
 if(preview)preview.innerHTML=guidedPreview(id);
 const current=document.querySelector('[data-trail="'+id+'"]');
 current?.focus({preventScroll:true});
 // A repeated selection is immediate: no expanding grid, scroll jumps, or delayed keyboard motion.
}
function home(){
 return '<div class="view home-view"><section class="research-hero"><div class="container">'+
 '<div class="issue-line"><span class="micro"><i class="issue-dot" aria-hidden="true"></i> YEON / RESEARCH FIELD GUIDE</span><span class="micro">READ BETTER · RESEARCH BETTER</span></div>'+
 '<div class="hero-layout"><div class="hero-left"><div class="hero-prelude"><span class="prelude-line"></span><span>RESEARCH WITHOUT THE NOISE</span></div>'+
 '<h1>Good research starts with <span class="insight">better questions.</span></h1>'+
 '<p>Go beyond laboratory names. Understand <strong>what researchers investigate, how they approach a problem, and where their claims stop.</strong></p>'+
 '<div class="hero-cta"><button class="btn primary" type="button" data-nav-button="index">Explore research <span class="arrow">↗</span></button>'+
 '<button class="btn ghost" type="button" data-nav-button="compare">See how Compare works <span class="arrow">→</span></button></div>'+
 '<div class="hero-mini"><span class="mini-icon" aria-hidden="true">↘</span><span>A reading-first research guide. Example labs are fictional and clearly marked.</span></div></div>'+
 featured()+'</div></div></section>'+
 '<div class="trust-band"><div class="container"><div class="trust-item"><span>01</span><span>Find an interesting question</span></div><div class="trust-item"><span>02</span><span>Understand the evidence</span></div><div class="trust-item"><span>03</span><span>Save your next step</span></div></div></div>'+
 '<div class="container home-content"><section class="guided-section" aria-labelledby="trails-heading">'+
 '<div class="guided-heading"><div><span class="micro accent">EXPLORE BY CURIOSITY</span><h2 id="trails-heading">Where would you start?</h2></div>'+
 '<div class="guided-intro"><p>Pick a topic. Get the question, an example approach, and what needs checking—all in one place.</p>'+
 '<button type="button" class="text-action" data-nav-button="index">See all eight examples ↗</button></div></div>'+
 guidedExplorer()+
 '</section>'+
 '<section class="home-pathways" aria-labelledby="paths-heading"><div class="pathways-heading"><div><span class="micro accent">WHEN YOU'RE READY TO GO DEEPER</span><h2 id="paths-heading">Make research your own.</h2></div><p>Use the same research thread to compare ideas, examine limitations and keep a record of what you find.</p></div>'+
 '<div class="pathways-grid">'+
 '<button type="button" class="pathway" data-nav-button="compare"><span class="pathway-top"><span>01 / COMPARE</span><span aria-hidden="true">↗</span></span><strong>Different methods.<br>One clear view.</strong><span class="pathway-bottom">Compare questions, assumptions and limitations.</span></button>'+
 '<button type="button" class="pathway" data-nav-button="topics"><span class="pathway-top"><span>02 / EXPLORE</span><span aria-hidden="true">↗</span></span><strong>Follow a topic.<br>Find a connection.</strong><span class="pathway-bottom">See where research directions overlap.</span></button>'+
 '<button type="button" class="pathway" data-nav-button="desk"><span class="pathway-top"><span>03 / COLLECT</span><span aria-hidden="true">↗</span></span><strong>A space for<br>your questions.</strong><span class="pathway-bottom">Save labs and export your reading notes.</span></button>'+
 '</div></section></div></div>';
}
function matched(){
 const q=S.search.trim().toLowerCase();
 return labs.filter(l=>(S.topic==='All'||l.topics.includes(S.topic)) && (!q||[l.name,l.focus,l.question,l.thesis,l.institution,l.field,...l.topics,...l.methods,...l.limits].join(' ').toLowerCase().includes(q)));
}
function indexRows(){
 const hits=matched();
 return '<div class="index-result-line"><span><strong>'+n(hits.length)+'</strong> OF '+n(labs.length)+' SAMPLE RESEARCH RECORDS</span><button type="button" data-reset-index>Reset search &amp; filters</button></div>'+
 '<div class="index-list">'+(hits.length?hits.map(l=>'<button class="index-record" type="button" data-lab="'+l.id+'"><span class="index-num">'+esc(l.number)+'</span><span><h2>'+esc(l.name)+'</h2><p>'+esc(l.question)+'</p></span><span class="index-field">'+esc(l.field)+'</span><span class="go-dot" aria-hidden="true">↗</span></button>').join(''):
 '<div class="index-empty"><h2>No sample records found.</h2><p>Try a broader question, method or research field. Your previous notes remain saved.</p><button class="btn ghost" type="button" data-reset-index>Show all research ↗</button></div>')+'</div>';
}
function index(){
 return '<div class="view container page">'+headline('02','Research starts here.','An index of research questions, not a ranking of universities. Search the fictional examples and open the complete reading trail.','02')+
 '<div class="index-controls"><label class="index-search"><span aria-hidden="true">⌕</span><span class="sr-only">Search research questions</span><input type="search" id="index-query" autocomplete="off" placeholder="Search a question, method or laboratory…" value="'+esc(S.search)+'"></label>'+
 '<div class="topic-filter" role="group" aria-label="Filter research field">'+['All',...TOPICS].map(t=>'<button type="button" data-index-topic="'+t+'" aria-pressed="'+(t===S.topic)+'">'+t+'</button>').join('')+'</div></div>'+
 '<div id="index-results">'+indexRows()+'</div>'+prototypeNote()+'</div>';
}
function dossierBody(l){
 if(S.tab==='story')return '<section class="dossier-main container" role="tabpanel" id="tab-panel" aria-labelledby="tab-story">'+
 '<div class="dossier-intro"><div><span class="micro accent">RESEARCH CHAPTERS / 01–03</span><h2>How this question develops.</h2></div>'+
 '<div><p>The sequence below is a conceptual example, not a verified chronology or dated publication history. Use it to understand what a real reading trail should contain.</p></div></div>'+
 '<div class="chapters">'+l.chapters.map((ch,i)=>'<article class="chapter"><span>'+esc(ch[0])+'</span><h3>'+esc(ch[1])+'</h3><p>'+esc(ch[2])+'</p></article>').join('')+'</div>'+
 '<div class="dossier-panel"><span class="micro accent">THE BIG QUESTION</span><h2>'+esc(l.question)+'</h2><p class="intro">'+esc(l.thesis)+'</p>'+
 '<div class="evidence-pair"><section class="evidence-block"><h3>Methods investigated</h3>'+bullets(l.methods)+'</section>'+
 '<section class="evidence-block"><h3>Assumptions to examine</h3>'+bullets(l.assumptions)+'</section></div></div></section>';
 if(S.tab==='methods')return '<section class="dossier-main container dossier-panel" role="tabpanel" id="tab-panel" aria-labelledby="tab-methods"><span class="micro accent">THE METHOD / NOT THE HYPE</span><h2>How might the lab approach its question?</h2><p class="intro">'+esc(l.thesis)+'</p><div class="evidence-pair"><section class="evidence-block"><h3>Approach</h3>'+bullets(l.methods)+'</section><section class="evidence-block"><h3>Working assumptions</h3>'+bullets(l.assumptions)+'</section></div><p class="notice">These are fictional illustrative methods. Real research requires linked publications, evaluation details and code evidence.</p></section>';
 if(S.tab==='limits')return '<section class="dossier-main container dossier-panel" role="tabpanel" id="tab-panel" aria-labelledby="tab-limits"><span class="micro accent">THE LIMITS / REASONS FOR DOUBT</span><h2>Where might this approach fail?</h2><p class="intro">A strong research record explains where the claim stops. The items below are examples, not an independently established result.</p><div class="evidence-pair"><section class="evidence-block"><h3>Known constraints in this example</h3>'+bullets(l.limits)+'</section><section class="evidence-block"><h3>What must still be checked?</h3>'+bullets(l.assumptions)+'</section></div></section>';
 return '<section class="dossier-main container dossier-panel" role="tabpanel" id="tab-panel" aria-labelledby="tab-notes"><span class="micro accent">YOUR READING DESK / PRIVATE NOTES</span><h2>What would you ask next?</h2><p class="intro">Keep a question, a potential follow-up, or a source to verify later. Notes are saved in this browser, not transmitted to a server.</p>'+
 '<div class="fieldnote"><span class="micro">LOCAL FIELD NOTE / '+esc(l.short)+'</span><label for="note-text">Your research questions</label>'+
 '<textarea class="notes" id="note-text" data-note="'+l.id+'" placeholder="Write a follow-up question, limitation, paper to read, or experiment to investigate…">'+esc(S.notes[l.id]||'')+'</textarea>'+
 '<p id="note-status">Private browser storage only. Use My desk to export your notes.</p></div></section>';
}
function dossier(id){
 const l=lab(id);
 return '<div class="view"><div class="dossier-top"><div class="container"><div class="dossier-navline"><button type="button" class="dossier-back" data-nav-button="index">← Research index</button><span>FICTIONAL RESEARCH DOSSIER / '+esc(l.institution)+'</span></div>'+
 '<div class="dossier-header"><div><span class="micro">FIELDWORK / '+esc(l.field)+'</span><h1>'+esc(l.name)+'</h1><p class="question">'+esc(l.question)+'</p>'+
 '<div class="dossier-actions">'+sButtons(l.id,'btn coral')+'<button type="button" class="btn ink-on-dark" data-compare-lab="'+l.id+'">Compare approach ↗</button></div></div>'+
 '<div class="meta-block" aria-hidden="true"><strong>'+esc(l.number)+'</strong><p>THE RESEARCH READER</p></div></div></div></div>'+
 '<nav class="dossier-tabs" aria-label="Research sections"><div class="container" role="tablist" aria-label="Research dossier perspectives">'+[['story','Research trail'],['methods','Methods'],['limits','Limitations'],['notes','My notes']].map(x=>'<button type="button" role="tab" id="tab-'+x[0]+'" data-dossier-tab="'+x[0]+'" aria-controls="tab-panel" tabindex="'+(S.tab===x[0]?'0':'-1')+'" aria-selected="'+(S.tab===x[0])+'">'+x[1]+'</button>').join('')+'</div></nav>'+
 '<div id="dossier-main">'+dossierBody(l)+'</div><div class="container">'+prototypeNote()+'</div></div>';
}
function compareBody(){
 const a=lab(S.a),b=lab(S.b),shared=a.topics.filter(t=>b.topics.includes(t));
 function field(l,axis){if(axis==='question')return '<blockquote>'+esc(l.question)+'</blockquote>';if(axis==='methods')return bullets(l.methods);if(axis==='assumptions')return bullets(l.assumptions);return bullets(l.limits)}
 return '<div class="compare-article">'+[a,b].map((l,i)=>'<article class="compared"><span class="micro">APPROACH '+(i?'B':'A')+' / '+esc(l.institution)+'</span><h2>'+esc(l.name)+'</h2>'+field(l,S.axis)+'<div class="caption">'+esc(l.focus)+'</div></article>').join('')+'</div>'+
 '<div class="compare-conclusion"><div><strong>'+esc(shared.length?'A shared theme: '+shared.join(' + '):'Distinct research areas.')+'</strong>'+
 '<p>Topic overlap does not demonstrate collaboration. Comparing fictional methods cannot establish which works better.</p></div><button type="button" class="btn ink-on-dark small" data-nav-button="faceoff">Challenge the methods ↗</button></div>';
}
function compare(){
 return '<div class="view container tool-page">'+headline('03','Put two questions under the same lens.','Choose two demonstration labs, select the aspect you care about, and read their approaches side by side. No invented scores.','03')+
 '<div class="compare-controls"><label><span class="field-label">First research direction</span><select class="select" data-select="a">'+options(S.a)+'</select></label>'+
 '<label><span class="field-label">Second research direction</span><select class="select" data-select="b">'+options(S.b)+'</select></label>'+
 '<button type="button" class="btn ghost" data-swap>⇄ Swap</button></div>'+
 '<div class="compare-toolbar" role="group" aria-label="Comparison reading lens"><span class="micro">READ WITH A LENS</span>'+
 [['question','Question'],['methods','Methods'],['assumptions','Assumptions'],['limits','Limitations']].map(t=>'<button type="button" data-axis="'+t[0]+'" aria-pressed="'+(S.axis===t[0])+'">'+t[1]+'</button>').join('')+'</div>'+
 '<div id="compare-content">'+compareBody()+'</div>'+prototypeNote()+'</div>';
}
function topics(){
 const briefs={Vision:'How systems interpret the visual world.',Language:'How models process and explain human language.',Multimodal:'How text, images and signals connect.',Systems:'How information systems stay reliable.'};
 return '<div class="view container tool-page">'+headline('04','Follow a topic across the index.','Explore research fields and follow a question that interests you. These are conceptual groupings, not claims of real lab collaboration.','04')+
 '<div class="topic-lanes">'+TOPICS.map((topic,i)=>{const related=labs.filter(l=>l.topics.includes(topic));return '<section class="topic-lane"><header><div class="topic-heading-label"><span class="micro accent">FIELD '+n(i+1)+'</span><h2>'+topic+'</h2><p>'+esc(briefs[topic])+'</p></div><span class="count">'+n(related.length)+' EXAMPLES</span></header>'+
 '<div class="topic-members">'+related.map(l=>'<button type="button" data-lab="'+l.id+'"><span><strong>'+esc(l.name)+'</strong><small>'+esc(l.focus)+'</small></span><span aria-hidden="true">↗</span></button>').join('')+'</div></section>';}).join('')+'</div>'+prototypeNote()+'</div>';
}
function desk(){
 let followed=labs.filter(l=>S.saved.has(l.id)),hasNotes=labs.filter(l=>S.notes[l.id]?.trim());
 return '<div class="view container tool-page">'+headline('05','Your research desk.','Your saved questions, reading notes and next steps in one quiet workspace. Nothing is uploaded to a server.','05')+
 '<div class="desk-layout"><aside class="desk-summary"><span class="micro">YOUR COLLECTION</span><div class="desk-number">'+n(followed.length)+'</div><strong>Questions saved</strong><p>'+hasNotes.length+' private note'+(hasNotes.length===1?'':'s')+' in this browser.</p>'+
 '<button class="btn ink-on-dark small" type="button" data-nav-button="index">Find more research ↗</button></aside>'+
 '<section class="desk-main"><div class="section-heading"><div><span class="micro accent">YOUR READING LIST</span><h2 class="section-title">Pick up where you left off.</h2></div></div>'+
 (followed.length?'<div class="desk-journal">'+followed.map(l=>'<article class="journal-entry"><span class="index-num">'+esc(l.number)+'</span><div><h3>'+esc(l.name)+'</h3><p>'+esc(l.question)+'</p></div><button type="button" class="text-action" data-lab="'+l.id+'">Continue reading ↗</button></article>').join('')+'</div>':
 '<div class="blank desk-empty"><span class="empty-symbol" aria-hidden="true">✳</span><h3>A good reading list starts with a question.</h3><p>Find a research example that interests you, then save it here to revisit later.</p><button class="btn primary small" type="button" data-nav-button="index">Explore the index ↗</button></div>')+
 '<div class="desk-export"><button type="button" class="btn ghost" data-export-notes>↓ Export my notes</button><p>Local Markdown file, whenever you need it.</p></div></section></div>'+prototypeNote()+'</div>';
}
function doors(){
 return '<div class="view container tool-page">'+headline('06','Opportunities need evidence.','A simple way to check whether a research opportunity is real before you reach out. YEON does not currently verify live openings.','06')+
 '<div class="doors-layout"><section class="doors-stat"><span class="micro">LIVE OPPORTUNITY STATUS</span><span class="doors-status-icon" aria-hidden="true">◎</span><h2>No verified openings yet.</h2>'+
 '<p>YEON does not currently connect to an official opportunities feed. Always verify details from a lab or university source.</p><div class="doors-status-foot"><strong>0</strong><span>verified listings connected</span></div></section>'+
 '<section class="doors-checklist"><span class="micro accent">BEFORE YOU APPLY</span><h2>A five-step source check</h2>'+
 '<p class="section-lead">Use this checklist while reviewing an official announcement. Checking a box here does not validate any real listing.</p>'+
 CHECKS.map((c,i)=>'<label class="check-item"><input type="checkbox" data-check="'+i+'" '+(S.checks.has(i)?'checked':'')+'><span>'+esc(c)+'</span></label>').join('')+
 '<div class="check-foot"><p class="check-status" id="check-status">'+S.checks.size+' / '+CHECKS.length+' STEPS MARKED · PRACTICE ONLY</p>'+
 '<button class="text-action" type="button" data-reset-checks>Reset checklist ↺</button></div></section></div>'+prototypeNote()+'</div>';
}
function fitRows(){
 const wanted=[...S.interests];if(!wanted.length)return '<div class="blank"><h3>Choose a research interest.</h3><p>Without any selected topics there is no basis for an overlap explanation.</p></div>';
 const matched=labs.map(l=>({l,overlap:l.topics.filter(t=>S.interests.has(t))})).sort((a,b)=>b.overlap.length-a.overlap.length||a.l.name.localeCompare(b.l.name));
 return '<div class="fit-list">'+matched.map((o,i)=>'<article class="fit-entry"><span>'+n(i+1)+'</span><div><h3>'+esc(o.l.name)+'</h3><p>'+esc(o.l.focus)+'</p></div>'+
 '<span class="overlap">'+o.overlap.length+'/'+wanted.length+' shared label'+(o.overlap.length===1?'':'s')+' · '+(o.overlap.length?esc(o.overlap.join(' + ')):'No shared tags')+'</span>'+
 '<button type="button" class="text-action" data-lab="'+o.l.id+'">Investigate ↗</button></article>').join('')+'</div>';
}
function fit(){
 return '<div class="view container tool-page">'+headline('07','Find your research interests.','A transparent intersection of topic labels. This is not a match score, admissions recommendation or faculty endorsement.','07')+
 '<section class="fit-controls"><span class="micro accent">WHAT DO YOU WANT TO STUDY?</span><h2>Select your interests</h2>'+
 '<div class="interests" role="group" aria-label="Choose research interests">'+TOPICS.map(t=>'<button type="button" data-interest="'+t+'" aria-pressed="'+S.interests.has(t)+'">'+t+'</button>').join('')+'</div>'+
 '<p id="fit-status" class="section-lead">'+S.interests.size+' topics selected. Results show shared labels only.</p></section>'+
 '<div id="fit-results">'+fitRows()+'</div><p class="notice"><strong>Interpretation matters:</strong> shared labels are only a transparent browse signal. Lab capacity, publications, funding and candidate eligibility require independent evidence.</p></div>';
}
function faceContent(){
 const sc=SCENARIOS[S.scenario],a=lab(S.faceA),b=lab(S.faceB);
 return '<section class="challenge-card"><div><span class="micro accent">THE RESEARCH PROBLEM</span><h2>'+esc(sc.question)+'</h2><p>'+esc(sc.detail)+'</p></div><div class="challenge-mark" aria-hidden="true">?</div></section>'+
 '<div class="compare-controls" style="margin-bottom:18px"><label><span class="field-label">Approach A</span><select class="select" data-select="faceA">'+options(S.faceA)+'</select></label>'+
 '<label><span class="field-label">Approach B</span><select class="select" data-select="faceB">'+options(S.faceB)+'</select></label>'+
 '<span class="micro subdued">CHANGE EITHER METHOD</span></div>'+
 '<div class="challenge-pair">'+[a,b].map((l,i)=>'<article class="challenge-paper"><span class="micro accent">APPROACH '+(i?'B':'A')+'</span><h3>'+esc(l.name)+'</h3><p>'+esc(l.question)+'</p>'+
 '<strong>Methods</strong>'+bullets(l.methods)+'<strong>Limits</strong>'+bullets(l.limits)+'</article>').join('')+'</div>'+
 '<section class="challenge-verdict"><span class="micro">HOW TO TEST THE CLAIMS</span><h2>Questions before a verdict.</h2>'+
 '<ul>'+sc.checks.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+
 '<strong>Verdict: evidence insufficient.</strong><p>Fictional profiles and no comparable experiments mean neither approach can be declared superior.</p>'+
 '<button type="button" class="btn ink-on-dark" data-save-challenge>+ Save this research question</button></section>';
}
function faceoff(){
 return '<div class="view container tool-page">'+headline('08','Test the claim, not the marketing.','Set a challenging scenario. Then examine what two methods would need to prove under the same conditions.','08')+
 '<div class="challenge-tabs" role="group" aria-label="Research challenge">'+Object.entries(SCENARIOS).map(([id,x])=>'<button type="button" data-scenario="'+id+'" aria-pressed="'+(id===S.scenario)+'">'+esc(x.label)+'</button>').join('')+'</div>'+
 '<div id="face-content">'+faceContent()+'</div>'+prototypeNote()+'</div>';
}
function about(){
 return '<div class="view container tool-page">'+headline('09','A research field guide, in progress.','YEON is a prototype for discovering research questions and their evidence, not a verified university directory.','09')+
 '<article class="about-page"><span class="micro accent">FIELDWORK / DESIGN PRINCIPLES</span>'+
 '<h2>What YEON does</h2><p>It helps a reader move from an interesting research question to the lab’s approach, possible limits, other related questions, and a private reading desk. Lab DNA, Compare, Topics, Open Doors, Fit Lens and Face-Off are part of that workflow.</p>'+
 '<h2>Are the research profiles real?</h2><p>No. Eight fictional laboratory examples are included to demonstrate a credible reading interface. No Korean professor record, official research paper, opportunity or admissions result is sourced or represented as verified.</p>'+
 '<h2>Is anything uploaded or synced?</h2><p>No. Saved demo labs, interest tags, notes and checklist selections use local browser storage when available. There is no user account or server-side note collection. You can export a local Markdown file.</p>'+
 '<h2>What would a real release require?</h2><p>Official research laboratory sources, verified publication metadata, explicit opportunity evidence, freshness tracking, provenance and a correction workflow before publishing profiles as factual.</p>'+
 '<button type="button" class="btn primary" data-nav-button="discover">Return to Explore ↗</button></article></div>';
}
const templates={discover:home,index:index,compare:compare,topics:topics,desk:desk,doors:doors,fit:fit,faceoff:faceoff,about:about};
function render(){
 if(!labs.length){el.innerHTML='<div class="container blank"><h3>Sample data unavailable.</h3><p>Confirm the data.js fixture is loaded.</p></div>';return}
 let fn=S.route.startsWith('lab/')?()=>dossier(S.route.slice(4)):templates[S.route]||home;
 el.innerHTML=fn();updateNavigation();
}
function route(to){
 if(to.startsWith('lab/')){if(!valid(to.slice(4)))to='index';else{S.selected=to.slice(4);S.tab='story';}}
 else if(!VIEWS.some(v=>v[0]===to))to='discover';
 S.route=to;if(location.hash!=='#'+to)history.pushState({},'', '#'+to);
 document.getElementById('mobile-nav').hidden=true;
 document.getElementById('mobile-trigger').setAttribute('aria-expanded','false');S.mobileOpen=false;
 closeTools();
 render();window.scrollTo({top:0,behavior:'instant'});
}
function redrawPreserve(selector){
 const y=window.scrollY;render();window.scrollTo({top:y,behavior:'instant'});if(selector){document.querySelector(selector)?.focus({preventScroll:true});}
}
function updateIndexResults(){const target=document.getElementById('index-results');if(target)target.innerHTML=indexRows();}
function toggleSaved(id){if(!valid(id))return;if(S.saved.has(id)){S.saved.delete(id);tell(lab(id).short+' removed from your desk.')}else{S.saved.add(id);tell(lab(id).short+' saved to your desk.')}save('yeon_fieldwork_saved',[...S.saved]);document.querySelectorAll('[data-save-lab="'+id+'"]').forEach(b=>{b.setAttribute('aria-pressed',S.saved.has(id));b.textContent=S.saved.has(id)?'✓ Saved':'+ Save'});updateNavigation();}
function saveChallenge(){const l=lab(S.faceA);const q=SCENARIOS[S.scenario].question;S.notes[l.id]=[S.notes[l.id]||'', 'Face-Off: '+q+' Compare '+l.name+' with '+lab(S.faceB).name+'. What would settle the comparison?'].filter(Boolean).join('\n\n');save('yeon_fieldwork_notes',S.notes);tell('Question saved to '+l.short+' notes.');}
function exportMarkdown(){
 let lines=['# YEON Fieldwork — Research notes','', '**Important: all eight lab profiles are fictional demonstrations, not real Korean university records.**','','## My followed questions'];
 labs.filter(l=>S.saved.has(l.id)).forEach(l=>lines.push('- '+l.name+': '+l.question));
 if(!S.saved.size)lines.push('(none)');
 lines.push('','## Private notes');
 labs.filter(l=>S.notes[l.id]?.trim()).forEach(l=>lines.push('','### '+l.name,'',S.notes[l.id]));
 if(!labs.some(l=>S.notes[l.id]?.trim()))lines.push('(none)');
 lines.push('','Exported from browser-local data. Validate all academic claims before using them.','');
 const blob=new Blob([lines.join('\n')],{type:'text/markdown;charset=utf-8'}),u=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=u;a.download='YEON-Fieldwork-Research-Notes.md';document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(u),450);tell('Research notes exported as Markdown.');
}
function quickEntries(q){
 const s=q.trim().toLowerCase();
 let items=[...VIEWS.map(([id,title])=>({id,title,type:'tool'})),...labs.map(l=>({id:l.id,title:l.name,type:'lab'}))].filter(x=>!s||(x.title+(x.type==='lab'?' '+lab(x.id).question+' '+lab(x.id).focus:'')).toLowerCase().includes(s));
 const box=document.getElementById('quick-results');
 box.innerHTML=items.slice(0,14).map(x=>'<button type="button" data-quick-type="'+x.type+'" data-quick-id="'+x.id+'"><span>'+esc(x.title)+'</span><small>'+x.type.toUpperCase()+' ↗</small></button>').join('')||'<div class="blank"><p>No sample records matched. Try a broader topic.</p></div>';
}
function closeTools(){
 const panel=document.getElementById('tools-panel'),button=document.getElementById('tools-trigger');
 if(panel)panel.hidden=true;
 if(button)button.setAttribute('aria-expanded','false');
}
function toggleTools(){
 const panel=document.getElementById('tools-panel'),button=document.getElementById('tools-trigger');
 if(!panel||!button)return;
 panel.hidden=!panel.hidden;
 button.setAttribute('aria-expanded',String(!panel.hidden));
}
function openQuick(){closeTools();previousFocus=document.activeElement;overlay.hidden=false;S.commandOpen=true;inputQuick.value='';quickEntries('');inputQuick.focus();}
function closeQuick(){overlay.hidden=true;S.commandOpen=false;previousFocus?.focus?.({preventScroll:true})}
document.addEventListener('click',function(ev){
 if(ev.target.closest('#tools-trigger')){toggleTools();return;}
 if(!ev.target.closest('#tools-panel'))closeTools();
 const link=ev.target.closest('a[data-route]');if(link){ev.preventDefault();route(link.dataset.route);return;}
 if(ev.target===overlay){closeQuick();return;}
 const b=ev.target.closest('button');if(!b)return;
 if(b.id==='mobile-trigger'){const p=document.getElementById('mobile-nav');p.hidden=!p.hidden;S.mobileOpen=!p.hidden;b.setAttribute('aria-expanded',String(!p.hidden));return;}
 if(b.id==='quick-open'){openQuick();return;}
 if(b.id==='quick-close'){closeQuick();return;}
 if(b.dataset.quickId){const to=b.dataset.quickType==='lab'?'lab/'+b.dataset.quickId:b.dataset.quickId;closeQuick();route(to);return;}
 if(b.dataset.navButton){route(b.dataset.navButton);return;}
 if(b.dataset.lab){route('lab/'+b.dataset.lab);return;}
 if(b.dataset.trail){activateTrail(b.dataset.trail);return;}
 if(b.dataset.feature){S.feature=b.dataset.feature;const old=document.querySelector('.hero-feature');if(old)old.outerHTML=featured();document.querySelector('[data-feature="'+S.feature+'"]')?.focus({preventScroll:true});return;}
 if(b.dataset.indexTopic){S.topic=b.dataset.indexTopic;document.querySelectorAll('[data-index-topic]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.indexTopic===S.topic)));updateIndexResults();return;}
 if(b.hasAttribute('data-reset-index')){S.search='';S.topic='All';document.getElementById('index-query').value='';document.querySelectorAll('[data-index-topic]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.indexTopic==='All')));updateIndexResults();document.getElementById('index-query')?.focus({preventScroll:true});return;}
 if(b.dataset.dossierTab){
  S.tab=b.dataset.dossierTab;document.getElementById('dossier-main').innerHTML=dossierBody(lab(S.selected));document.querySelectorAll('[data-dossier-tab]').forEach(x=>{const on=x.dataset.dossierTab===S.tab;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;});b.focus({preventScroll:true});return;
 }
 if(b.dataset.saveLab){toggleSaved(b.dataset.saveLab);return;}
 if(b.dataset.compareLab){S.a=b.dataset.compareLab;if(S.a===S.b)S.b=labs.find(x=>x.id!==S.a)?.id||S.b;route('compare');return;}
 if(b.dataset.axis){S.axis=b.dataset.axis;document.getElementById('compare-content').innerHTML=compareBody();document.querySelectorAll('[data-axis]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.axis===S.axis)));b.focus({preventScroll:true});return;}
 if(b.hasAttribute('data-swap')){[S.a,S.b]=[S.b,S.a];redrawPreserve('[data-swap]');return;}
 if(b.hasAttribute('data-export-notes')){exportMarkdown();return;}
 if(b.hasAttribute('data-reset-checks')){S.checks.clear();save('yeon_fieldwork_checks',[]);document.querySelectorAll('[data-check]').forEach(x=>x.checked=false);document.getElementById('check-status').textContent='0 / '+CHECKS.length+' STEPS MARKED · PRACTICE ONLY';return;}
 if(b.dataset.interest){const t=b.dataset.interest;S.interests.has(t)?S.interests.delete(t):S.interests.add(t);save('yeon_fieldwork_interests',[...S.interests]);b.setAttribute('aria-pressed',S.interests.has(t));document.getElementById('fit-results').innerHTML=fitRows();document.getElementById('fit-status').textContent=S.interests.size+' topics selected. Results show shared labels only.';return;}
 if(b.dataset.scenario){S.scenario=b.dataset.scenario;document.getElementById('face-content').innerHTML=faceContent();document.querySelectorAll('[data-scenario]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.scenario===S.scenario)));return;}
 if(b.hasAttribute('data-save-challenge')){saveChallenge();return;}
});
document.addEventListener('input',function(ev){
 const x=ev.target;if(x.id==='index-query'){S.search=x.value;updateIndexResults();return;}
 if(x.id==='quick-input'){quickEntries(x.value);return;}
 if(x.dataset.note){S.notes[x.dataset.note]=x.value;const good=save('yeon_fieldwork_notes',S.notes);const status=document.getElementById('note-status');if(status)status.textContent=good?'Saved locally. Export from My desk.':'Storage unavailable; copy your notes before leaving.';}
});
document.addEventListener('change',function(ev){
 const x=ev.target;
 if(x.dataset.select){if(['a','b','faceA','faceB'].includes(x.dataset.select)&&valid(x.value)){
 S[x.dataset.select]=x.value;
 if(x.dataset.select==='a'||x.dataset.select==='b')document.getElementById('compare-content').innerHTML=compareBody();
 else document.getElementById('face-content').innerHTML=faceContent();
 }return;}
 if(x.dataset.check!==undefined){let id=Number(x.dataset.check);x.checked?S.checks.add(id):S.checks.delete(id);save('yeon_fieldwork_checks',[...S.checks]);document.getElementById('check-status').textContent=S.checks.size+' / '+CHECKS.length+' STEPS MARKED · PRACTICE ONLY';}
});
document.addEventListener('keydown',function(ev){
 if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='k'){ev.preventDefault();S.commandOpen?closeQuick():openQuick();return;}
 if(ev.key==='Escape'){if(S.commandOpen){closeQuick();return;}closeTools();const menu=document.getElementById('mobile-nav');menu.hidden=true;document.getElementById('mobile-trigger').setAttribute('aria-expanded','false');return;}
 if(S.commandOpen){
  const controls=[inputQuick,...document.querySelectorAll('#quick-results button')];
  if(ev.key==='Tab'){const at=controls.indexOf(document.activeElement);if(at>=0){ev.preventDefault();controls[(at+(ev.shiftKey?-1:1)+controls.length)%controls.length].focus();}}
  if(ev.key==='Enter'&&document.activeElement===inputQuick){const first=document.querySelector('#quick-results button');if(first){ev.preventDefault();first.click();}}
  return;
 }
 const trail=ev.target.closest?.('[data-trail]');
 if(trail&&['ArrowLeft','ArrowRight','Home','End'].includes(ev.key)){
  ev.preventDefault();const at=HOME_TRAILS.indexOf(trail.dataset.trail);
  const next=ev.key==='Home'?0:ev.key==='End'?HOME_TRAILS.length-1:(at+(ev.key==='ArrowRight'?1:-1)+HOME_TRAILS.length)%HOME_TRAILS.length;
  activateTrail(HOME_TRAILS[next],{keyboard:true});return;
 }
 const tab=ev.target.closest?.('[data-dossier-tab]');
 if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(ev.key)){ev.preventDefault();const tabs=[...document.querySelectorAll('[data-dossier-tab]')],at=tabs.indexOf(tab),next=ev.key==='Home'?0:ev.key==='End'?tabs.length-1:(at+(ev.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();return;}
 const axis=ev.target.closest?.('[data-axis]');
 if(axis&&['ArrowLeft','ArrowRight','Home','End'].includes(ev.key)){ev.preventDefault();const tabs=[...document.querySelectorAll('[data-axis]')],at=tabs.indexOf(axis),next=ev.key==='Home'?0:ev.key==='End'?tabs.length-1:(at+(ev.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();return;}
 if(ev.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){ev.preventDefault();route('index');const search=document.getElementById('index-query');search?.focus();return;}
});
window.addEventListener('hashchange',()=>{const to=location.hash.slice(1);S.route=to.startsWith('lab/')&&valid(to.slice(4))?to:VIEWS.some(x=>x[0]===to)?to:'discover';if(S.route.startsWith('lab/'))S.selected=S.route.slice(4);render();window.scrollTo(0,0)});
const init=location.hash.slice(1);S.route=init.startsWith('lab/')&&valid(init.slice(4))?init:VIEWS.some(x=>x[0]===init)?init:'discover';if(S.route.startsWith('lab/'))S.selected=S.route.slice(4);render();
})();