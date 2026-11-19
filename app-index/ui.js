import { labs, fields } from "./data/catalog.js";

const glyphs = {
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
  save: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  graph:
    '<circle cx="5" cy="11" r="2"/><circle cx="17" cy="5" r="2"/><circle cx="18" cy="18" r="2"/><path d="m7 10 8-4m-8 6 9 5m1-10 1 9"/>',
  compare:
    '<rect x="3" y="5" width="7" height="14" rx="1"/><rect x="14" y="5" width="7" height="14" rx="1"/>',
  book: '<path d="M3 5c4-1 7 0 9 2 2-2 5-3 9-2v14c-4-1-7 0-9 2-2-2-5-3-9-2zM12 7v14"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  filter: '<path d="M3 7h18M6 12h12m-9 5h6"/>',
  radar:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m12 12 7-7"/>',
  doors: '<path d="M4 21h16M7 20V4h11v16M14 12h1"/>',
  fit: '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>',
  face: '<path d="M3 17 9 6l5 12 7-12"/>',
  index: '<path d="M4 5h16M4 12h16M4 19h16"/>',
  dots: '<circle cx="6" cy="7" r="2"/><circle cx="17" cy="10" r="3"/><circle cx="9" cy="17" r="2"/>',
};
export const icon = (id, size = 19) =>
  `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[id] || glyphs.book}</svg>`;
export const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
export const url = (view, params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== "" && v != null),
  );
  return "#" + view + (query.size ? "?" + query : "");
};
export function route() {
  const [view, query = ""] = location.hash.slice(1).split(/\?(.*)/s);
  return {
    view: view || "explore",
    p: Object.fromEntries(new URLSearchParams(query)),
  };
}
export const link = (view, p, label, cls = "textlink", current = false) =>
  `<a class="${cls}" ${current ? 'aria-current="true"' : ""} href="${esc(url(view, p))}">${label}</a>`;
export const tags = (items) =>
  `<span class="tags">${items.map((x) => `<span>${esc(x)}</span>`).join("")}</span>`;
export const toolsList = [
  ["dna", "Lab DNA", "Read a laboratory dossier", "book"],
  ["compare", "Lab Compare", "Read two dossiers side by side", "compare"],
  ["radar", "Radar", "Follow labs and research interests", "radar"],
  [
    "constellation",
    "Constellation",
    "Trace the evidence for a connection",
    "graph",
  ],
  ["doors", "Open Doors", "Inspect opportunity notices", "doors"],
  ["fit", "Fit Lens", "Map your interests to a lab", "fit"],
  ["faceoff", "Research Face-Off", "Compare approaches to a problem", "face"],
];
export const heading = (section, title, desc) =>
  `<header class="viewhead"><div class="crumb">${link("explore", {}, "Research Index")}<span>/</span>${esc(section)}</div><h1>${esc(title)}</h1><p>${esc(desc)}</p></header>`;
export const demo = '<span class="provenance"><i></i> Fictional record</span>';
export const empty = (title, description, action = "") =>
  `<div class="empty"><h3>${esc(title)}</h3><p>${esc(description)}</p>${action}</div>`;
export const select = (name, label, options, value, first = "") =>
  `<label class="control"><span>${esc(label)}</span><select name="${name}" data-param="${name}">${(first
    ? [["", first], ...options]
    : options
  )
    .map((o) => {
      const [v, t] = Array.isArray(o) ? o : [o, o];
      return `<option value="${esc(v)}" ${v === value ? "selected" : ""}>${esc(t)}</option>`;
    })
    .join("")}</select></label>`;
export const labOptions = labs.map((l) => [l.id, l.name]);
export const paperCard = (p) =>
  `<article class="paper"><span class="meta">Published paper · ${p.year}</span><h3>${link("paper", { id: p.id }, esc(p.title))}</h3><p>${esc(p.author)} · ${esc(p.method)}</p></article>`;
export const storageKey = "yeon.index.follows.v1";
function readSaved() {
  try {
    const raw = JSON.parse(
      localStorage.getItem(storageKey) ??
        localStorage.getItem("yeon_v3_follows") ??
        "[]",
    );
    return Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
export const follows = new Set(readSaved());
export function toggle(key) {
  const old = follows.has(key);
  if (old) follows.delete(key);
  else follows.add(key);
  try {
    localStorage.setItem(storageKey, JSON.stringify([...follows]));
    return old ? "Removed from Radar." : "Saved to Radar on this device.";
  } catch {
    return "Browser storage is unavailable. Changes last for this visit.";
  }
}
export const follow = (key, label, compact = false) =>
  `<button type="button" class="${compact ? "save-icon" : "button quiet"}" data-follow="${esc(key)}" aria-label="${esc((follows.has(key) ? "Unfollow " : "Follow ") + label)}" aria-pressed="${follows.has(key)}" title="${esc((follows.has(key) ? "Unfollow " : "Follow ") + label)}">${icon(follows.has(key) ? "check" : "save")}${compact ? "" : follows.has(key) ? "Following" : "Follow " + esc(label)}</button>`;
export const fieldTabs = (view, p) =>
  `<div class="fieldtabs" aria-label="Research area">${["", ...fields].map((t) => link(view, { ...p, area: t }, esc(t || "All fields"), (p.area || "") === t ? "field active" : "field", (p.area || "") === t)).join("")}</div>`;
