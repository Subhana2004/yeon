/* YEON V6 — functional editorial research reader.
 * No backend calls or verified real universities: the eight labs are fictional.
 * Every user action affects the research state, and saved data stays browser-local.
 */
(function(){
'use strict';
var LABS=Array.isArray(window.YEON_LABS)?window.YEON_LABS:[];
var TOPICS=['Vision','Language','Multimodal','Systems'];
var TOOLS=[
 {id:'dna',title:'Lab DNA',desc:'Read how a research question evolves, then test its assumptions.'},
 {id:'compare',title:'Lab Compare',desc:'Put two laboratories side by side without invented scores.'},
 {id:'connections',title:'Constellation',desc:'Discover topical overlap without implying collaboration.'},
 {id:'radar',title:'Radar',desc:'Keep a watchlist and a personal reading trail.'},
 {id:'doors',title:'Open Doors',desc:'Verify opportunities before treating them as real.'},
 {id:'fit',title:'Fit Lens',desc:'Explore why a topic is relevant to your interests.'},
 {id:'faceoff',title:'Research Face-Off',desc:'Challenge competing ideas against the same scenario.'}
];
var ROUTES=['explore','dna','compare','connections','radar','doors','fit','faceoff','about'];
var CHECKS=[
 'The announcement is present on an official university or lab page',
 'The publication date, status and deadline are verified',
 'Funding terms are stated explicitly and not inferred',
 'Eligibility and responsibilities are checked against the official description',
 'Contact details are independently verified on an official domain'
];
var SCENARIOS={
 shift:{title:'What happens when the world changes?',desc:'A model works on known data. It meets unfamiliar conditions tomorrow. What would each approach need to prove?',qs:['What assumes the training environment stays stable?','What new conditions would break the evaluation?','Which experiment can falsify a robustness claim?']},
 missing:{title:'What if the evidence is incomplete?',desc:'Some input sources are missing or contradictory. A good result must be able to acknowledge uncertainty.',qs:['Which input does the method require?','What happens when those signals are absent or conflicting?','When should it abstain instead of guessing?']},
 audit:{title:'Could another researcher verify it?',desc:'An attractive result is not enough if its evidence and execution cannot be inspected.',qs:['What inputs and intermediate artifacts are preserved?','Where do the reported claims come from?','How could another team reproduce or challenge the result?']}
};
var FEATURED=['mosaic','horizon','vertex'];
function memo(key,fallback){try{var x=localStorage.getItem(key);return x===null?fallback:JSON.parse(x);}catch(e){return fallback;}}
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(e){/* The site works without persistent storage. */}}
function valid(id){return LABS.some(function(x){return x.id===id;});}
function lab(id){return LABS.find(function(x){return x.id===id;})||LABS[0];}
function escapeHtml(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function n2(n){return String(n).padStart(2,'0');}
function tagset(arr){return '<div class="tags">'+arr.map(function(x){return '<span>'+escapeHtml(x)+'</span>';}).join('')+'</div>';}
function readFileTitle(x){return escapeHtml(x);}
var storedFollows=memo('yeon_v6_follows',[]);
var storedInterests=memo('yeon_v6_interests',['Vision','Systems']);
var storedChecks=memo('yeon_v6_checks',[]);
var noteData=memo('yeon_v6_notes',{});
var state={
 route:'explore',
 selected:valid(memo('yeon_v6_selected','mosaic'))?memo('yeon_v6_selected','mosaic'):'mosaic',
 search:'',topic:'All',lens:'question',
 follows:new Set(Array.isArray(storedFollows)?storedFollows.filter(valid):[]),
 notes:noteData&&typeof noteData==='object'&&!Array.isArray(noteData)?noteData:{},
 compA:'mosaic',compB:'vertex',compareFocus:'all',radarFilter:'following',
 interests:new Set(Array.isArray(storedInterests)?storedInterests.filter(function(t){return TOPICS.includes(t);}):[]),
 checks:new Set(Array.isArray(storedChecks)?storedChecks.filter(function(i){return Number.isInteger(i)&&i>=0&&i<CHECKS.length;}):[]),
 scenario:'shift',faceA:'horizon',faceB:'vertex',
 commandOpen:false,mobileOpen:false,moreOpen:false
};
var app=document.getElementById('app');
var restoreFocus=null;
var toastTimer=null;
function tell(msg){
 var t=document.getElementById('toast');
 t.textContent=msg;t.classList.add('visible');clearTimeout(toastTimer);
 toastTimer=setTimeout(function(){t.classList.remove('visible');},2200);
}
function choose(id){if(!valid(id))return;state.selected=id;state.lens='question';save('yeon_v6_selected',id);}
function followed(id){return state.follows.has(id);}
function toggleFollow(id){
 if(!valid(id))return;
 if(state.follows.has(id)){state.follows.delete(id);tell(lab(id).short+' removed from Radar.');}
 else{state.follows.add(id);tell(lab(id).short+' saved to Radar.');}
 save('yeon_v6_follows',Array.from(state.follows));render();
 var btn=document.querySelector('[data-follow="'+id+'"]');if(btn)btn.focus({preventScroll:true});
}
function followButton(id,cls){
 return '<button type="button" class="'+(cls||'btn-outline')+'" data-follow="'+escapeHtml(id)+'" aria-pressed="'+followed(id)+'">'+(followed(id)?'✓ Following':'+ Follow')+'</button>';
}
function list(items){return '<ul>'+items.map(function(x){return '<li>'+escapeHtml(x)+'</li>';}).join('')+'</ul>';}
function opts(selected){
 return LABS.map(function(l){return '<option value="'+escapeHtml(l.id)+'"'+(l.id===selected?' selected':'')+'>'+escapeHtml(l.name)+'</option>';}).join('');
}
function matches(){
 var q=state.search.trim().toLowerCase();
 return LABS.filter(function(l){
  return (state.topic==='All'||l.topics.includes(state.topic)) &&
   (!q||[l.name,l.short,l.focus,l.statement,l.institution,l.topics.join(' '),l.methods.join(' '),l.limits.join(' ')].join(' ').toLowerCase().includes(q));
 });
}
function overlapping(a,b){return a.topics.filter(function(x){return b.topics.includes(x);});}
function pageTop(kicker,title,description,index){
 var current=state.route,l=lab(state.selected),folio={head:'',body:'',foot:''};
 if(current==='dna')folio={head:'CURRENT FIELD NOTE / '+l.short.toUpperCase(),body:l.statement,foot:'03 research chapters · methods & boundaries'};
 else if(current==='compare')folio={head:'SIDE BY SIDE / A + B',body:lab(state.compA).short+' meets '+lab(state.compB).short+'. What would make their results comparable?',foot:'Same questions · no invented scores'};
 else if(current==='connections')folio={head:'CROSS-REFERENCE / '+l.short.toUpperCase(),body:'The same question may lead to a very different research approach.',foot:'Shared topics are not collaborations'};
 else if(current==='radar')folio={head:'YOUR READING DESK',body:n2(state.follows.size)+' research '+(state.follows.size===1?'thread':'threads')+' on your personal list.',foot:'Local watchlist · no live notifications'};
 else if(current==='doors')folio={head:'EVIDENCE STANDARD / 00',body:'A real opportunity begins with a verifiable source.',foot:'Zero live openings connected'};
 else if(current==='fit')folio={head:'A RESEARCH DIRECTION, NOT A SCORE',body:Array.from(state.interests).join(' / ')||'Choose the questions that interest you.',foot:'Your selected topics · transparent overlap'};
 else if(current==='faceoff')folio={head:'THE CURRENT EXPERIMENT',body:SCENARIOS[state.scenario].title,foot:'Questions before conclusions'};
 else folio={head:'WHY YEON EXISTS',body:'Research deserves a closer reading.',foot:'Question · method · uncertainty'};
 var parts=title.split(' '),ending=parts.pop(),opening=parts.join(' ');
 var display=(opening?escapeHtml(opening)+' ':'')+'<em>'+escapeHtml(ending)+'</em>';
 return '<header class="page-heading tool-cover" data-tool="'+escapeHtml(current)+'">'+
 '<div class="tool-cover-intro"><div class="tool-cover-index"><span class="eyebrow dot">'+escapeHtml(kicker)+'</span><span class="tiny">FIELD EDITION / '+escapeHtml(index)+'</span></div>'+
 '<h1>'+display+'</h1><p class="tool-cover-description">'+escapeHtml(description)+'</p>'+
 '<button class="btn-text tool-cover-back" type="button" data-go="explore"><span aria-hidden="true">←</span> Back to the research index</button></div>'+
 '<aside class="tool-cover-folio" aria-label="Current research context"><div class="tool-cover-folio-head"><span>'+escapeHtml(folio.head)+'</span><span class="tool-cover-id">'+escapeHtml(index)+' / 09</span></div>'+
 '<div class="tool-cover-folio-body"><span class="tool-cover-asterisk" aria-hidden="true">✳</span><blockquote>'+escapeHtml(folio.body)+'</blockquote></div>'+
 '<div class="tool-cover-folio-foot"><span>'+escapeHtml(folio.foot)+'</span><span aria-hidden="true">↗</span></div></aside>'+
 '</header>';
}
function intro(id){
 var l=lab(id);
 return '<div class="specimen-head"><span class="eyebrow">A field note, not a ranking</span><span class="specimen-number">'+n2(LABS.indexOf(l)+1)+' / '+n2(LABS.length)+'</span></div>'+
 '<div class="specimen-body"><span class="specimen-kicker">NOW READING / '+escapeHtml(l.institution)+'</span>'+
 '<h2>'+escapeHtml(l.name)+'</h2>'+
 '<p class="specimen-question">'+escapeHtml(l.statement)+'</p>'+
 '<div class="specimen-trace"><span>Question</span><span>Method</span><span>Boundaries</span></div>'+
 '<div class="specimen-actions"><button class="btn-main" type="button" data-scroll="archive">Inspect this research <span class="arr">↗</span></button>'+
 followButton(l.id,'btn-text')+'</div></div>'+
 '<div class="specimen-switcher" role="group" aria-label="Select a sample question">'+FEATURED.map(function(fid,i){
  return '<button type="button" data-feature="'+fid+'" class="'+(state.selected===fid?'active':'')+'" aria-pressed="'+(state.selected===fid)+'"><span>'+n2(i+1)+'</span>'+escapeHtml(lab(fid).short)+'</button>';
 }).join('')+'</div>';
}
function archiveRow(l){
 var active=state.selected===l.id;
 return '<button type="button" class="archive-row'+(active?' active':'')+'" data-pick="'+l.id+'" aria-pressed="'+active+'" aria-label="Inspect '+escapeHtml(l.name)+'">'+
 '<span>'+n2(LABS.indexOf(l)+1)+'</span><span><strong>'+escapeHtml(l.name)+'</strong><small>'+escapeHtml(l.focus)+'</small><em>'+escapeHtml(l.topics.join(' · '))+'</em></span><span class="row-arr">↗</span></button>';
}
function readerArticle(l){
 if(state.lens==='question')return '<span class="eyebrow">The question at the center</span><blockquote>'+escapeHtml(l.statement)+'</blockquote><p>Start here. Before reading outputs or a publication list, understand what this research tries to explain.</p>';
 if(state.lens==='method')return '<span class="eyebrow">Approach and assumptions</span>'+list(l.methods)+'<p>This example assumes: '+escapeHtml(l.assumptions.join(' · '))+'. The assumptions must be tested against actual evidence.</p>';
 return '<span class="eyebrow">The limits of the claim</span>'+list(l.limits)+'<p>These boundaries are demonstrations. Real work would require verified evaluation protocols, source materials and stated uncertainty.</p>';
}
function researchReader(){
 var l=lab(state.selected);
 var data=[['question','Question'],['method','Method'],['limits','Limits']];
 return '<section class="archive-reader" id="research-reader" aria-label="Selected research reading">'+
 '<div class="reader-top"><span>FIELDNOTE / '+n2(LABS.indexOf(l)+1)+' — '+n2(LABS.length)+'</span><div class="reader-step" role="group" aria-label="Navigate research records"><button type="button" data-step="-1" aria-label="Previous laboratory">←</button><button type="button" data-step="1" aria-label="Next laboratory">→</button></div></div>'+
 '<div class="reader-main"><div class="reader-meta">'+escapeHtml(l.institution)+' / DEMONSTRATION RECORD</div>'+
 '<h3 id="reader-heading" tabindex="-1">'+escapeHtml(l.name)+'</h3><p class="reader-focus">'+escapeHtml(l.focus)+'</p>'+tagset(l.topics)+
 '<div class="reader-tabs" role="tablist" aria-label="Research perspectives">'+data.map(function(x,i){return '<button type="button" role="tab" id="lens-'+x[0]+'" aria-controls="reader-panel" data-lens="'+x[0]+'" aria-selected="'+(state.lens===x[0])+'" tabindex="'+(state.lens===x[0]?'0':'-1')+'"><span>'+n2(i+1)+'</span>'+x[1]+'</button>';}).join('')+'</div>'+
 '<div id="reader-panel" class="reader-article" role="tabpanel" aria-labelledby="lens-'+state.lens+'" aria-live="polite">'+readerArticle(l)+'</div>'+
 '<div class="reader-crossrefs"><div class="reader-crossrefs-head"><span class="eyebrow">THE RESEARCH TRAIL</span><span class="smallprint">Three illustrative chapters</span></div>'+
 '<div class="reader-chapters">'+l.chapters.map(function(ch,i){return '<button type="button" data-open-dna="'+l.id+'" aria-label="Open Lab DNA chapter '+n2(i+1)+': '+escapeHtml(ch[0])+'"><span>'+n2(i+1)+' / '+escapeHtml(ch[2])+'</span><strong>'+escapeHtml(ch[0])+'</strong><small aria-hidden="true">↗</small></button>';}).join('')+'</div></div>'+
 '<details class="reader-notes"><summary><span>✎ &nbsp; My field notes</span><span id="notes-indicator">'+(state.notes[l.id]?'Saved in this browser':'Private & local')+'</span></summary>'+
 '<label for="research-note">What should you verify or follow up on?</label><textarea class="notes-input" id="research-note" data-note="'+l.id+'" placeholder="Write a question about the work, a limitation worth checking, or a reference to find…">'+escapeHtml(state.notes[l.id]||'')+'</textarea><p class="smallprint" id="note-status">Notes stay in this browser. They are not synced to an account.</p></details>'+
 '</div>'+
 '<div class="reader-bottom"><button type="button" class="btn-main" data-open-dna="'+l.id+'">Read Lab DNA <span class="arr">↗</span></button><button type="button" class="btn-outline" data-compare-selected="'+l.id+'">Compare ↗</button>'+followButton(l.id,'btn-outline')+'</div>'+
 '<p class="reader-note">All research records here are fictional. No publications or affiliations have been independently verified.</p>'+
 '</section>';
}
function archiveView(){
 var items=matches();
 return '<section id="archive" aria-label="Research archive">'+
 '<div class="section-intro"><div><span class="eyebrow dot">THE RESEARCH INDEX / VOL. 01</span><h2>Read past the name.</h2></div><p>A lab is a question, an approach, and a set of limits. Select any sample record to investigate it.</p></div>'+
 '<div class="archive-shell"><aside class="archive-index"><div class="archive-index-header"><span>THE INDEX</span><span>'+n2(LABS.length)+' RECORDS</span></div>'+
 '<label class="archive-search"><span aria-hidden="true">⌕</span><span class="sr-only">Search research records</span><input id="archive-search" type="search" autocomplete="off" placeholder="Search a lab, topic or method…" value="'+escapeHtml(state.search)+'"><kbd aria-hidden="true">/</kbd></label>'+
 '<div class="filter-line" role="group" aria-label="Filter by research field">'+['All'].concat(TOPICS).map(function(t){return '<button type="button" data-topic="'+t+'" class="'+(state.topic===t?'active':'')+'" aria-pressed="'+(state.topic===t)+'">'+t+'</button>';}).join('')+'</div>'+
 '<div class="result-count"><span><strong class="result-number">'+n2(items.length)+'</strong> matching records</span><button type="button" data-clear>Clear filters</button></div>'+
 '<div class="archive-list" id="archive-list">'+(items.length?items.map(archiveRow).join(''):'<div class="empty"><h3>No matching research.</h3><p>Try a broader phrase or clear the current field filter.</p><button type="button" class="btn-outline" data-clear>Show all records</button></div>')+'</div>'+
 '<div class="index-hint">↑ ↓ Navigate records with your keyboard. Select a record to read its methods and limits.</div></aside>'+
 researchReader()+'</div></section>';
}
function directoryView(){
 return '<section class="tool-directory" aria-label="Research tools"><div class="directory-head"><div><span class="eyebrow dot">MORE WAYS TO INVESTIGATE</span><h2>Every question has another side.</h2></div><p>One connected reading experience, seven distinct ways to think about a research direction.</p></div>'+
 '<div class="directory-list">'+TOOLS.map(function(t,i){return '<button type="button" class="directory-link" data-go="'+t.id+'"><span class="ordinal">'+n2(i+1)+'</span><span><strong>'+escapeHtml(t.title)+'</strong><p>'+escapeHtml(t.desc)+'</p></span><span class="arrow">↗</span></button>';}).join('')+'</div></section>';
}
function exploreView(){
 return '<div class="main-container"><section class="cover"><div class="cover-left"><div class="cover-meta eyebrow">YEON / RESEARCH, MORE CLOSELY</div>'+
 '<h1>A lab is <span>more</span><br>than a name.</h1>'+
 '<p class="cover-copy">Follow the question behind a laboratory. Understand the ideas it pursues, the methods it tries, and the boundaries of what it knows.</p>'+
 '<div class="cover-actions"><button type="button" class="btn-main" data-scroll="archive">Explore the archive <span class="arr">↗</span></button>'+
 '<button type="button" class="btn-text" data-go="dna">How a lab evolves <span class="arr">↗</span></button></div>'+
 '<div class="cover-foot"><span class="cover-ornament" aria-hidden="true"><span>✳</span></span><strong>THE V6 FIELD READER</strong><span>Eight fictional records · Seven research instruments</span></div></div>'+
 '<aside class="specimen" aria-label="Featured interactive research field note">'+intro(state.selected)+'</aside></section>'+
 '<div class="principles"><div class="principle"><span>01</span><div><strong>Begin with the question.</strong><p>Understand the idea before searching for prestigious names.</p></div></div>'+
 '<div class="principle"><span>02</span><div><strong>Read the actual method.</strong><p>Compare research approaches rather than invented rankings.</p></div></div>'+
 '<div class="principle"><span>03</span><div><strong>Keep the uncertainty.</strong><p>Ask what each finding cannot yet establish.</p></div></div></div>'+
 archiveView()+directoryView()+'</div>';
}
function dnaView(){
 var l=lab(state.selected);
 return '<div class="main-container tool-page">'+pageTop('READING THE RESEARCH','Lab DNA','A laboratory is an evolving set of questions, not a static list of publications. Follow the sample research thread from first idea to open problem.','02')+
 '<div class="tool-toolbar"><label><span class="field-label">Choose laboratory</span><select class="select" data-select="selected">'+opts(l.id)+'</select></label><div class="toolbar-actions">'+followButton(l.id)+'<button class="btn-text" type="button" data-compare-selected="'+l.id+'">Compare its approach ↗</button></div></div>'+
 '<div class="doc-layout"><aside class="side-paper"><span class="eyebrow">THE CENTRAL QUESTION</span><p class="quote-big">'+escapeHtml(l.statement)+'</p>'+tagset(l.topics)+
 '<p style="margin-top:20px">These three chapters are illustrative research themes, not dated paper events.</p><button class="btn-text" type="button" data-go="connections">See conceptual connections ↗</button></aside>'+
 '<section class="paper"><div class="eyebrow">THREE CHAPTERS / AN IDEA IN PROGRESS</div><div class="dna-timeline">'+l.chapters.map(function(ch,i){return '<article class="dna-step"><span>'+n2(i+1)+'</span><div><h3>'+escapeHtml(ch[0])+'</h3><p>'+escapeHtml(ch[1])+'</p><small>'+escapeHtml(ch[2])+'</small></div></article>';}).join('')+'</div>'+
 '<div class="summary-line"><span>THE METHODS</span>'+list(l.methods)+'</div><div class="summary-line"><span>THE LIMITS</span>'+list(l.limits)+'</div>'+
 '<p class="smallprint">These entries are fictional examples. A future directory must link every chapter to dated, verifiable primary sources.</p></section></div></div>';
}
function compareView(){
 var a=lab(state.compA),b=lab(state.compB),common=overlapping(a,b);
 var rows=[['question','The question',escapeHtml(a.statement),escapeHtml(b.statement)],['methods','Methods',list(a.methods),list(b.methods)],['assumptions','Assumptions',list(a.assumptions),list(b.assumptions)],['limits','Limitations',list(a.limits),list(b.limits)]];
 return '<div class="main-container tool-page">'+pageTop('ONE LENS / TWO DIRECTIONS','Compare','Examine research approaches through the same questions. The purpose is to find meaningful differences, not to declare a winner.','03')+
 '<div class="tool-toolbar"><label><span class="field-label">First research lab</span><select class="select" data-select="compA">'+opts(a.id)+'</select></label>'+
 '<label><span class="field-label">Second research lab</span><select class="select" data-select="compB">'+opts(b.id)+'</select></label>'+
 '<button type="button" class="btn-outline" data-swap style="margin-bottom:1px">⇄ Swap</button></div>'+
 '<div class="compare-heads"><article class="compare-head"><span class="eyebrow">DOCUMENT A</span><h2>'+escapeHtml(a.name)+'</h2><p>'+escapeHtml(a.focus)+'</p></article>'+
 '<article class="compare-head"><span class="eyebrow">DOCUMENT B</span><h2>'+escapeHtml(b.name)+'</h2><p>'+escapeHtml(b.focus)+'</p></article></div>'+
 '<div class="comparison-focus-wrap"><span class="eyebrow">READ WITH A SINGLE LENS</span><div class="comparison-focus" role="group" aria-label="Comparison perspective">'+[['all','All evidence'],['question','Questions'],['methods','Methods'],['assumptions','Assumptions'],['limits','Boundaries']].map(function(x){return '<button type="button" data-compare-focus="'+x[0]+'" aria-pressed="'+(state.compareFocus===x[0])+'">'+x[1]+'</button>';}).join('')+'</div></div>'+
 '<div class="comparison-table">'+rows.filter(function(row){return state.compareFocus==='all'||row[0]===state.compareFocus;}).map(function(row){return '<div class="comparison-row"><div>'+row[1]+'</div><div>'+row[2]+'</div><div>'+row[3]+'</div></div>';}).join('')+'</div>'+
 '<p class="notice" style="margin-top:18px"><strong>Shared labels are not proof.</strong> '+(common.length?'The sample labs both reference '+escapeHtml(common.join(' and '))+'.':'These sample labs share no field label.')+' This does not establish direct collaboration, comparable experiments or research quality.</p>'+
 '<div class="toolbar-actions" style="margin-top:21px"><button class="btn-main" type="button" data-face-from-compare>Challenge these two approaches ↗</button></div></div>';
}
function connectionsView(){
 var l=lab(state.selected);
 var links=LABS.filter(function(x){return x.id!==l.id;}).map(function(x){return {l:x,share:overlapping(l,x)};}).filter(function(x){return x.share.length>0;}).sort(function(a,b){return b.share.length-a.share.length||a.l.name.localeCompare(b.l.name);});
 return '<div class="main-container tool-page">'+pageTop('READING ACROSS LABS','Constellation','Connections here are shared topic labels, not claims of joint papers or actual partnerships. Follow a line of thought without inventing a network.','04')+
 '<div class="tool-toolbar"><label><span class="field-label">Research starting point</span><select class="select" data-select="selected">'+opts(l.id)+'</select></label><button class="btn-outline" data-go="compare" type="button">Open comparison ↗</button></div>'+
 '<div class="connections-board"><aside class="connections-source"><span class="eyebrow">THE STARTING QUESTION</span><h2>'+escapeHtml(l.name)+'</h2><p class="quote-big">'+escapeHtml(l.statement)+'</p>'+tagset(l.topics)+
 '<p style="margin-top:22px"><strong>'+links.length+' related example '+(links.length===1?'lab':'labs')+'.</strong> Shared fields indicate a topic overlap only.</p>'+
 '<button class="btn-text" type="button" data-go="dna">Read its Lab DNA ↗</button></aside>'+
 '<section class="connections-matches">'+(links.length?links.map(function(entry,i){return '<button type="button" class="connection-row" data-related="'+entry.l.id+'"><span>'+n2(i+1)+'</span><span><strong>'+escapeHtml(entry.l.name)+'</strong><small>'+escapeHtml(entry.l.focus)+'</small></span><span class="relation">'+escapeHtml(entry.share.join(' + '))+'</span><span class="row-arr">↗</span></button>';}).join(''):'<div class="empty"><h3>No labeled overlaps.</h3><p>This sample record has no other lab sharing its topic tags.</p></div>')+'</section></div>'+
 '<p class="smallprint" style="margin-top:18px">This intentionally avoids a visually impressive but misleading collaboration map. No edge is a verified partnership.</p></div>';
}
function radarView(){
 var followedLabs=LABS.filter(function(l){return state.follows.has(l.id);});
 var source=state.radarFilter==='following'?followedLabs:LABS;
 var checkpoints=[];
 source.forEach(function(l){l.chapters.forEach(function(ch,i){checkpoints.push({l:l,ch:ch,index:i});});});
 checkpoints.sort(function(a,b){return a.index-b.index||a.l.name.localeCompare(b.l.name);});
 return '<div class="main-container tool-page">'+pageTop('A PERSONAL RESEARCH ROUTINE','Radar','Keep track of what you intend to read. This prototype has a working local watchlist, not a live paper notification service.','05')+
 '<div class="radar-layout"><aside class="side-paper"><div style="display:flex;align-items:baseline;gap:13px"><strong class="stat-large">'+n2(followedLabs.length)+'</strong><span class="eyebrow">FOLLOWED LABS</span></div>'+
 '<p>Your choices stay in this browser. They do not create an account, notification subscription, or university contact.</p>'+
 '<div class="saved-list">'+(followedLabs.length?followedLabs.map(function(l){return '<div class="saved-line"><strong>'+escapeHtml(l.name)+'</strong><button type="button" data-follow="'+l.id+'">Remove ×</button></div>';}).join(''):'<div class="empty"><h3>No labs saved.</h3><p>Start with a research question and follow any sample lab.</p><button class="btn-main" type="button" data-go="explore">Browse the archive ↗</button></div>')+'</div>'+
 '<button type="button" class="btn-outline" data-export>↓ Export my research notes</button></aside>'+
 '<section><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:13px"><span class="eyebrow">ILLUSTRATIVE READING CHECKPOINTS</span>'+
 '<div class="toolbar-actions"><button class="btn-outline btn-small'+(state.radarFilter==='following'?' is-on':'')+'" type="button" data-radar="following">Following</button><button class="btn-outline btn-small'+(state.radarFilter==='all'?' is-on':'')+'" type="button" data-radar="all">All samples</button></div></div>'+
 (checkpoints.length?'<div class="reading-feed">'+checkpoints.map(function(item){return '<div class="feed-line"><span>CHAPTER '+n2(item.index+1)+'</span><div><strong>'+escapeHtml(item.ch[0])+'</strong><p>'+escapeHtml(item.l.name)+' · Demonstration chapter, not a new publication</p></div><button data-inspect="'+item.l.id+'" type="button">Read ↗</button></div>';}).join('')+'</div>':
 '<div class="empty"><h3>Nothing on your reading list yet.</h3><p>Follow a sample lab or choose “All samples” above to explore every illustrative chapter.</p><button class="btn-outline" data-go="explore" type="button">Start exploring ↗</button></div>')+
 '</section></div></div>';
}
function doorsView(){
 return '<div class="main-container tool-page">'+pageTop('EVIDENCE BEFORE OPPORTUNITY','Open Doors','Academic openings should come from an official lab or university announcement, not from an attractive interface.','06')+
 '<div class="doors-layout"><section class="doors-figure"><span class="eyebrow">VERIFIED LIVE OPPORTUNITIES</span><div class="stat-large">0</div>'+
 '<h2>No verified openings are connected.</h2><p>YEON V6 does not yet import real positions, internships or funded roles. Rather than invent them, this space gives you a rigorous verification routine.</p>'+
 '<div class="notice"><strong>What comes next?</strong> In a real release, each opportunity would need an official link, source timestamp, verified eligibility, funding details and update status.</div></section>'+
 '<section class="paper"><span class="eyebrow">BEFORE YOU APPLY / THE CHECKLIST</span><h2 style="margin-top:13px">Five questions that prevent false leads.</h2>'+
 '<p class="smallprint">A personal checklist only. Checking a box does not verify an actual posting.</p>'+
 '<div class="check-list">'+CHECKS.map(function(t,i){return '<label class="check-line"><input type="checkbox" data-check="'+i+'" '+(state.checks.has(i)?'checked':'')+'><span>'+escapeHtml(t)+'</span></label>';}).join('')+'</div>'+
 '<p class="check-progress" role="status"><strong>'+state.checks.size+' / '+CHECKS.length+'</strong> verification steps marked for practice.</p>'+
 '<button type="button" class="btn-text" data-clear-checks>Reset my checklist ↺</button></section></div></div>';
}
function fitView(){
 var selected=Array.from(state.interests);
 var results=LABS.map(function(l){return {l:l,overlap:l.topics.filter(function(x){return state.interests.has(x);})};}).sort(function(a,b){return b.overlap.length-a.overlap.length||a.l.name.localeCompare(b.l.name);});
 return '<div class="main-container tool-page">'+pageTop('FOLLOW YOUR OWN QUESTIONS','Fit Lens','Select the research areas you care about. The explanation below uses only shared topic labels, not admission probabilities or unverified rankings.','07')+
 '<div class="paper"><span class="eyebrow">01 / YOUR RESEARCH INTERESTS</span><h2 style="margin-top:12px">What would you want to investigate?</h2>'+
 '<div class="topic-choices" role="group" aria-label="Choose research interest topics">'+TOPICS.map(function(t){return '<button type="button" data-interest="'+t+'" aria-pressed="'+state.interests.has(t)+'">'+t+'</button>';}).join('')+'</div>'+
 '<p class="smallprint">'+selected.length+' selected topic '+(selected.length===1?'label':'labels')+'. These labels only define a transparent overlap, not expertise or eligibility.</p></div>'+
 (selected.length?'<div class="fit-grid">'+results.map(function(x){var num=x.overlap.length,pct=Math.round(num/selected.length*100);
 return '<article class="fit-row"><div class="fit-row-head"><span class="eyebrow">'+escapeHtml(x.l.institution)+'</span><span class="fit-count">'+num+' / '+selected.length+' INTERESTS</span></div>'+
 '<h3>'+escapeHtml(x.l.name)+'</h3><p>'+escapeHtml(x.l.focus)+'</p>'+
 '<div class="fit-meter" role="meter" aria-label="Number of shared topic labels" aria-valuemin="0" aria-valuemax="'+selected.length+'" aria-valuenow="'+num+'" style="--value:'+pct+'%"><i></i></div>'+
 '<p><strong>Why this appears:</strong> '+(num?'Shared '+escapeHtml(x.overlap.join(' and '))+' label'+(num===1?'':'s')+'.':'No selected topic label overlaps.')+'</p>'+
 '<button class="btn-text" data-inspect="'+x.l.id+'" type="button">Read the research ↗</button></article>';}).join('')+'</div>':'<div class="empty" style="margin-top:19px"><h3>Choose an interest to start.</h3><p>Without at least one selected label, the tool has no basis for a comparison.</p></div>')+
 '<div class="notice" style="margin-top:18px"><strong>What this cannot tell you:</strong> Faculty availability, eligibility, admissions decisions, lab quality, funding, or personal suitability. Those require real, verified evidence.</div></div>';
}
function faceoffView(){
 var a=lab(state.faceA),b=lab(state.faceB),s=SCENARIOS[state.scenario];
 return '<div class="main-container tool-page">'+pageTop('RESEARCH UNDER PRESSURE','Research Face-Off','Before claiming a method is better, define the conditions, identify the assumptions and decide what evidence would count.','08')+
 '<section class="paper"><span class="eyebrow">01 / SET THE CHALLENGE</span><div class="scenario-buttons" style="margin-top:13px">'+[['shift','Changing conditions'],['missing','Missing evidence'],['audit','Reproducibility']].map(function(x){return '<button type="button" data-scenario="'+x[0]+'" aria-pressed="'+(state.scenario===x[0])+'">'+x[1]+'</button>';}).join('')+'</div>'+
 '<div class="face-question"><span class="eyebrow">THE RESEARCH PROBLEM</span><h2>'+escapeHtml(s.title)+'</h2><p>'+escapeHtml(s.desc)+'</p></div>'+
 '<div class="tool-toolbar" style="padding:0;border:0;margin:0"><label><span class="field-label">Approach A</span><select class="select" data-select="faceA">'+opts(a.id)+'</select></label><label><span class="field-label">Approach B</span><select class="select" data-select="faceB">'+opts(b.id)+'</select></label></div></section>'+
 '<div class="face-columns" style="margin-top:15px">'+[a,b].map(function(l,i){return '<article class="face-column"><span class="eyebrow">APPROACH '+(i===0?'A':'B')+'</span><h3>'+escapeHtml(l.name)+'</h3><p>'+escapeHtml(l.statement)+'</p>'+
 '<div class="face-prompt"><strong>Methods</strong>'+escapeHtml(l.methods.join(' · '))+'</div><div class="face-prompt"><strong>Assumptions</strong>'+escapeHtml(l.assumptions.join(' · '))+'</div>'+
 '<div class="face-prompt"><strong>Important limits</strong>'+escapeHtml(l.limits.join(' · '))+'</div></article>';}).join('')+'</div>'+
 '<section class="verdict"><span class="eyebrow">02 / WHAT WOULD SETTLE IT?</span><h2 style="font:500 29px var(--serif);margin:13px 0">Evidence questions, not a winner.</h2>'+
 list(s.qs)+'<strong>Verdict: insufficient evidence.</strong><p>These are fictional profiles and no comparable experiments are available. Neither approach can be declared superior. You can save this research question to your private notes.</p>'+
 '<button class="btn-outline" type="button" data-save-question>＋ Save this question to field notes</button></section></div>';
}
function aboutView(){
 return '<div class="main-container tool-page">'+pageTop('INDEPENDENT PROJECT / PROTOTYPE','About YEON','An interface experiment for exploring research with the question, method, evidence and uncertainty in view.','09')+
 '<article class="about-prose"><span class="eyebrow">RESEARCH IS MORE THAN A PAPER</span>'+
 '<h2>What YEON is building</h2><p>YEON is an independent research-discovery initiative by Syeda Subhana. This V6 build explores the interfaces for Lab DNA, comparison, conceptual connections, Radar, opportunity verification, Fit Lens and Research Face-Off.</p>'+
 '<h2>Are these real laboratory records?</h2><p>No. All eight lab profiles and their papers, chapters and relationships are fictional examples. V6 does not provide verified university profiles, authenticated positions, live publication monitoring or admissions predictions.</p>'+
 '<h2>What data is saved?</h2><p>Followed demo labs, interest filters, the opportunity-checking practice checklist, local notes and appearance preferences are stored in your browser using localStorage where available. The prototype has no account system and does not sync notes to a server.</p>'+
 '<h2>How to clear your notes</h2><p>Clear the browser site data for this preview domain. Export field notes before clearing the site data if you want to keep them.</p>'+
 '<h2>How should results be interpreted?</h2><p>Topic overlaps are not collaborations, interest intersections are not admissions guidance, demonstration chapters are not verified publications, and checkboxes are not opportunity verification.</p>'+
 '<button class="btn-main" type="button" data-go="explore">Return to the research reader ↗</button></article></div>';
}
var VIEWS={explore:exploreView,dna:dnaView,compare:compareView,connections:connectionsView,radar:radarView,doors:doorsView,fit:fitView,faceoff:faceoffView,about:aboutView};
function render(){
 if(!LABS.length){app.innerHTML='<div class="main-container empty"><h3>Sample records unavailable.</h3><p>Check whether data.js loaded correctly.</p></div>';return;}
 app.innerHTML=(VIEWS[state.route]||exploreView)();
 document.querySelectorAll('[data-route]').forEach(function(el){
  var active=el.dataset.route===state.route;
  el.classList.toggle('active',active);
  if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
 });
 document.getElementById('radar-count').textContent=state.follows.size;
 document.getElementById('theme-toggle').setAttribute('aria-label',document.documentElement.dataset.theme==='dark'?'Switch to light appearance':'Switch to dark appearance');
 document.title=(state.route==='explore'?'Research Reader':state.route==='about'?'About':TOOLS.find(function(t){return t.id===state.route;})?.title||'YEON')+' / YEON V6';
}
function navigate(next,scroll){
 if(!ROUTES.includes(next))next='explore';
 var previous=state.route;
 function applyRoute(){
  state.route=next;
  if(location.hash!=='#'+next)history.pushState(null,'','#'+next);
  closeMenu();render();
  if(scroll!==false)window.scrollTo({top:0,behavior:'instant'});
 }
 if(previous!==next&&typeof document.startViewTransition==='function'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.startViewTransition(applyRoute);
 }else{
  applyRoute();
  if(previous!==next&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
   app.classList.remove('page-crossfade');
   void app.offsetWidth;
   app.classList.add('page-crossfade');
  }
 }
}
function refreshView(selector){
 var previousY=window.scrollY,focused=document.activeElement;
 render();
 window.scrollTo({top:previousY,behavior:'instant'});
 var target=selector&&document.querySelector(selector);
 if(target)target.focus({preventScroll:true});
 else if(focused&&focused.id){var replacement=document.getElementById(focused.id);if(replacement)replacement.focus({preventScroll:true});}
}
function inspect(id){choose(id);navigate('dna');}
function selectInExplore(id,focus){
 if(!valid(id))return;
 choose(id);render();
 if(focus){var row=document.querySelector('[data-pick="'+id+'"]');if(row)row.focus({preventScroll:true});}
 if(window.matchMedia('(max-width: 900px)').matches){
  var reader=document.getElementById('research-reader');
  if(reader)reader.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
}
function updateSearchList(){
 var results=matches(),el=document.getElementById('archive-list');
 if(!el)return;
 el.innerHTML=results.length?results.map(archiveRow).join(''):'<div class="empty"><h3>No matching research.</h3><p>Try a broader phrase or clear the current field filter.</p><button type="button" class="btn-outline" data-clear>Show all records</button></div>';
 var count=document.querySelector('.result-number');if(count)count.textContent=n2(results.length);
 if(results.length&&!results.some(function(l){return l.id===state.selected;})){
  choose(results[0].id);
  var reader=document.getElementById('research-reader');
  if(reader)reader.outerHTML=researchReader();
 }
 if(!results.length){var reader2=document.getElementById('research-reader');if(reader2)reader2.hidden=true;}
 else{var reader3=document.getElementById('research-reader');if(reader3)reader3.hidden=false;}
}
function closeMenu(){
 var m=document.getElementById('more-menu'),b=document.getElementById('more-toggle');
 m.hidden=true;b.setAttribute('aria-expanded','false');
 var p=document.getElementById('mobile-panel'),t=document.getElementById('mobile-toggle');
 p.hidden=true;t.setAttribute('aria-expanded','false');t.setAttribute('aria-label','Open menu');
 state.mobileOpen=false;state.moreOpen=false;
}
function commandList(query){
 var q=query.trim().toLowerCase(),items=[];
 TOOLS.forEach(function(t){if(!q||(t.title+' '+t.desc).toLowerCase().includes(q))items.push({type:'tool',id:t.id,title:t.title});});
 LABS.forEach(function(l){if(!q||[l.name,l.focus,l.statement,l.topics.join(' '),l.methods.join(' ')].join(' ').toLowerCase().includes(q))items.push({type:'lab',id:l.id,title:l.name});});
 var box=document.getElementById('command-results');
 box.innerHTML=items.slice(0,14).map(function(item){return '<button type="button" data-command-type="'+item.type+'" data-command-id="'+item.id+'"><span>'+escapeHtml(item.title)+'</span><small>'+(item.type==='tool'?'TOOL':'LAB RECORD')+' ↗</small></button>';}).join('')||'<div class="empty"><p>No sample records match. Try another research term.</p></div>';
}
function openCommand(){
 restoreFocus=document.activeElement;state.commandOpen=true;
 document.getElementById('command-backdrop').hidden=false;
 var input=document.getElementById('command-input');input.value='';commandList('');input.focus();
}
function closeCommand(){
 document.getElementById('command-backdrop').hidden=true;state.commandOpen=false;
 if(restoreFocus&&restoreFocus.focus)restoreFocus.focus({preventScroll:true});
}
function exportNotes(){
 var lines=['# YEON V6 — Research field notes','','**Important:** All laboratory entries below are fictional demonstration examples.','','## Followed labs'];
 LABS.filter(function(l){return state.follows.has(l.id);}).forEach(function(l){lines.push('- '+l.name+' — '+l.focus);});
 if(!state.follows.size)lines.push('(none)');
 lines.push('','## Private notes');
 LABS.forEach(function(l){if(state.notes[l.id])lines.push('','### '+l.name,'',state.notes[l.id]);});
 if(!LABS.some(function(l){return state.notes[l.id];}))lines.push('(none)');
 lines.push('','Generated from browser-local data. No real university claims are made.','');
 var blob=new Blob([lines.join('\n')],{type:'text/markdown;charset=utf-8'});
 var url=URL.createObjectURL(blob),anchor=document.createElement('a');
 anchor.href=url;anchor.download='YEON-V6-field-notes.md';document.body.appendChild(anchor);anchor.click();anchor.remove();
 setTimeout(function(){URL.revokeObjectURL(url);},300);
 tell('Exported your field notes as Markdown.');
}
function themeInit(){var theme=memo('yeon_v6_theme','light');document.documentElement.dataset.theme=theme==='dark'?'dark':'light';}
document.addEventListener('click',function(e){
 var b=e.target.closest('button');if(!b)return;
 if(b.id==='quick-toggle'){openCommand();return;}
 if(b.id==='theme-toggle'){var isDark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=isDark?'dark':'light';save('yeon_v6_theme',isDark?'dark':'light');render();return;}
 if(b.id==='more-toggle'){var box=document.getElementById('more-menu');box.hidden=!box.hidden;b.setAttribute('aria-expanded',String(!box.hidden));return;}
 if(b.id==='mobile-toggle'){var panel=document.getElementById('mobile-panel');panel.hidden=!panel.hidden;b.setAttribute('aria-expanded',String(!panel.hidden));b.setAttribute('aria-label',panel.hidden?'Open menu':'Close menu');return;}
 if(b.dataset.commandId){var id=b.dataset.commandId,type=b.dataset.commandType;closeCommand();if(type==='lab')inspect(id);else navigate(id);return;}
 if(b.dataset.feature){choose(b.dataset.feature);render();document.querySelector('[data-feature="'+b.dataset.feature+'"]')?.focus({preventScroll:true});return;}
 if(b.dataset.scroll){var target=document.getElementById(b.dataset.scroll);if(target)target.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return;}
 if(b.dataset.go){navigate(b.dataset.go);return;}
 if(b.dataset.pick){selectInExplore(b.dataset.pick,e.detail===0);return;}
 if(b.dataset.lens){
  var open=document.querySelector('.reader-notes')?.open;state.lens=b.dataset.lens;var reader=document.getElementById('research-reader');
  if(reader)reader.outerHTML=researchReader();
  if(open)document.querySelector('.reader-notes')?.setAttribute('open','');
  document.querySelector('[data-lens="'+state.lens+'"]')?.focus({preventScroll:true});return;
 }
 if(b.dataset.step!==undefined){
  var r=matches();var index=r.findIndex(function(l){return l.id===state.selected;});
  if(r.length){var step=Number(b.dataset.step);selectInExplore(r[(index+step+r.length)%r.length].id,false);document.querySelector('[data-step="'+step+'"]')?.focus({preventScroll:true});}return;
 }
 if(b.dataset.follow){toggleFollow(b.dataset.follow);return;}
 if(b.dataset.compareSelected){state.compA=b.dataset.compareSelected;if(state.compB===state.compA){state.compB=LABS.find(function(x){return x.id!==state.compA;})?.id||state.compB;}navigate('compare');return;}
 if(b.dataset.openDna){inspect(b.dataset.openDna);return;}
 if(b.dataset.clear!==undefined||b.hasAttribute('data-clear')){state.search='';state.topic='All';refreshView('#archive-search');return;}
 if(b.dataset.topic){state.topic=b.dataset.topic;refreshView('.filter-line [data-topic="'+state.topic+'"]');return;}
 if(b.dataset.compareFocus){state.compareFocus=b.dataset.compareFocus;refreshView('[data-compare-focus="'+state.compareFocus+'"]');return;}
 if(b.hasAttribute('data-swap')){var a=state.compA;state.compA=state.compB;state.compB=a;refreshView('[data-swap]');return;}
 if(b.dataset.related){state.compA=state.selected;state.compB=b.dataset.related;navigate('compare');return;}
 if(b.dataset.radar){state.radarFilter=b.dataset.radar;refreshView('[data-radar="'+state.radarFilter+'"]');return;}
 if(b.dataset.inspect){inspect(b.dataset.inspect);return;}
 if(b.dataset.interest){var t=b.dataset.interest;if(state.interests.has(t))state.interests.delete(t);else state.interests.add(t);save('yeon_v6_interests',Array.from(state.interests));refreshView('[data-interest="'+t+'"]');return;}
 if(b.dataset.scenario){state.scenario=b.dataset.scenario;refreshView('[data-scenario="'+state.scenario+'"]');return;}
 if(b.hasAttribute('data-clear-checks')){state.checks.clear();save('yeon_v6_checks',[]);render();return;}
 if(b.hasAttribute('data-export')){exportNotes();return;}
 if(b.hasAttribute('data-face-from-compare')){state.faceA=state.compA;state.faceB=state.compB;navigate('faceoff');return;}
 if(b.hasAttribute('data-save-question')){
  var a=lab(state.faceA),d=SCENARIOS[state.scenario],text='Research Face-Off: '+d.title+' Comparing '+a.short+' with '+lab(state.faceB).short+'. What evidence would settle this question?';
  state.notes[a.id]=[state.notes[a.id]||'',text].filter(Boolean).join('\n\n');save('yeon_v6_notes',state.notes);tell('Saved a question to '+a.short+' field notes.');return;
 }
});
document.addEventListener('click',function(e){
 var a=e.target.closest('a[data-route]');
 if(a){e.preventDefault();navigate(a.dataset.route);return;}
 if(!e.target.closest('.more-nav')){var menu=document.getElementById('more-menu');if(menu&&!menu.hidden){menu.hidden=true;document.getElementById('more-toggle').setAttribute('aria-expanded','false');}}
 if(e.target.id==='command-backdrop')closeCommand();
});
document.addEventListener('input',function(e){
 if(e.target.id==='archive-search'){state.search=e.target.value;updateSearchList();return;}
 if(e.target.id==='command-input'){commandList(e.target.value);return;}
 if(e.target.dataset.note){state.notes[e.target.dataset.note]=e.target.value;save('yeon_v6_notes',state.notes);var s=document.getElementById('note-status'),i=document.getElementById('notes-indicator');if(s)s.textContent='Saved locally in this browser.';if(i)i.textContent='Note saved';}
});
document.addEventListener('change',function(e){
 if(e.target.dataset.select){
  var field=e.target.dataset.select;
  if(field==='selected')choose(e.target.value);
  else if(['compA','compB','faceA','faceB'].includes(field)&&valid(e.target.value))state[field]=e.target.value;
  refreshView('[data-select="'+field+'"]');return;
 }
 if(e.target.dataset.check!==undefined){var id=Number(e.target.dataset.check);if(e.target.checked)state.checks.add(id);else state.checks.delete(id);save('yeon_v6_checks',Array.from(state.checks));refreshView('[data-check="'+id+'"]');}
});
document.addEventListener('keydown',function(e){
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(state.commandOpen)closeCommand();else openCommand();return;}
 if(e.key==='Escape'){
  if(state.commandOpen){e.preventDefault();closeCommand();return;}
  closeMenu();return;
 }
 if(state.commandOpen){
  var controls=[document.getElementById('command-input')].concat(Array.from(document.querySelectorAll('#command-results button')));
  if(e.key==='Tab'){
   var pos=controls.indexOf(document.activeElement);
   if(pos>=0){e.preventDefault();controls[(pos+(e.shiftKey?-1:1)+controls.length)%controls.length].focus();}
  }
  if(e.key==='Enter'&&document.activeElement.id==='command-input'){var first=document.querySelector('#command-results button');if(first){e.preventDefault();first.click();}}
  return;
 }
 var compareTab=e.target.closest?.('[data-compare-focus]');
 if(compareTab&&['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){
  e.preventDefault();var items=Array.from(document.querySelectorAll('[data-compare-focus]'));var pos=items.indexOf(compareTab),next=e.key==='Home'?0:e.key==='End'?items.length-1:(pos+(e.key==='ArrowRight'?1:-1)+items.length)%items.length;
  items[next].click();return;
 }
 var currentTab=e.target.closest?.('.reader-tabs [data-lens]');
 if(currentTab&&['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){
  e.preventDefault();var tabs=['question','method','limits'],i=tabs.indexOf(state.lens);
  var next=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;
  document.querySelector('[data-lens="'+tabs[next]+'"]')?.click();return;
 }
 var row=e.target.closest?.('.archive-row');
 if(row&&['ArrowDown','ArrowUp','ArrowRight','ArrowLeft'].includes(e.key)){
  e.preventDefault();var rows=Array.from(document.querySelectorAll('.archive-row'));var i=rows.indexOf(row);var diff=e.key==='ArrowDown'||e.key==='ArrowRight'?1:-1;
  var dest=rows[Math.max(0,Math.min(rows.length-1,i+diff))];if(dest)selectInExplore(dest.dataset.pick,true);return;
 }
 if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){
  e.preventDefault();if(state.route!=='explore')navigate('explore');
  var field=document.getElementById('archive-search');if(field){field.focus();field.scrollIntoView({block:'center'});}return;
 }
});
window.addEventListener('hashchange',function(){var h=location.hash.slice(1);state.route=ROUTES.includes(h)?h:'explore';closeMenu();render();window.scrollTo(0,0);});
window.addEventListener('popstate',function(){var h=location.hash.slice(1);state.route=ROUTES.includes(h)?h:'explore';closeMenu();render();});
themeInit();
var hash=location.hash.slice(1);state.route=ROUTES.includes(hash)?hash:'explore';render();
})();