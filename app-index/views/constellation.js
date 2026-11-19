import { labs, papers, readings } from "../data/catalog.js";
import { esc, heading, select, link, empty } from "../ui.js";

const nodes = new Map(),
  edges = [];
const node = (id, type, label, extra = {}) => {
  if (!nodes.has(id)) nodes.set(id, { id, type, label, ...extra });
  return id;
};
const edge = (a, b, relation, evidence) =>
  edges.push({ a, b, relation, evidence });
for (const paper of Object.values(papers)) {
  const a = node("paper-" + paper.id, "Published paper", paper.title, {
    short: paper.author + " · " + paper.year,
    page: "paper",
    params: { id: paper.id },
  });
  edge(
    a,
    node("approach-" + paper.id, "Method", paper.method),
    "Describes",
    paper.note,
  );
}
for (const lab of labs) {
  const a = node("lab-" + lab.id, "Fictional lab", lab.name, {
    short: lab.short,
    page: "dna",
    params: { lab: lab.id },
  });
  for (const t of lab.topics)
    edge(
      a,
      node("field-" + t, "Field", t),
      "Indexes field",
      lab.name + " lists " + t + " in the V4 fixture.",
    );
  for (const [i, t] of lab.methods.entries())
    edge(
      a,
      node("method-" + lab.id + "-" + i, "Method", t),
      "Lists method",
      t + " appears in the fictional methodology section.",
    );
  for (const [i, t] of lab.works.entries())
    edge(
      a,
      node("work-" + lab.id + "-" + i, "Fictional work", t),
      "Lists sample work",
      "The V4 dossier includes this illustrative title. Publication and authorship are unverified.",
    );
  for (const p of readings(lab))
    edge(
      a,
      "paper-" + p.id,
      "Suggests reading",
      "Editorial background on " +
        p.method.toLowerCase() +
        ". The source is independent of the fictional lab.",
    );
}
const adjacent = (id) =>
  edges
    .filter((e) => e.a === id || e.b === id)
    .map((e) => ({ edge: e, n: nodes.get(e.a === id ? e.b : e.a) }));
const colors = {
  "Fictional lab": "#98b7ff",
  Method: "#83c6df",
  Field: "#f1b75b",
  "Published paper": "#e0e8fc",
  "Fictional work": "#caaee4",
};
function lines(label) {
  const words = label.split(" "),
    out = [""];
  for (const word of words) {
    const i = out.length - 1;
    if (out[i] && (out[i] + " " + word).length > 20) out.push(word);
    else out[i] += (out[i] ? " " : "") + word;
  }
  return out;
}
function network(center, neighbors, selected) {
  const cx = 420,
    cy = 233,
    coords = neighbors.map(({ n }, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / neighbors.length;
      return {
        n,
        x: cx + Math.cos(angle) * 260,
        y: cy + Math.sin(angle) * 144,
      };
    });
  const point = ({ n, x, y }, central = false) => {
    const label = lines(n.short || n.label),
      color = colors[n.type];
    return `<g class="node ${selected === n.id ? "selected" : ""}" transform="translate(${x} ${y})" role="button" tabindex="0" aria-labelledby="label-${esc(n.id)}" aria-pressed="${selected === n.id}" data-node="${esc(n.id)}"><title>${esc(n.label)}</title><rect x="-80" y="-20" width="160" height="${44 + label.length * 14}" fill="transparent"/><circle r="${central ? 15 : 9}" fill="${color}"/><circle class="ring" r="${central ? 21 : 15}" stroke="${color}" fill="none"/><text id="label-${esc(n.id)}" y="${central ? 38 : 29}" text-anchor="middle">${label.map((l, i) => `<tspan x="0" dy="${i ? 15 : 0}">${esc(l)} </tspan>`).join("")}</text></g>`;
  };
  return `<svg id="network" viewBox="0 0 840 474" role="group" aria-label="Interactive map centred on ${esc(center.label)}"><g id="plot">${coords.map(({ n, x, y }) => `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${n.id === selected ? "#e1b977" : "#536585"}" stroke-dasharray="${n.type === "Published paper" ? "5 5" : "none"}"/>`).join("")}${coords.map((pt) => point(pt)).join("")}${point({ n: center, x: cx, y: cy }, true)}</g></svg>`;
}
export function constellation(p) {
  const center = nodes.get(p.root) || nodes.get("lab-arbor"),
    all = adjacent(center.id);
  const visible = all.filter(
    ({ n, edge }) =>
      (!p.type || n.type === p.type) && (!p.rel || edge.relation === p.rel),
  );
  const hit = visible.find(({ n }) => n.id === p.node),
    chosen = hit?.n || center;
  const list =
    p.layout === "list" ||
    (!p.layout && matchMedia("(max-width: 660px)").matches);
  const rootOptions = [...nodes.values()]
    .filter(
      (n) =>
        n.type === "Fictional lab" ||
        n.type === "Field" ||
        n.type === "Published paper" ||
        n === center,
    )
    .map((n) => [n.id, n.label]);
  return (
    heading(
      "Constellation",
      "Constellation",
      "Follow a connection from a lab to a field, method or reading. Select a node to inspect the evidence.",
    ) +
    `<div class="graphfilters">${select("root", "Centre on", rootOptions, center.id)}${select("type", "Connected node type", [...new Set(all.map((x) => x.n.type))], p.type, "All types")}${select("rel", "Relationship", [...new Set(all.map((x) => x.edge.relation))], p.rel, "All relationships")}${select(
      "layout",
      "View",
      [
        ["map", "Map"],
        ["list", "List"],
      ],
      list ? "list" : "map",
    )}</div><div class="graphlayout"><section class="graphpanel"><div class="graphhead"><span class="kicker">Local connections</span><strong>${visible.length} connections</strong></div>
 ${!visible.length ? empty("No connections match", "Change the node or relationship filter.", link("constellation", { root: center.id }, "Reset filters")) : list ? `<div class="edgelist">${visible.map(({ n, edge }) => `<button data-node="${esc(n.id)}" aria-pressed="${chosen === n}"><span class="meta">${esc(edge.relation)} · ${esc(n.type)}</span><strong>${esc(n.label)}</strong></button>`).join("")}</div>` : network(center, visible, chosen.id)}
 ${!list && visible.length ? '<div class="graphcontrols"><button data-zoom="out" aria-label="Zoom out">−</button><button data-zoom="reset">Reset view</button><button data-zoom="in" aria-label="Zoom in">+</button></div>' : ""}</section>
 <aside class="margin inspector" tabindex="-1"><div class="kicker">Node inspector</div><span class="meta">${esc(chosen.type)}</span><h2>${esc(chosen.label)}</h2>${hit ? `<h3>${esc(hit.edge.relation)}</h3><p>${esc(hit.edge.evidence)}</p>` : "<p>Choose a connected node to read the relationship and its source.</p>"}${chosen.page ? link(chosen.page, chosen.params, chosen.page === "dna" ? "Open lab dossier" : "Open published reading", "button quiet") : ""}${hit ? link("constellation", { root: chosen.id, layout: p.layout }, "Centre on this node", "button quiet") : ""}
 <details><summary>Reading this map</summary><p>Solid lines show a recorded field, method or work. A suggested reading is an editorial link. Lab records and sample works are fictional. Node position has no quantitative meaning.</p></details></aside></div>`
  );
}
export function bindPlot() {
  const svg = document.querySelector("#network");
  if (!svg) return;
  let zoom = 1,
    x = 0,
    y = 0,
    drag = null;
  const apply = () =>
    svg
      .querySelector("#plot")
      .setAttribute(
        "transform",
        `translate(${420 + x} ${233 + y}) scale(${zoom}) translate(-420 -233)`,
      );
  document.querySelectorAll("[data-zoom]").forEach(
    (b) =>
      (b.onclick = () => {
        if (b.dataset.zoom === "reset") {
          zoom = 1;
          x = y = 0;
        } else
          zoom = Math.min(
            2.5,
            Math.max(0.65, zoom * (b.dataset.zoom === "in" ? 1.2 : 1 / 1.2)),
          );
        apply();
      }),
  );
  const localPoint = (e) =>
    new DOMPoint(e.clientX, e.clientY).matrixTransform(
      svg.getScreenCTM().inverse(),
    );
  svg.onpointerdown = (e) => {
    if (e.target.closest("[data-node]")) return;
    const pt = localPoint(e);
    drag = { px: pt.x, py: pt.y, x, y };
    svg.setPointerCapture(e.pointerId);
  };
  svg.onpointermove = (e) => {
    if (!drag) return;
    const pt = localPoint(e);
    x = drag.x + pt.x - drag.px;
    y = drag.y + pt.y - drag.py;
    apply();
  };
  svg.onpointerup = svg.onpointercancel = () => {
    drag = null;
  };
}
