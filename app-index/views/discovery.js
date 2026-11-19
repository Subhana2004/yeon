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
  return `<div class="hero a1-hero"><div class="herocopy"><div class="kicker"><i></i> Independent research atlas <span class="a1-series">/ Edition 01</span></div><h1>Ideas don’t exist<br><em>in isolation.</em></h1><p>See the connections behind discovery. Move between questions, methods and published ideas in an evidence-first research atlas. Eight lab dossiers are fictional demonstrations.</p><div class="heroactions"><a class="button primary" href="#collection" data-scroll="collection">${icon("index")} Explore the atlas</a>${link("tools", {}, "Research tools", "button quiet")}</div></div>
 <a class="plate a1-visual" href="#constellation?root=lab-arbor" aria-label="Explore research connections in Constellation">
 <div class="platehead"><span>YEON / THE RESEARCH FIELD</span><span>INTERACTIVE ATLAS · 001</span></div>
 <div class="a1-artwork" aria-hidden="true">
 <svg viewBox="0 0 600 526" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="a1disc"><stop offset="0" stop-color="#285d70" stop-opacity=".9"/><stop offset=".65" stop-color="#13445c" stop-opacity=".65"/><stop offset="1" stop-color="#09273a" stop-opacity="0"/></radialGradient>
  <linearGradient id="a1line" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#d3eeed" stop-opacity=".66"/><stop offset=".52" stop-color="#a8d2d7" stop-opacity=".25"/><stop offset="1" stop-color="#b9f12f" stop-opacity=".68"/></linearGradient>
  <filter id="a1glow"><feGaussianBlur stdDeviation="14"/></filter></defs>
  <circle cx="305" cy="254" r="220" fill="url(#a1disc)"/>
  <g stroke="#b4e6de" stroke-width=".7" opacity=".14">
   <path d="M34 80H568M34 155H568M34 230H568M34 305H568M34 380H568M34 455H568"/>
   <path d="M74 45V487M155 45V487M236 45V487M317 45V487M398 45V487M479 45V487M560 45V487"/>
  </g>
  <g fill="none" stroke="url(#a1line)">
   <ellipse cx="312" cy="259" rx="213" ry="111" stroke-width="1.25" transform="rotate(-35 312 259)"/>
   <ellipse cx="312" cy="259" rx="172" ry="179" stroke-width=".8" transform="rotate(30 312 259)"/>
   <ellipse cx="312" cy="259" rx="121" ry="228" stroke-width=".65" transform="rotate(68 312 259)"/>
   <path d="M52 361C142 283 185 122 319 141S473 330 553 123" stroke-width="1.2"/>
   <path d="M72 135C170 228 193 393 343 390S477 264 539 366" stroke-width=".85"/>
   <path d="M68 253C162 302 215 302 315 225S462 203 560 256" stroke-width=".7"/>
  </g>
  <g stroke="#b9f12f" stroke-opacity=".15"><circle cx="312" cy="259" r="99" fill="none"/><circle cx="312" cy="259" r="74" fill="none"/></g>
  <circle cx="312" cy="259" r="41" fill="#b9f12f" opacity=".14" filter="url(#a1glow)"/>
  <circle cx="312" cy="259" r="29" fill="#b9f12f"/>
  <path d="M300 253l11 12 15-19" fill="none" stroke="#0b3048" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <g><circle cx="129" cy="176" r="6" fill="#f2f0e9"/><circle cx="459" cy="132" r="7" fill="#b9f12f"/><circle cx="486" cy="383" r="6" fill="#f2f0e9"/><circle cx="188" cy="425" r="5" fill="#b9f12f"/></g>
  <g font-family="Arial,sans-serif" font-size="10" fill="#e2f0eb" letter-spacing="1.5"><text x="63" y="157">QUESTIONS / 01</text><text x="405" y="112">METHODS / 02</text><text x="448" y="408">PAPERS / 03</text><text x="98" y="449">LABS / 04</text></g>
  <g stroke="#f2f0e9" stroke-opacity=".35" fill="none"><path d="M129 176L95 176"/><path d="M459 132L459 118"/><path d="M486 383L487 394"/><path d="M188 425L164 435"/></g>
 </svg></div>
 <div class="platefoot"><div><span class="meta">From question to method to evidence</span><strong>The invisible connections.</strong></div><span class="plateopen">Explore the field ↗</span></div></a>
 <nav class="a1-rail" aria-label="Featured research experiences">
  <a href="#dna?lab=arbor"><span class="a1-rail-icon">01</span><span><strong>Lab DNA</strong><small>Read the research</small></span><span aria-hidden="true">↗</span></a>
  <a href="#constellation?root=lab-arbor"><span class="a1-rail-icon">02</span><span><strong>Constellation</strong><small>Trace the links</small></span><span aria-hidden="true">↗</span></a>
  <a href="#faceoff?problem=alignment"><span class="a1-rail-icon">03</span><span><strong>Research Face-Off</strong><small>Compare approaches</small></span><span aria-hidden="true">↗</span></a>
  <a href="#fit"><span class="a1-rail-icon">04</span><span><strong>Fit Lens</strong><small>Find your direction</small></span><span aria-hidden="true">↗</span></a>
 </nav></div>
 <section class="collection" id="collection" tabindex="-1"><div class="sectionhead"><div><div class="kicker">Explore the collection</div><h2>Start with a question.</h2></div><label class="search">${icon("search")}<input type="search" data-query="q" aria-label="Search labs, methods and papers" placeholder="Search labs, methods, papers…" value="${esc(p.q)}"></label></div>${fieldTabs("explore", p)}<div id="results">${results(p)}</div></section>`;
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
