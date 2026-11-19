import { labs, labBy, fields, papers, readings } from "../data/catalog.js";
import {
  esc,
  icon,
  link,
  heading,
  select,
  labOptions,
  tags,
  demo,
  paperCard,
  empty,
  follow,
  fieldTabs,
  toolsList,
} from "../ui.js";

const searchable = (l) =>
  [l.name, l.focus, l.statement, ...l.topics, ...l.methods, ...l.works]
    .join(" ")
    .toLowerCase();
const mark = (lab) =>
  `<span class="labmark tone-${labs.indexOf(lab) % 4}" aria-hidden="true">${icon(["dots", "index", "face", "fit", "book", "graph", "fit", "compare"][labs.indexOf(lab)], 24)}</span>`;
export function results(p) {
  const q = (p.q || "").trim().toLowerCase();
  let found = labs.filter(
    (l) => (!p.area || l.topics.includes(p.area)) && searchable(l).includes(q),
  );
  if (p.sort === "name")
    found = found.toSorted((a, b) => a.name.localeCompare(b.name));
  const works = q
    ? Object.values(papers).filter(
        (x) =>
          (x.title + " " + x.method).toLowerCase().includes(q) &&
          (!p.area ||
            labs.some(
              (l) => l.topics.includes(p.area) && readings(l).includes(x),
            )),
      )
    : [];
  return `<div class="listmeta"><div><span role="status">${found.length} ${found.length === 1 ? "laboratory" : "laboratories"}${q ? " · " + works.length + " published readings" : ""}</span> ${p.q || p.area ? link("radar", { q: p.q, area: p.area }, "Find in Radar") : ""}</div>${select(
    "sort",
    "Sort",
    [
      ["", "Collection order"],
      ["name", "Name A–Z"],
    ],
    p.sort || "",
  )}</div>
 <div class="labgrid">${found.map((l) => `<article class="labrow"><div class="labline">${mark(l)}<div><span class="meta">${esc(l.institution)} · Fictional</span><h3>${link("dna", { lab: l.id }, esc(l.name))}</h3></div>${follow(l.id, l.short, true)}</div><p>${esc(l.statement)}</p>${tags(l.topics)}</article>`).join("")}</div>
 ${works.length ? `<h3 class="section-title">Published readings</h3>${works.map(paperCard).join("")}` : ""}
 ${!found.length && !works.length ? empty("No matching records", "Try a broader term or choose another field.", link("explore", {}, "Clear filters")) : ""}`;
}
export function explore(p) {
  return `<div class="hero"><div class="herocopy"><div class="kicker"><i></i> Independent research index</div><h1>Research is more<br>than <em>a paper.</em></h1><p>Explore research questions, compare methods and follow the evidence through a collection of fictional laboratory dossiers and published papers.</p><div class="heroactions"><a class="button primary" href="#collection" data-scroll="collection">${icon("index")} Browse laboratories</a>${link("tools", {}, "Research tools", "button quiet")}</div></div>
 <a class="plate" href="#dna?lab=arbor"><div class="platehead"><span>Method plate</span><span>Multimodal learning</span></div><img src="./assets/representation.webp" alt="Folded blue and amber wire mesh, an illustration of a representation space." width="1100" height="620"><div class="platefoot"><div><span class="meta">Arbor Intelligence Lab · Fictional dossier</span><strong>Representation space</strong></div><span class="plateopen">Read dossier</span></div></a></div>
 <section class="collection" id="collection" tabindex="-1"><div class="sectionhead"><div><div class="kicker">Explore the collection</div><h2>Laboratory index</h2></div><label class="search">${icon("search")}<input type="search" data-query="q" aria-label="Search labs, methods and papers" placeholder="Search labs, methods, papers…" value="${esc(p.q)}"></label></div>${fieldTabs("explore", p)}<div id="results">${results(p)}</div></section>`;
}
export const toolsPage = () =>
  heading(
    "Reader tools",
    "Research tools",
    "Choose a way to read the collection.",
  ) +
  `<div class="toolgrid">${toolsList.map(([v, n, s, i]) => link(v, {}, `${icon(i, 26)}<div><h2>${n}</h2><p>${s}</p></div>`, "toolrow")).join("")}</div>`;
const labHeader = (l) =>
  `<div class="dossierhead">${mark(l)}<span class="meta">${esc(l.institution)}</span>${demo}</div>`;
export function dna(p) {
  const l = labBy(p.lab || "arbor");
  if (!l) return missing();
  const related = labs.filter(
    (x) => x !== l && x.topics.some((t) => l.topics.includes(t)),
  );
  return (
    heading("Lab DNA", l.name, l.focus) +
    `<div class="toolbar">${select("lab", "Laboratory", labOptions, l.id)}${follow(l.id, l.short)}${link("compare", { a: l.id, b: related[0].id }, icon("compare") + " Compare labs", "button quiet")}</div><div class="readinglayout"><article><section class="question">${labHeader(l)}<h2>${esc(l.statement)}</h2>${tags(l.topics)}</section>
 <section><h2>Research trajectory</h2><p class="subtle">Three chapters from the fictional dossier. Dates are unavailable.</p><ol class="timeline">${l.chapters.map(([title, body, topic]) => `<li><span class="meta">${esc(topic)}</span><h3>${esc(title)}</h3><p>${esc(body)}</p></li>`).join("")}</ol></section>
 <section><h2>Methods &amp; evidence</h2>${l.methods.map((m, i) => `<details><summary>${esc(m)}</summary><p>Assumption in this dossier: ${esc(l.assumptions[i])}.</p><p>Limitation: ${esc(l.limits[i])}.</p></details>`).join("")}${readings(l).length ? link("faceoff", { problem: readings(l)[0].problem }, "Compare related approaches") : link("faceoff", {}, "Browse method comparisons")}</section>
 <section id="publications"><h2>Publications &amp; reading</h2><p>Illustrative titles from this dossier</p><ul>${l.works.map((x) => `<li>${esc(x)} <small>· Fictional work</small></li>`).join("")}</ul><h3>Published background reading</h3><p class="subtle">Editorial selections on adjacent methods. Authorship is independent of the fictional lab.</p>${readings(l).map(paperCard).join("") || "<p>No published background reading has been selected for this dossier.</p>"}</section></article>
 <aside class="margin"><h2>Dossier notes</h2><dl><dt>Record source</dt><dd>YEON V4 demonstration collection</dd><dt>Researcher references</dt><dd>No verified people listed.</dd><dt>Evidence gaps</dt><dd>${l.limits.map(esc).join(" · ")}</dd></dl>${link("constellation", { root: "lab-" + l.id }, icon("graph") + " View connections", "button quiet")}<h3>Adjacent laboratories</h3>${related
   .slice(0, 3)
   .map(
     (x) =>
       `<p>${link("dna", { lab: x.id }, esc(x.name))}<br><small>Shared field · ${esc(x.topics.filter((t) => l.topics.includes(t)).join(", "))}</small></p>`,
   )
   .join("")}</aside></div>`
  );
}
export function paper(p) {
  const x = papers[p.id];
  if (!x?.title) return missing();
  return (
    heading("Published reading", x.title, x.author + " · " + x.year) +
    `<div class="readinglayout"><article class="question"><div class="kicker">Method note</div><h2>${x.method}</h2><p>${x.note}</p>${link("faceoff", { problem: x.problem, a: x.id }, "Compare this approach", "button primary")}</article><aside class="margin"><h2>Primary source</h2><p>Public publication record · Checked ${x.checked}</p><p><a href="${x.url}">Open publication source</a></p>${link("constellation", { root: "paper-" + x.id }, "Inspect connections")}</aside></div>`
  );
}
export const sources = () =>
  heading(
    "Provenance",
    "Sources & provenance",
    "Every record has an origin. The reader keeps these distinctions visible throughout the index.",
  ) +
  `<div class="readinglayout"><article><h2>Published research</h2><p>Bibliographic records link to the publisher or author manuscript. Links and titles checked on 19 November 2026.</p>${Object.values(papers).map(paperCard).join("")}</article><aside class="margin"><h2>Reading the labels</h2><dl><dt>Fictional record</dt><dd>Eight V4 lab dossiers and their sample titles illustrate how the reader works.</dd><dt>Editorial interpretation</dt><dd>Method comparisons and reading suggestions are qualitative summaries.</dd><dt>Unknown</dt><dd>The collection lacks a verified value.</dd><dt>Personal choices</dt><dd>Radar follows and saved Fit Lens interests stay in this browser.</dd></dl></aside></div>`;
export const missing = () =>
  heading(
    "Index",
    "Record unavailable",
    "This link does not identify a record in the collection.",
  ) + link("explore", {}, "Browse the index", "button primary");
