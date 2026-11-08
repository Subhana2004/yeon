/* YEON V5 — a meaningful research-exploration prototype.
 * Everything displayed is demo data from eight fictional labs.
 * There are no network calls, fabricated live feeds, real vacancies, or AI-ranking claims.
 */
(function(){
'use strict';
var LABS=Array.isArray(window.YEON_LABS)?window.YEON_LABS:[];
var TOPICS=['Vision','Language','Multimodal','Systems'];
var FEATURES=[
  {id:'dna',n:'01',title:'Lab DNA',copy:'Follow how a research question becomes methods, experiments and limitations.'},
  {id:'compare',n:'02',title:'Lab Compare',copy:'Put two research approaches beside each other without a made-up score.'},
  {id:'constellation',n:'03',title:'Constellation',copy:'Find conceptual overlaps. Shared topics are not proof of collaboration.'},
  {id:'radar',n:'04',title:'Radar',copy:'Follow a lab and explore sample reading checkpoints in your research watchlist.'},
  {id:'doors',n:'05',title:'Open Doors',copy:'Practice verifying an opportunity before trusting a recruitment claim.'},
  {id:'fit',n:'06',title:'Fit Lens',copy:'See why a lab matches your interests and where your interests do not overlap.'},
  {id:'faceoff',n:'07',title:'Research Face-Off',copy:'Compare competing methods against a scenario, not a popularity score.'}
];
var POINTS={arbor:[22,25],mosaic:[47,18],horizon:[38,63],dialogue:[71,32],orchid:[14,70],vertex:[80,68],prism:[63,77],delta:[85,20]};
var QUESTION_STARTERS=[
  {id:'mosaic',label:'What happens when knowledge changes?',topic:'Systems'},
  {id:'prism',label:'When should signals stay separate?',topic:'Multimodal'},
  {id:'horizon',label:'Can learning survive a shifting world?',topic:'Vision'},
  {id:'vertex',label:'Where does an answer get its evidence?',topic:'Language'}
];
var CHECKS=[
  'Official laboratory or university announcement located',
  'Posting date and application deadline verified',
  'Funding and employment terms explicitly stated',
  'Eligibility criteria and role requirements recorded',
  'Contact information verified on an official domain'
];
function read(key,fallback){try{var v=localStorage.getItem(key);return v?JSON.parse(v):fallback;}catch(e){return fallback;}}
function store(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(e){/* storage is optional */}}
function safeId(id){return LABS.some(function(l){return l.id===id;})?id:'mosaic';}
function lab(id){return LABS.find(function(l){return l.id===id;})||LABS[0];}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function two(n){return String(n).padStart(2,'0');}
var storedSaved=read('yeon_v5_saved',[]);
var saved=new Set(Array.isArray(storedSaved)?storedSaved.filter(function(x){return LABS.some(function(l){return l.id===x;});}):[]);
var oldInterests=read('yeon_v5_interests',['Vision','Systems']);
var interests=new Set(Array.isArray(oldInterests)?oldInterests.filter(function(x){return TOPICS.includes(x);}):[]);
var checked=read('yeon_v5_checks',[]);
var state={
  route:'explore',selected:safeId(read('yeon_v5_selected','mosaic')),lens:'question',
  compareA:'mosaic',compareB:'prism',fitTopics:interests,followed:saved,
  radarFilter:'saved',checks:new Set(Array.isArray(checked)?checked:[]),
  faceA:'mosaic',faceB:'prism',scenario:'shift',notes:read('yeon_v5_notes',''),
  query:'',quickOpen:false
};
var view=document.getElementById('view');
var lastFocus=null;
var toastTimer=null;
var routes=['explore','dna','compare','constellation','radar','doors','fit','faceoff','desk'];
function persistSaved(){store('yeon_v5_saved',Array.from(state.followed));}
function tell(text){
  var el=document.getElementById('toast');el.textContent=text;el.classList.add('visible');
  clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.remove('visible');},2200);
}
function chooseLab(id){
  var valid=safeId(id);state.selected=valid;state.lens='question';store('yeon_v5_selected',valid);
}
function toggleFollow(id){
  if(state.followed.has(id)){state.followed.delete(id);tell('Removed '+lab(id).short+' from your desk.');}
  else {state.followed.add(id);tell('Saved '+lab(id).short+' to your research desk.');}
  persistSaved();render();
}
function followButton(id){
  return '<button type="button" class="secondary-btn" data-follow="'+esc(id)+'" aria-pressed="'+state.followed.has(id)+'">'+(state.followed.has(id)?'✓ In my desk':'＋ Save to desk')+'</button>';
}
function routeTo(name,scroll){
  if(!routes.includes(name))name='explore';
  state.route=name;
  if(location.hash!=='#'+name)history.pushState(null,'','#'+name);
  render();
  if(scroll!==false)window.scrollTo({top:0,behavior:'instant'});
}
function label(text){return '<span class="mini-label">'+esc(text)+'</span>';}
function topicPills(arr){return arr.map(function(t){return '<span class="pill">'+esc(t)+'</span>';}).join('');}
function pageHead(number,title,copy){
  return '<section class="page-head"><div><div class="eyebrow">'+esc(number)+' / YEON WORKSPACE</div><h1>'+esc(title)+'</h1><p>'+esc(copy)+'</p></div><span class="page-number">V5 / SAMPLE DATA ONLY</span></section>';
}
function pillButton(value,on,kind){return '<button class="chip" type="button" '+kind+'="'+esc(value)+'" aria-pressed="'+on+'">'+esc(value)+'</button>';}
function selectOptions(selected){
  return LABS.map(function(l){return '<option value="'+esc(l.id)+'"'+(l.id===selected?' selected':'')+'>'+esc(l.name)+'</option>';}).join('');
}
function list(values){return '<ul>'+values.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>';}
function share(a,b){return a.topics.filter(function(x){return b.topics.includes(x);});}
function mapMarkup(mode){
  var current=lab(state.selected);
  var connections=[];
  LABS.forEach(function(a,i){LABS.forEach(function(b,j){
    if(j<=i)return;
    var common=share(a,b);
    if(!common.length)return;
    var pa=POINTS[a.id],pb=POINTS[b.id];var selected=a.id===current.id||b.id===current.id;
    var width=selected?2.6:1.05;var color=selected?'#ed896d':'#7caba4';
    connections.push('<line x1="'+pa[0]*10+'" y1="'+pa[1]*6+'" x2="'+pb[0]*10+'" y2="'+pb[1]*6+'" stroke="'+color+'" stroke-opacity="'+(selected?'.66':'.27')+'" stroke-width="'+width+'"/>');
  });});
  var nodes=LABS.map(function(l){
    var p=POINTS[l.id];return '<button type="button" class="atlas-node'+(current.id===l.id?' active':'')+'" data-select="'+esc(l.id)+'" style="--x:'+p[0]+'%;--y:'+p[1]+'%" aria-label="Select '+esc(l.name)+'" aria-pressed="'+(current.id===l.id)+'"><span class="atlas-node-label">'+esc(l.short)+'</span></button>';
  }).join('');
  return '<div class="atlas-head"><span class="atlas-title">THE RESEARCH MAP / VOL. 01</span><span>08 SAMPLE LABS · FOUR FIELDS</span></div>'+
    '<div class="atlas-map" role="group" aria-label="Choose a laboratory on the research map">'+
    '<svg class="atlas-lines" aria-hidden="true" viewBox="0 0 1000 600" preserveAspectRatio="none">'+connections.join('')+'</svg>'+
    nodes+'<div class="atlas-key"><span><i class="key-dot selected"></i>Selected</span><span><i class="key-dot"></i>Conceptual overlap</span></div></div>'+
    (mode==='hero'?'<div class="atlas-foot"><div class="atlas-selected"><span>NOW EXPLORING</span><strong>'+esc(current.name)+'</strong></div><button type="button" data-go="dna">Open Lab DNA ↗</button></div>':'');
}
function researchBody(l,lens){
  if(lens==='question')return '<blockquote>'+esc(l.statement)+'</blockquote><p>This is the motivating research question in this fictional example.</p>';
  if(lens==='method')return '<blockquote>'+esc(l.methods.join(' · '))+'</blockquote><p>Inspect the approach, then read its assumptions. The method names are demo data, not verified publications.</p>';
  return '<blockquote>'+esc(l.limits.join(' · '))+'</blockquote><p>Research is defined as much by its limitations as its claims. These are illustrative boundaries.</p>';
}
function inspector(){
  var l=lab(state.selected);return '<section class="selected-strip" id="selected-research" aria-label="Selected lab evidence inspector">'+
    '<div class="selected-left"><span class="eyebrow">THE SELECTED THREAD / '+two(LABS.indexOf(l)+1)+'</span>'+
      '<h2>'+esc(l.name)+'</h2><p>'+esc(l.institution)+' · '+esc(l.focus)+'</p>'+
      '<div class="flex-row" style="margin-top:14px">'+topicPills(l.topics)+'</div>'+
      '<div class="selected-actions">'+followButton(l.id)+'<button type="button" class="text-btn" data-go="compare" data-compare-selected="'+esc(l.id)+'">Compare this lab <span class="arrow">↗</span></button></div>'+
    '</div><div class="selected-right"><div class="segment-tabs" role="tablist" aria-label="Research evidence lenses">'+
      [['question','The question'],['method','The method'],['limits','The limitations']].map(function(pair){
        return '<button type="button" role="tab" data-lens="'+pair[0]+'" aria-selected="'+(pair[0]===state.lens)+'">'+pair[1]+'</button>';
      }).join('')+'</div><div class="selected-content" role="tabpanel">'+label(state.lens==='limits'?'BOUNDARIES':state.lens==='method'?'RESEARCH METHODS':'CENTRAL QUESTION')+researchBody(l,state.lens)+'</div></div></section>';
}
function exploreView(){
  var cards=[FEATURES[0],FEATURES[1],FEATURES[2],FEATURES[4],FEATURES[5],FEATURES[6],FEATURES[3]];
  return '<section class="hero-grid"><div class="hero-text"><div class="issue-row"><span class="eyebrow">YEON / A DIFFERENT KIND OF RESEARCH INDEX</span><span>EDITION 005</span></div>'+
    '<h1 class="hero-h1">Research has<br><strong>a backstory.</strong></h1>'+
    '<p class="hero-p">A laboratory is more than its name. Trace the question behind its work, examine the methods it uses, and discover where its ideas intersect with others.</p>'+
    '<div class="hero-actions"><button class="primary-btn" type="button" data-scroll="selected-research">Investigate a question <span class="arrow">↗</span></button><button class="text-btn" type="button" data-go="constellation">Explore the connections <span class="arrow">↗</span></button></div>'+
    '<div class="hero-under"><div class="hero-stat"><strong>08</strong><span>Fictional lab<br>profiles</span></div><div class="hero-stat"><strong>07</strong><span>Research tools<br>to explore</span></div></div></div>'+
    '<div class="atlas-panel">'+mapMarkup('hero')+'</div></section>'+
    '<section class="question-launch" aria-label="Research question starters"><div class="section-head"><div><span class="eyebrow">01 / FIND YOUR STARTING POINT</span><h2>Start with a question.</h2></div><span class="note">Choose a thread to change the map and the evidence inspector.</span></div>'+
    '<div class="question-filters">'+QUESTION_STARTERS.map(function(q){return '<button class="chip" type="button" data-thread="'+esc(q.id)+'" aria-pressed="'+(q.id===state.selected)+'">'+esc(q.label)+' ↗</button>';}).join('')+'</div></section>'+
    inspector()+
    '<section aria-label="Research tools"><div class="section-head"><div><span class="eyebrow">02 / THE RESEARCH WORKSHOP</span><h2>Go beyond the list.</h2></div><span class="note">Seven connected ways to examine a research direction. Every example is simulated.</span></div>'+
    '<div class="tool-grid">'+cards.map(function(f){return '<button class="tool-card" data-go="'+f.id+'" type="button"><span class="tool-card-top"><span>TOOL / '+f.n+'</span><span>↗</span></span><h3>'+esc(f.title)+'</h3><p>'+esc(f.copy)+'</p><span class="arrow" aria-hidden="true">↗</span></button>';}).join('')+'</div></section>';
}
function dnaView(){
  var l=lab(state.selected);
  return pageHead('01','Lab DNA','Follow a question through the progression of ideas, methods and open problems. These chapter titles are sample records, not a real lab publication history.')+
    '<div class="page-body side-layout"><aside class="panel"><div class="panel-top"><h2>Reading desk</h2></div>'+
    '<label class="input-label" for="dna-lab">SELECT A SAMPLE LAB</label><select id="dna-lab" class="select-control" data-select-field="selected">'+selectOptions(l.id)+'</select>'+
    '<div class="sep" style="margin:21px 0"></div>'+
    '<span class="eyebrow">THE CENTRAL QUESTION</span><p style="font-family:var(--serif);font-size:23px;line-height:1.3;color:var(--ink)">'+esc(l.statement)+'</p>'+
    '<div class="flex-row" style="margin-bottom:20px">'+topicPills(l.topics)+'</div>'+followButton(l.id)+
    '<button type="button" class="text-btn" data-go="compare" data-compare-selected="'+esc(l.id)+'" style="margin-top:12px">Compare its approach ↗</button></aside>'+
    '<div><div class="panel-top"><span class="eyebrow">THREE CHAPTERS / ILLUSTRATIVE RESEARCH EVOLUTION</span><span class="mini-label">'+esc(l.institution)+'</span></div>'+
    '<div class="chapters">'+l.chapters.map(function(ch,i){return '<article class="chapter"><span>'+two(i+1)+'</span><div><h3>'+esc(ch[0])+'</h3><p>'+esc(ch[1])+'</p><footer>FOCUS / '+esc(ch[2])+'</footer></div></article>';}).join('')+'</div>'+
    '<div class="two-col" style="margin-top:15px"><article class="panel"><span class="eyebrow">HOW IT WORKS</span><h2 style="margin-top:14px">Methods</h2><div class="bullet-stack">'+l.methods.map(function(m){return '<div class="accent-border">'+esc(m)+'</div>';}).join('')+'</div></article>'+
    '<article class="panel"><span class="eyebrow">WHAT TO QUESTION</span><h2 style="margin-top:14px">Limitations</h2><div class="bullet-stack">'+l.limits.map(function(m){return '<div>'+esc(m)+'</div>';}).join('')+'</div></article></div></div></div>';
}
function compareView(){
  var a=lab(state.compareA),b=lab(state.compareB),shared=share(a,b);
  var rows=[
    ['Research question',esc(a.statement),esc(b.statement)],
    ['Methods',list(a.methods),list(b.methods)],
    ['Assumptions',list(a.assumptions),list(b.assumptions)],
    ['Limitations',list(a.limits),list(b.limits)]
  ];
  return pageHead('02','Compare without a score','See how two research directions differ in questions, methods, assumptions and limits. This demo does not judge quality or claim comparable performance.')+
    '<div class="page-body"><div class="panel"><div class="two-col"><label><span class="input-label">FIRST LAB / A</span><select id="compare-a" class="select-control" data-select-field="compareA">'+selectOptions(a.id)+'</select></label>'+
    '<label><span class="input-label">SECOND LAB / B</span><select id="compare-b" class="select-control" data-select-field="compareB">'+selectOptions(b.id)+'</select></label></div>'+
    '<div style="margin-top:15px" class="flex-row"><button type="button" class="secondary-btn" data-swap="compare">⇄ Swap sides</button><button type="button" class="text-btn" data-go="faceoff">Try a scenario comparison ↗</button></div></div>'+
    '<div class="compare-grid"><article class="compare-lab"><span class="eyebrow">RESEARCH PROFILE / A</span><h2>'+esc(a.name)+'</h2><p>'+esc(a.focus)+'</p><div class="flex-row" style="margin-top:15px">'+topicPills(a.topics)+'</div></article>'+
    '<article class="compare-lab"><span class="eyebrow">RESEARCH PROFILE / B</span><h2>'+esc(b.name)+'</h2><p>'+esc(b.focus)+'</p><div class="flex-row" style="margin-top:15px">'+topicPills(b.topics)+'</div></article></div>'+
    '<div class="compare-fields">'+rows.map(function(row){return '<div class="compare-field"><div>'+row[0]+'</div><div>'+row[1]+'</div><div>'+row[2]+'</div></div>';}).join('')+'</div>'+
    '<p class="insight" style="margin-top:17px"><strong>Overlap, not endorsement:</strong> '+(shared.length?'These fictional labs share '+esc(shared.join(' and '))+' as research topics.':'These fictional labs have no topic label in common.')+' Shared labels alone do not establish shared methods, evidence, publications, or collaboration.</p></div>';
}
function relatedTo(l){
  return LABS.filter(function(x){return x.id!==l.id;}).map(function(x){return {lab:x,topics:share(l,x)};}).filter(function(x){return x.topics.length;}).sort(function(a,b){return b.topics.length-a.topics.length;});
}
function constellationView(){
  var l=lab(state.selected),related=relatedTo(l);
  return pageHead('03','The constellation','A conceptual map of shared research areas. Lines describe overlapping topic labels in this fictional dataset—not verified collaborations between real laboratories.')+
    '<div class="page-body side-layout" style="grid-template-columns:minmax(0,1.45fr) minmax(260px,.55fr)"><section class="network-holder">'+mapMarkup('network')+'</section>'+
    '<aside class="panel network-inspector"><span class="eyebrow">SELECTED NODE</span><h2>'+esc(l.name)+'</h2><p>'+esc(l.statement)+'</p>'+
    '<div class="flex-row" style="margin:17px 0">'+topicPills(l.topics)+'</div>'+
    '<h3 style="margin-top:20px">Shared research fields</h3>'+
    (related.length?'<div class="network-share">'+related.map(function(x){return '<button type="button" class="card-row" data-select="'+esc(x.lab.id)+'"><span class="row-main"><strong>'+esc(x.lab.short)+'</strong><small>'+esc(x.topics.join(', '))+' · topic overlap only</small></span><span class="row-arrow">↗</span></button>';}).join('')+'</div>':'<p>No overlap in this sample set.</p>')+
    '<button type="button" class="primary-btn" data-go="dna">Read this lab’s DNA <span class="arrow">↗</span></button></aside></div>';
}
function radarView(){
  var followed=LABS.filter(function(l){return state.followed.has(l.id);});
  var targets=state.radarFilter==='saved'?followed:LABS;
  var events=[];
  targets.forEach(function(l){
    l.chapters.forEach(function(ch,i){events.push({l:l,idx:i,chapter:ch});});
  });
  events.sort(function(a,b){return a.idx-b.idx||a.l.name.localeCompare(b.l.name);});
  return pageHead('04','Radar / your reading signals','Build a watchlist and inspect illustrative research checkpoints. These are static demo chapters, not current publications, new papers or live alerts.')+
    '<div class="page-body side-layout"><aside class="panel"><div class="panel-top"><h2>Following '+state.followed.size+'</h2><span class="pill">LOCAL ONLY</span></div>'+
    '<p class="note">Your followed labs stay saved in this browser. No account, email alerts or live feed is connected.</p>'+
    LABS.map(function(l){return '<div class="saved-row"><strong>'+esc(l.short)+'</strong><button type="button" data-follow="'+esc(l.id)+'">'+(state.followed.has(l.id)?'✓ Following':'＋ Follow')+'</button></div>';}).join('')+'</aside>'+
    '<section class="panel"><div class="panel-top"><h2>Reading checkpoints</h2><div class="flex-row">'+pillButton('saved',state.radarFilter==='saved','data-radar')+pillButton('all',state.radarFilter==='all','data-radar')+'</div></div>'+
    (events.length?'<div class="feed-list">'+events.map(function(item){return '<div class="feed-item"><span class="date">CHAPTER '+two(item.idx+1)+'</span><div><strong>'+esc(item.chapter[0])+'</strong><span>'+esc(item.l.name)+' · Sample sequence, not a dated event</span></div><button type="button" data-inspect="'+esc(item.l.id)+'">Inspect ↗</button></div>';}).join('')+'</div>':
    '<div class="empty-state"><h3>Nothing on the watchlist yet.</h3><p>Save a lab from the atlas, or switch to “all” to browse example reading checkpoints.</p><button type="button" class="primary-btn" data-go="explore">Discover labs ↗</button></div>')+'</section></div>';
}
function doorsView(){
  var num=state.checks.size;
  return pageHead('05','Open Doors','An opportunity should be traceable to an official announcement. This is a verification practice tool: the prototype currently contains no real job, internship or funded-position listings.')+
    '<div class="page-body two-col"><section class="panel"><span class="eyebrow">VERIFIED OPENINGS / LIVE SOURCES</span><h2 style="font-size:48px;margin-top:16px">0</h2><div class="empty-state"><h3>No verified opportunities connected.</h3><p>We will not turn fabricated listings into clickable application opportunities. A future release should ingest official pages with source links, timestamps and a verification history.</p></div>'+
    '<p class="note">This is an intentionally honest empty state, not a search failure.</p></section>'+
    '<section class="panel"><div class="panel-top"><h2>Opportunity verification checklist</h2><span class="pill">'+num+' / '+CHECKS.length+'</span></div><p class="note">Practice the checks to apply to a future opportunity. Ticking a box does not verify any actual posting.</p>'+
    CHECKS.map(function(x,i){return '<label class="check-row"><input type="checkbox" data-check="'+i+'" '+(state.checks.has(i)?'checked':'')+'><span>'+esc(x)+'</span></label>';}).join('')+
    '<p class="insight"><strong>'+num+'/'+CHECKS.length+' checks completed.</strong> This is a personal checklist progress indicator, not an external verification result.</p>'+
    '<button type="button" class="text-btn" data-clear-checks>Reset checklist ↺</button></section></div>';
}
function fitView(){
  var matches=LABS.map(function(l){return {l:l,overlap:l.topics.filter(function(t){return state.fitTopics.has(t);})};})
    .sort(function(a,b){return b.overlap.length-a.overlap.length||a.l.name.localeCompare(b.l.name);});
  return pageHead('06','Fit Lens','Choose what interests you and see a transparent, explainable topic overlap. This is not an admissions prediction, a quality score or a claim about real professors.')+
    '<div class="page-body"><section class="panel"><div class="panel-top"><h2>What pulls your curiosity?</h2><span class="pill">'+state.fitTopics.size+' AREAS SELECTED</span></div>'+
    '<p class="note">Change your interests to recalculate the explanations below.</p><div class="question-filters">'+TOPICS.map(function(t){return pillButton(t,state.fitTopics.has(t),'data-interest');}).join('')+'</div></section>'+
    (state.fitTopics.size?'<div class="fit-grid" style="margin-top:16px">'+matches.map(function(m){var pct=Math.round(m.overlap.length/state.fitTopics.size*100);
    return '<article class="fit-card"><div class="flex-row" style="justify-content:space-between"><span class="mini-label">'+esc(m.l.institution)+'</span><span class="pill">'+m.overlap.length+'/'+state.fitTopics.size+' TOPICS</span></div>'+
      '<h3>'+esc(m.l.name)+'</h3><p>'+esc(m.l.focus)+'</p>'+
      '<div class="fit-bar" role="meter" aria-valuemin="0" aria-valuemax="'+state.fitTopics.size+'" aria-valuenow="'+m.overlap.length+'" aria-label="Matched interest topics" style="--pct:'+pct+'%"><span></span></div>'+
      '<p><strong>Why this appears:</strong> '+(m.overlap.length?'Shared interests: '+esc(m.overlap.join(', '))+'.':'No selected topic label overlaps.')+'</p>'+
      '<button type="button" class="text-btn" data-inspect="'+esc(m.l.id)+'">Read research context ↗</button></article>';
    }).join('')+'</div>':'<div class="empty-state" style="margin-top:17px"><h3>Select at least one interest</h3><p>Without a selected topic, there is no basis for even a simple overlap explanation.</p></div>')+
    '<p class="note">An interest match is only a topic-label comparison. It does not establish eligibility, research fit, faculty availability or funding.</p></div>';
}
function faceoffView(){
  var a=lab(state.faceA),b=lab(state.faceB);
  var scenarios={
    shift:{title:'When the data distribution changes',question:'How would each approach handle an unseen shift?',checks:['What assumptions rely on training conditions?','How would robustness be evaluated?','What evidence supports transfer to new conditions?']},
    missing:{title:'When information is missing',question:'How would each approach behave with incomplete inputs?',checks:['Which information sources are required?','What failure modes arise from absent signals?','When should the system abstain?']},
    proof:{title:'When the result must be audited',question:'Can someone reproduce and verify the decision?',checks:['Which intermediate artifacts are retained?','How is an explanation traced to evidence?','What is the procedure when evidence conflicts?']}
  };
  var sc=scenarios[state.scenario];
  return pageHead('07','Research Face-Off','Set the scenario first. Compare two example methodologies and the questions needed to evaluate them. No winner is declared without experiments.')+
    '<div class="page-body"><div class="panel"><span class="eyebrow">FIRST CHOOSE THE TEST</span><div class="question-filters">'+Object.keys(scenarios).map(function(k){return pillButton(k==='shift'?'Changing conditions':k==='missing'?'Missing information':'Auditability',k===state.scenario,'data-scenario-value="'+k+'" data-scenario');}).join('')+'</div>'+
    '<h2>'+esc(sc.title)+'</h2><p>'+esc(sc.question)+'</p><div class="two-col"><label><span class="input-label">APPROACH A</span><select class="select-control" data-select-field="faceA">'+selectOptions(a.id)+'</select></label><label><span class="input-label">APPROACH B</span><select class="select-control" data-select-field="faceB">'+selectOptions(b.id)+'</select></label></div></div>'+
    '<div class="compare-grid"><article class="compare-lab"><span class="eyebrow">APPROACH A / '+esc(a.short)+'</span><h2>'+esc(a.methods[0])+'</h2><p>'+esc(a.name)+'</p><div class="sep" style="margin:20px 0"></div><span class="mini-label">ASSUMPTIONS</span>'+list(a.assumptions)+'<span class="mini-label">KNOWN LIMITATIONS (DEMO)</span>'+list(a.limits)+'</article>'+
    '<article class="compare-lab"><span class="eyebrow">APPROACH B / '+esc(b.short)+'</span><h2>'+esc(b.methods[0])+'</h2><p>'+esc(b.name)+'</p><div class="sep" style="margin:20px 0"></div><span class="mini-label">ASSUMPTIONS</span>'+list(b.assumptions)+'<span class="mini-label">KNOWN LIMITATIONS (DEMO)</span>'+list(b.limits)+'</article></div>'+
    '<article class="panel"><span class="eyebrow">WHAT WOULD SETTLE THE QUESTION?</span><h2 style="margin-top:14px">A fair evaluation needs evidence.</h2><div class="bullet-stack">'+sc.checks.map(function(x){return '<div class="accent-border">'+esc(x)+'</div>';}).join('')+'</div><p class="insight" style="margin-top:20px"><strong>Verdict: no winner.</strong> The data in this prototype cannot establish empirical superiority. This panel defines what evidence would be required.</p></article></div>';
}
function deskView(){
  var labs=LABS.filter(function(l){return state.followed.has(l.id);});
  return pageHead('08','My research desk','Keep a shortlist, write private notes, and export the current study. Everything is stored locally in this browser; there is no account or server synchronization.')+
    '<div class="page-body desk-grid"><section class="panel"><div class="panel-top"><h2>Saved labs</h2><span class="pill">'+two(labs.length)+' SAVED</span></div>'+
    (labs.length?labs.map(function(l){return '<div class="saved-row"><strong>'+esc(l.name)+'</strong><button type="button" data-inspect="'+esc(l.id)+'">Read ↗</button><button type="button" data-follow="'+esc(l.id)+'" aria-label="Remove '+esc(l.name)+'">Remove ×</button></div>';}).join(''):'<div class="empty-state"><h3>Your desk is empty.</h3><p>Select nodes on the atlas and save a lab to build a personal reading collection.</p><button type="button" class="primary-btn" data-go="explore">Go to the atlas ↗</button></div>')+
    '<div style="margin-top:22px" class="flex-row"><button type="button" class="secondary-btn" data-export>↓ Export research notes</button></div></section>'+
    '<section class="panel"><div class="panel-top"><h2>Field notes</h2><span class="pill">AUTOSAVED ON THIS DEVICE</span></div>'+
    '<label for="desk-notes" class="input-label">YOUR OBSERVATIONS, QUESTIONS, FOLLOW-UPS</label><textarea id="desk-notes" class="note-input" placeholder="What connections did you notice? What evidence would you need next?">'+esc(state.notes)+'</textarea>'+
    '<p class="note" id="note-status">Notes stay in this browser. Do not enter sensitive personal information.</p>'+
    '<div class="insight"><strong>A research habit:</strong> record the question you started with, the source you would verify, and the uncertainty you still have.</div></section></div>';
}
function render(){
  if(!LABS.length){view.innerHTML='<div class="empty-state"><h3>Demo records unavailable.</h3><p>The static sample data could not be loaded.</p></div>';return;}
  var screens={explore:exploreView,dna:dnaView,compare:compareView,constellation:constellationView,radar:radarView,doors:doorsView,fit:fitView,faceoff:faceoffView,desk:deskView};
  view.innerHTML=screens[state.route]();
  document.querySelectorAll('[data-nav]').forEach(function(a){
    var active=a.dataset.nav===state.route;
    a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
  });
  document.getElementById('nav-saved-count').textContent=String(state.followed.size);
  var toggle=document.getElementById('theme-toggle');toggle.setAttribute('aria-label',document.documentElement.dataset.theme==='dark'?'Switch to light theme':'Switch to dark theme');
}
function openQuick(){
  lastFocus=document.activeElement;state.quickOpen=true;
  var el=document.getElementById('search-dialog');el.hidden=false;
  var input=document.getElementById('quick-input');input.value='';showQuick('');input.focus();
}
function closeQuick(){
  state.quickOpen=false;document.getElementById('search-dialog').hidden=true;
  if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});
}
function showQuick(term){
  var q=term.trim().toLowerCase(),results=[];
  FEATURES.forEach(function(f){if(!q||[f.title,f.copy].join(' ').toLowerCase().includes(q))results.push({name:f.title,type:'TOOL',id:f.id});});
  LABS.forEach(function(l){if(!q||[l.name,l.focus,l.statement,l.topics.join(' '),l.methods.join(' ')].join(' ').toLowerCase().includes(q))results.push({name:l.name,type:'LAB PROFILE',id:l.id});});
  var dest=document.getElementById('quick-results');
  dest.innerHTML=results.slice(0,12).map(function(x){return '<button type="button" data-quick-type="'+(x.type==='TOOL'?'tool':'lab')+'" data-quick-id="'+esc(x.id)+'"><strong>'+esc(x.name)+'</strong><span>'+x.type+' ↗</span></button>';}).join('')||'<p class="note" style="padding:14px">No sample records match. Try a broader question.</p>';
}
function exportDesk(){
  var lines=['# YEON — Research desk','', 'Fictional research interface; these are NOT real lab or paper records.','', '## Saved labs'];
  LABS.filter(function(l){return state.followed.has(l.id);}).forEach(function(l){lines.push('- '+l.name+' — '+l.focus+' (sample profile)');});
  lines.push('','## Notes','',state.notes||'(No notes)','');
  var blob=new Blob([lines.join('\n')],{type:'text/markdown;charset=utf-8'});
  var url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='YEON-V5-research-desk.md';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  tell('Research desk exported as Markdown.');
}
function initTheme(){var t=read('yeon_v5_theme','light');document.documentElement.dataset.theme=t==='dark'?'dark':'light';}
function updateFromHash(){var next=location.hash.slice(1).split('/')[0]||'explore';state.route=routes.includes(next)?next:'explore';render();}
document.addEventListener('click',function(e){
  var button=e.target.closest('button');if(!button)return;
  if(button.id==='global-search'){openQuick();return;}
  if(button.id==='theme-toggle'){var dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';store('yeon_v5_theme',dark?'dark':'light');render();return;}
  if(button.dataset.quickId){var typ=button.dataset.quickType,id=button.dataset.quickId;closeQuick();if(typ==='lab'){chooseLab(id);routeTo('dna');}else routeTo(id);return;}
  if(button.dataset.follow){toggleFollow(button.dataset.follow);return;}
  if(button.dataset.select){chooseLab(button.dataset.select);render();return;}
  if(button.dataset.thread){chooseLab(button.dataset.thread);render();document.getElementById('selected-research')?.scrollIntoView({block:'center',behavior:'smooth'});return;}
  if(button.dataset.lens){state.lens=button.dataset.lens;render();document.querySelector('[data-lens="'+state.lens+'"]')?.focus({preventScroll:true});return;}
  if(button.dataset.compareSelected){state.compareA=button.dataset.compareSelected;}
  if(button.dataset.go){routeTo(button.dataset.go);return;}
  if(button.dataset.scroll){document.getElementById(button.dataset.scroll)?.scrollIntoView({block:'start',behavior:'smooth'});return;}
  if(button.dataset.inspect){chooseLab(button.dataset.inspect);routeTo('dna');return;}
  if(button.dataset.radar){state.radarFilter=button.dataset.radar;render();return;}
  if(button.hasAttribute('data-swap')){var a=state.compareA;state.compareA=state.compareB;state.compareB=a;render();return;}
  if(button.dataset.interest){var t=button.dataset.interest;if(state.fitTopics.has(t))state.fitTopics.delete(t);else state.fitTopics.add(t);store('yeon_v5_interests',Array.from(state.fitTopics));render();return;}
  if(button.hasAttribute('data-scenario')){state.scenario=button.dataset.scenarioValue;render();return;}
  if(button.hasAttribute('data-clear-checks')){state.checks.clear();store('yeon_v5_checks',[]);render();return;}
  if(button.hasAttribute('data-export')){exportDesk();return;}
});
document.addEventListener('input',function(e){
  if(e.target.id==='desk-notes'){state.notes=e.target.value;store('yeon_v5_notes',state.notes);var status=document.getElementById('note-status');if(status)status.textContent='Saved locally in this browser.';}
  if(e.target.id==='quick-input')showQuick(e.target.value);
});
document.addEventListener('change',function(e){
  var field=e.target.dataset.selectField;
  if(field){if(field==='selected')chooseLab(e.target.value);else if(['compareA','compareB','faceA','faceB'].includes(field))state[field]=safeId(e.target.value);render();return;}
  if(e.target.dataset.check!==undefined){var i=Number(e.target.dataset.check);if(!Number.isInteger(i)||i<0||i>=CHECKS.length)return;if(e.target.checked)state.checks.add(i);else state.checks.delete(i);store('yeon_v5_checks',Array.from(state.checks));render();}
});
document.addEventListener('keydown',function(e){
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(state.quickOpen)closeQuick();else openQuick();return;}
  if(e.key==='Escape'&&state.quickOpen){e.preventDefault();closeQuick();return;}
  if(state.quickOpen){
    if(e.key==='Tab'){
      var focusable=[document.getElementById('quick-input')].concat(Array.from(document.querySelectorAll('#quick-results button')));
      var idx=focusable.indexOf(document.activeElement);if(idx>=0){e.preventDefault();focusable[(idx+(e.shiftKey?-1:1)+focusable.length)%focusable.length].focus();}
    }
    if(e.key==='Enter'&&document.activeElement.id==='quick-input'){var first=document.querySelector('#quick-results button');if(first){e.preventDefault();first.click();}}
    return;
  }
  if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();openQuick();}
});
document.getElementById('search-dialog').addEventListener('click',function(e){if(e.target.id==='search-dialog')closeQuick();});
window.addEventListener('hashchange',updateFromHash);
window.addEventListener('popstate',updateFromHash);
initTheme();updateFromHash();
})();