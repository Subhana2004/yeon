import { approaches, fields, labs, papers } from "../app-index/data/catalog.js";
import { esc, icon, url } from "../app-index/ui.js";
import { filterBlock, head, noResult, searchBox, stat } from "./pages-a.js";

const lanes = [
  ["Laboratory", "Labs", "book"],
  ["Editorial reading", "Papers", "index"],
  ["Listed method", "Methods", "compare"],
  ["Researcher", "Researchers", "save"],
  ["Research field", "Topics", "graph"],
];

function connectionEntries(lab) {
  return [
    { name: lab.name, type: "Laboratory", detail: lab.statement },
    ...(lab.topics.includes("Multimodal") ? Object.values(papers)
      .filter(paper => paper.method.toLowerCase().includes("contrast"))
      .map(paper => ({ name: paper.title, type: "Editorial reading", detail: "Independent background reading. This link does not imply authorship, affiliation, or collaboration.", paper: paper.id })) : []),
    ...lab.methods.map(name => ({ name, type: "Listed method", detail: "Listed in the fictional laboratory dossier." })),
    ...lab.topics.map(name => ({ name, type: "Research field", detail: "Indexed in the fictional laboratory dossier." })),
  ];
}

function renderThreads(rows, active) {
  const points = [];
  const coordinates = rows.map((row, lane) => row.map((entry, index) => {
    const x = 170 + (index + 1) * (520 / (row.length + 1)) + ((lane % 3)-1)*42;
    const y = 30 + lane * 60;
    const point = { x, y, entry };
    points.push(point);
    return point;
  }));
  const origin = coordinates[0][0];
  const backgrounds = lanes.map((_, index) => {
    const y = 30 + index * 60;
    return `<rect x="0" y="${y-24}" width="760" height="48" rx="24" fill="url(#loom-lane)"/>
      <path d="M155 ${y} Q285 ${y-31} 398 ${y} T745 ${y}" fill="none" stroke="#c2d0e2" stroke-width="13" opacity=".36"/>
      <path d="M142 ${y+5} C255 ${y-27} 310 ${y+29} 443 ${y+8} S614 ${y-31} 751 ${y+4}" fill="none" stroke="#fff" stroke-width="2" opacity=".82"/>
      <path d="M144 ${y-11} C295 ${y+18} 345 ${y-16} 456 ${y-5} S651 ${y+28} 748 ${y-7}" fill="none" stroke="#a5bbd3" stroke-width="3" opacity=".27"/>`;
  });
  return {
    points,
    svg: `<svg class="loom-threads" viewBox="0 0 760 300" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="loom-lane"><stop stop-color="#dce5f0"/><stop offset="1" stop-color="#f0f3f9"/></linearGradient></defs>
      ${backgrounds.join("")}
      ${origin ? points.filter(point => point !== origin).map(({x,y,entry})=>`<path d="M${origin.x} ${origin.y} C${origin.x} ${(origin.y+y)/2} ${x} ${(origin.y+y)/2} ${x} ${y}" fill="none" stroke="${entry===active?"#d65d37":"#9bb2cb"}" stroke-width="${entry===active?3:1.5}" ${entry.paper?'stroke-dasharray="4 4"':""}/>`).join("") : ""}
    </svg>`,
  };
}

export function renderConstellation(st) {
  const lab = labs.find(item => item.id === (st.graphLab || st.params.lab)) || labs[0];
  const query = (st.loomQ || "").trim().toLowerCase();
  const entries = connectionEntries(lab).filter(entry => (!st.loomType || entry.type === st.loomType || entry.type === "Laboratory") &&
    (!query || [entry.name,entry.type,entry.detail].join(" ").toLowerCase().includes(query) || entry.type === "Laboratory"));
  const selected = entries[st.graphNode === undefined || st.graphNode === 0 ? Math.min(1,entries.length-1) : Number(st.graphNode)] || entries[0];
  const rows = lanes.map(([type]) => entries.filter(entry => entry.type === type));
  const { points, svg } = renderThreads(rows, selected);

  return `<div class="canvas locked-section loom-lock">
    ${head("Constellation","The Korean Research","Constellation.","Explore laboratories, papers, methods, and the evidence connections that link them.")}
    <div class="locked-summary">${searchBox("loomQ","Search this laboratory’s evidence…",st.loomQ)}
    <div class="meta-strip">${stat(labs.length,"Demo labs","book")}${stat(Object.keys(papers).length,"Papers","index")}${stat(Object.keys(approaches).length,"Methods","compare")}${stat(fields.length,"Topics","graph")}</div></div>
    <div class="constellation-stage">
      <aside class="panel filter-panel" aria-label="Connection filters"><div class="filter-title">${icon("filter")} Explore the Constellation</div>
      ${filterBlock("index","Laboratory","graphLab",labs.map(item=>item.name),lab.name)}
      ${filterBlock("graph","Connection Type","loomType",lanes.slice(1).map(([type])=>type),st.loomType)}
      <div class="loom-legend"><strong>Evidence types</strong><p>Solid threads link the fictional dossier to indexed research fields or listed methods. Dashed threads indicate independent editorial readings.</p><p>Researcher records are unavailable.</p></div>
      </aside>
      <section class="loom-main" aria-label="Evidence Loom">
        <div class="panel loom-panel">
          <div class="loom-bar"><div><h2>Evidence Loom</h2><small>From laboratory to documented relationship</small></div>
          <div class="loom-controls" aria-label="Diagram zoom"><button type="button" data-loom-zoom="reset" aria-label="Reset diagram zoom">↺</button><button type="button" data-loom-zoom="-25" aria-label="Zoom out">−</button><output class="loom-zoom" aria-live="polite">100%</output><button type="button" data-loom-zoom="25" aria-label="Zoom in">+</button></div></div>
          <div class="loom-scroll" tabindex="0" role="region" aria-label="Scrollable evidence diagram"><div class="loom-map">${svg}
            ${lanes.map(([, label, glyph], index)=>`<div class="loom-row" style="--lane:${index}">${icon(glyph,24)}<span><strong>${label}</strong><br>${rows[index].length || "—"}</span></div>`).join("")}
            ${points.map(({x,y,entry})=>`<button class="loom-node" type="button" style="left:${x/7.6}%;top:${y/3}%" data-graph-node="${entries.indexOf(entry)}" data-node-type="${esc(entry.type)}" aria-pressed="${entry===selected}" aria-label="${esc(entry.name)} · ${esc(entry.type)}" title="${esc(entry.name)}"></button>`).join("")}
          </div></div>
          <div class="loom-key"><span>● Dossier connection</span><span>┄ Independent reading</span><span>● Selected pathway</span></div>
          <details class="loom-text"><summary>View evidence as a list</summary><ul>${entries.map(entry=>`<li><strong>${esc(entry.name)}</strong> · ${esc(entry.type)} — ${esc(entry.detail)}</li>`).join("")}</ul></details>
        </div>
        <div class="panel loom-clusters"><h2>Major Research Clusters</h2><div class="clusters">${fields.map(field=>`<a class="cluster" href="${esc(url("dna",{q:field}))}">${icon("graph",22)}<strong>${esc(field)}</strong></a>`).join("")}</div></div>
      </section>
      <aside class="loom-aside">
        <section class="panel"><h2>Constellation Overview</h2><p>${esc(lab.name)} · fictional dossier</p><div class="loom-count">${stat(entries.length-1,"Displayed relationships","graph")}</div></section>
        <section class="panel inspector"><h2>Connection Inspector</h2>
        ${selected?`<p class="section-label">${esc(selected.type)}</p><h3>${esc(selected.name)}</h3><p>${esc(selected.detail)}</p><div class="actions">${selected.paper?`<a class="button primary" href="#paper?id=${esc(selected.paper)}">Read Source Paper</a>`:`<a class="button primary" href="#dossier?id=${esc(lab.id)}">Read Lab Dossier</a>`}</div>`:noResult()}</section>
        <section class="panel"><h2>Browse Lab Connections</h2><div class="loom-lab-links">${labs.slice(0,5).map(item=>`<a href="${esc(url("constellation",{lab:item.id}))}">${esc(item.name)} <span>→</span></a>`).join("")}</div></section>
      </aside>
    </div></div>`;
}
