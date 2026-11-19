import { fields, labs, labBy } from "../data/catalog.js";
import {
  esc,
  icon,
  link,
  heading,
  select,
  empty,
  follow,
  follows,
  fieldTabs,
} from "../ui.js";
import {
  opportunities,
  availableStatus,
  sourceUrl,
  verifiedRecord,
  listFor,
} from "../data/opportunities.js";
import { missing } from "./discovery.js";
const topics = labs.flatMap((l) => l.methods);
const group = (label, items, selected, param) =>
  `<fieldset class="choices"><legend>${label}</legend>${items.map((x) => `<label><input type="checkbox" data-choice="${param}" value="${esc(x)}" ${selected.includes(x) ? "checked" : ""}><span>${esc(x)}</span></label>`).join("")}</fieldset>`;
const picked = (p, key, valid) =>
  p[key] === undefined
    ? valid.filter((x) => follows.has(x))
    : (p[key] || "").split("|").filter((x) => valid.includes(x));
export function fit(p) {
  const interests = picked(p, "interests", fields),
    skills = picked(p, "skills", topics);
  const matches = labs
    .map((l) => ({
      l,
      overlap: [
        ...l.topics.filter((t) => interests.includes(t)),
        ...l.methods.filter((t) => skills.includes(t)),
      ],
    }))
    .filter((x) => x.overlap.length)
    .sort((a, b) => b.overlap.length - a.overlap.length);
  return (
    heading(
      "Fit Lens",
      "Fit Lens",
      "Choose the questions and techniques you want to explore. See exactly which dossier labels overlap.",
    ) +
    `<div class="fitlayout"><aside class="fitform">${group("Research interests", fields, interests, "interests")}<details ${skills.length ? "open" : ""}><summary>Technical interests</summary>${group("Methods", topics, skills, "skills")}</details><button class="button primary" data-save-fit ${!interests.length && !skills.length ? "disabled" : ""}>${icon("save")} Save interests to Radar</button><p class="subtle">Stored on this device.</p></aside><section><div class="kicker">Local label matching</div><h2>Research overlap</h2><p class="subtle">Results are ordered by the number of exact field and method labels in common. Ties follow collection order.</p>${matches.map(({ l, overlap }) => `<article class="fitresult"><span class="meta">Fictional laboratory</span><h3>${link("dna", { lab: l.id }, esc(l.name))}</h3><p>Shared interests · <b>${esc(overlap.join(", "))}</b></p><details><summary>Why this suggestion?</summary><p>Your selections and the V4 dossier both include ${esc(overlap.join(", "))}.</p><p>${l.methods.filter((x) => !skills.includes(x)).length ? "Possible reading directions: " + esc(l.methods.filter((x) => !skills.includes(x)).join(" and ")) + "." : "You selected both indexed methods."} Your proficiency and admission eligibility are unknown.</p></details></article>`).join("") || empty("Choose an interest to start", "Select a field or method to see the relevant dossiers.")}${link("doors", { area: interests[0] }, "Explore Open Doors", "button quiet")}</section></div>`
  );
}
export function radar(p) {
  const query = (p.q || "").toLowerCase(),
    saved = p.show === "saved",
    a = p.area;
  const matches = (l) => !a || l.topics.includes(a);
  const candidates = [...fields, ...topics, ...labs.map((l) => l.id)].filter(
    (key) => {
      const lab = labBy(key),
        name = lab ? lab.name + " " + lab.topics.join(" ") : key;
      return (
        (!saved || follows.has(key)) &&
        name.toLowerCase().includes(query) &&
        (!a ||
          (lab
            ? matches(lab)
            : key === a ||
              labs.some((l) => matches(l) && l.methods.includes(key))))
      );
    },
  );
  const activity = labs.filter(
    (l) =>
      matches(l) &&
      (follows.has(l.id) ||
        [...l.topics, ...l.methods].some((x) => follows.has(x))) &&
      [l.name, ...l.topics, ...l.methods]
        .join(" ")
        .toLowerCase()
        .includes(query),
  );
  return (
    heading(
      "Radar",
      "Research Radar",
      "Follow a laboratory, field or method on this device. The reading timeline draws from fictional dossier chapters.",
    ) +
    `<div class="toolbar"><label class="search">${icon("search")}<input data-query="q" type="search" aria-label="Search Radar" placeholder="Search interests or laboratories" value="${esc(p.q)}"></label>${select("area", "Field", fields, a, "All fields")}${select(
      "show",
      "Collection",
      [
        ["", "Discover"],
        ["saved", "Saved interests"],
      ],
      p.show || "",
    )}</div><div class="readinglayout"><section><h2>${saved ? "Saved interests" : "Topics & laboratories"}</h2><div class="followlist">${
      candidates
        .map((key) => {
          const lab = labBy(key);
          return `<div><div><span class="meta">${lab ? "Fictional laboratory" : fields.includes(key) ? "Research field" : "Method"}</span><h3>${lab ? link("dna", { lab: key }, esc(lab.name)) : esc(key)}</h3></div>${follow(key, lab?.short || key, true)}</div>`;
        })
        .join("") ||
      empty(
        "No interests here yet",
        "Try a different filter or follow a topic in Discover.",
        link("radar", {}, "Discover interests"),
      )
    }</div></section><aside class="margin"><div class="kicker">Sample activity</div><h2>Reading timeline</h2><p>These are illustrative chapter updates. Live alerts are unavailable.</p>${activity.map((l) => `<article class="event"><span class="meta">Sample · Chapter 3</span><h3>${esc(l.chapters[2][0])}</h3><p>${esc(l.chapters[2][1])}</p>${link("dna", { lab: l.id }, esc(l.name))}</article>`).join("") || empty("Your timeline starts here", "Follow a field or laboratory to see a sample reading update.")}</aside></div>`
  );
}
export function doors(p) {
  const sample = p.mode === "sample";
  const records = listFor(p.mode);
  const options = (key) => [
    ...new Set(opportunities.map((r) => r[key]).filter(Boolean)),
  ];
  const matches = records.filter(
    (r) =>
      ["area", "institution", "position", "eligibility"].every(
        (k) => !p[k] || r[k] === p[k],
      ) &&
      (!p.status || availableStatus(r) === p.status),
  );
  return (
    heading(
      "Open Doors",
      "Open Doors",
      "Explore research opportunities by their source, eligibility and verification status.",
    ) +
    `<div class="toolbar">${select(
      "mode",
      "Collection",
      [
        ["", "Verified opportunities"],
        ["sample", "Fictional example"],
      ],
      p.mode || "",
    )}</div><div class="doorfilters">${select("area", "Research area", fields, p.area, "Any area")}${select("institution", "Institution", options("institution"), p.institution, "Any institution")}${select("position", "Position", options("position"), p.position, "Any position")}${select("eligibility", "Eligibility", options("eligibility"), p.eligibility, "Any eligibility")}${select("status", "Availability", ["Open", "Expired", "Unknown"], p.status, "Any status")}</div>
 ${matches.length ? matches.map((door) => `<article class="opportunity"><span class="provenance"><i></i> ${door.kind === "fictional" ? "Fictional example" : "Verified public notice"} · ${availableStatus(door)} availability</span><h2>${link("opportunity", { id: door.id }, esc(door.title))}</h2><p>${esc(door.institution)} · ${esc(door.eligibility)}</p></article>`).join("") : empty(sample ? "No example matches these filters" : "No verified opportunities in this collection", sample ? "Change the filters to inspect the sample notice." : "A listing needs a public application source and a recorded verification date. Explore a fictional notice to see what those fields would contain.", link("doors", { mode: "sample" }, "View fictional example", "button quiet"))}`
  );
}
export function opportunity(p) {
  const door = opportunities.find((r) => r.id === p.id);
  if (!door || (!verifiedRecord(door) && door.kind !== "fictional"))
    return missing();
  const source = sourceUrl(door),
    lab = labBy(door.lab),
    fictional = door.kind === "fictional";
  const details = [
    ["Institution", door.institution],
    ["Area", door.area],
    ["Position", door.position],
    [
      "Eligibility",
      door.eligibility + (fictional ? " · fictional criterion" : ""),
    ],
    ["Date verified", door.verified || "Unverified"],
    ["Deadline", door.deadline || "Unknown"],
  ];
  return (
    heading(
      "Open Doors",
      door.title,
      fictional
        ? "Fictional example for inspecting an opportunity record."
        : "Public opportunity notice with source verification.",
    ) +
    `<div class="readinglayout"><section class="question"><div class="kicker">${availableStatus(door)} availability</div><h2>Application record</h2><dl>${details.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b || "Unknown")}</dd>`).join("")}<dt>Application source</dt><dd>${source ? `<a href="${esc(source)}">Read the original notice</a>` : "Unavailable. This fictional notice has no application link."}</dd></dl></section><aside class="margin"><h2>Related material</h2>${lab ? link("dna", { lab: lab.id }, esc(lab.name)) : ""}<p>${link("doors", { mode: fictional ? "sample" : "" }, "Back to Open Doors")}</p></aside></div>`
  );
}
