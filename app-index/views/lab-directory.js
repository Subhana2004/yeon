import { labs, fields } from "../data/catalog.js";
import { icon, esc, link, select, empty, tags } from "../ui.js";

export function directory(p={}) {
  const demoDepartments={arbor:"School of Computing",prism:"School of Computing",dialogue:"Human–AI Studies",mosaic:"Information Systems",delta:"Information Systems",orchid:"Visual Computing",horizon:"Machine Learning",vertex:"Knowledge Systems"};
  const docs=labs.map(l=>({...l,department:l.department||demoDepartments[l.id]}));
  const modes=["all","universities","topics","researchers"];
  const mode=modes.includes(p.mode)?p.mode:"all";
  const institutes=[...new Set(docs.map(l=>l.institution))].sort();
  const depts=[...new Set(docs.filter(l=>!p.institution||l.institution===p.institution).map(l=>l.department))].sort();
  const q=(p.q||"").trim().toLowerCase();
  const matching=docs.filter(l=>(!p.institution||l.institution===p.institution)&&(!p.department||l.department===p.department)&&(!p.area||l.topics.includes(p.area))&&(!q||[l.name,l.institution,l.department,l.focus,l.statement,...l.topics,...l.methods].join(" ").toLowerCase().includes(q)));
  const found=mode==="researchers"?[]:p.sort==="name"?[...matching].sort((a,b)=>a.name.localeCompare(b.name)):matching;
  const chosen=found.find(l=>l.id===p.pick)||found[0];
  const makeOptions=(first,values)=>[["",first],...values.map(v=>[v,v])];
  const nav=modes.map((id,i)=>link("dna",{...p,mode:id,pick:""},["All labs","Universities","Research areas","Researchers"][i],"ld-tab"+(id===mode?" active":""))).join("");
  const group=mode==="universities"?institutes:mode==="topics"?fields:[];
  const groupButtons=group.map(v=>link("dna",{...p,[mode==="topics"?"area":"institution"]:v,department:"",pick:""},esc(v),"ld-pill")).join("");
  const list=found.map((l,i)=>`<article class="ld-item${l.id===chosen.id?" chosen":""}">
    <span class="ld-num">${String(i+1).padStart(2,"0")}</span>
    <div><small>${esc(l.institution)} / ${esc(l.department)} · FICTIONAL</small>
      <h3>${link("dna",{...p,pick:l.id},esc(l.name),"ld-title")}</h3>
      <p>${esc(l.focus)}</p>${tags(l.topics)}</div>
    ${link("dna",{...p,pick:l.id},'<span aria-hidden="true">↗</span><span class="ld-sr">Preview '+esc(l.name)+'</span>',"ld-arrow")}
  </article>`).join("");
  const preview=chosen?`<aside class="ld-preview" aria-label="Selected lab preview">
    <div class="ld-preview-label">LAB DNA / SELECTED <span>FICTIONAL DOSSIER</span></div>
    <div class="ld-motif" aria-hidden="true">◌ <span>◉</span> ◌</div>
    <p>${esc(chosen.institution)} / ${esc(chosen.department)}</p>
    <h2>${esc(chosen.name)}</h2><p class="ld-question">${esc(chosen.statement)}</p>
    <div class="ld-facts"><strong>RESEARCH THEMES</strong>${tags(chosen.topics)}<strong>METHODS</strong><p>${esc(chosen.methods.join(" · "))}</p><strong>PROFESSOR / PI</strong><p>Not provided in this fictional demonstration</p></div>
    ${link("dna",{lab:chosen.id},'Read full Lab DNA dossier <span aria-hidden="true">↗</span>',"ld-open")}
    <small>These labs, institutions and departments are fictional. No real affiliation is implied.</small>
  </aside>`:"";
  const results=mode==="researchers"?`<div class="ld-empty"><h2>Researcher directory not yet available</h2><p>No verified professors or PIs are included in the current demonstration dataset. We will not invent them.</p>${link("dna",{},"Browse labs","button quiet")}</div>`:`<section class="ld-results"><div class="ld-result-head"><h2><span role="status">${found.length} ${found.length===1?"laboratory":"laboratories"}</span> <small>/ DEMO</small></h2><span>Select to preview</span></div><div class="ld-split"><div class="ld-list">${list||empty("No matching labs","Try a broader search or clear filters.",link("dna",{},"Clear filters","button primary"))}</div>${preview}</div></section>`;
  return `<div class="lab-directory">
    <header class="ld-header"><p class="ld-breadcrumb">${link("explore",{},"YEON")} / LAB DNA / DISCOVER</p><span class="ld-overline">THE LABORATORY DIRECTORY</span><h1>Find the lab <em>behind the research.</em></h1><p>Browse universities, departments and research fields. Open a laboratory dossier to understand its work.</p><div class="ld-demo">DEMO DATA · 8 fictional laboratory records · no verified university feed</div></header>
    <section class="ld-main"><nav class="ld-tabs" aria-label="Lab discovery modes">${nav}</nav>
      <div class="ld-searchbox"><label class="ld-search">${icon("search",21)} <input type="search" data-query="q" value="${esc(p.q||"")}" aria-label="Search labs, universities or methods" placeholder="Search universities, laboratories, research topics or methods…"></label>
        <div class="ld-filters">${select("institution","University / institution",makeOptions("All demo institutions",institutes),p.institution||"")}
        ${select("department","School / department",makeOptions("All departments",depts),p.department||"")}
        ${select("area","Research field",makeOptions("All fields",fields),p.area||"")}
        ${select("sort","Sort",[["","Collection order"],["name","Name A–Z"]],p.sort||"")}</div>
        <div class="ld-filter-foot"><span>Institution, department and lab records shown are fictional.</span>${link("dna",{},"Clear filters","ld-clear")}</div>
      </div>
      ${groupButtons?`<div class="ld-groups">${groupButtons}</div>`:""}
      ${results}
      <footer class="ld-note"><strong>Evidence before claims.</strong> Real lab listings need verified affiliations and source links. ${link("sources",{},"Sources & provenance →","ld-clear")}</footer>
    </section>
  </div>`;
}
