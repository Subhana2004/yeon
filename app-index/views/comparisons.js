import { labs, labBy, problems, approaches, papers } from "../data/catalog.js";
import { esc, icon, link, heading, select, labOptions, demo } from "../ui.js";
const row = (label, left, right, a, b) =>
  `<div class="matrixrow"><h3>${esc(label)}</h3><div><span class="mobilelabel">${esc(a)}</span>${left}</div><div><span class="mobilelabel">${esc(b)}</span>${right}</div></div>`;
export function compare(p) {
  const a = labBy(p.a) || labs[0],
    b = labBy(p.b);
  const right = b && a !== b ? b : labs.find((x) => x !== a);
  const common = a.topics.filter((t) => right.topics.includes(t));
  const line = (label, f) => row(label, f(a), f(right), a.short, right.short);
  return (
    heading(
      "Lab Compare",
      "Lab Compare",
      "Read two laboratories against the same questions, methods and evidence gaps.",
    ) +
    `<div class="selectors">${select("a", "First laboratory", labOptions, a.id)}${icon("compare", 24)}${select(
      "b",
      "Second laboratory",
      labOptions.filter(([id]) => id !== a.id),
      right.id,
    )}</div><section class="finding"><div class="kicker">Interpretation · fictional dossiers</div><h2>${common.length ? "Common ground in " + esc(common.join(" and ").toLowerCase()) : "Different starting points"}</h2><p>${a.short} asks about ${esc(a.focus.toLowerCase())}. ${right.short} examines ${esc(right.focus.toLowerCase())}. ${common.length ? "The overlap comes from the topic labels recorded in both dossiers." : "The two dossiers share no indexed topic labels."}</p></section><div class="matrix"><div class="matrixrow matrixhead"><strong>Comparison lens</strong><strong>${a.name}</strong><strong>${right.name}</strong></div>
 ${line("Research question", (l) => esc(l.statement))}${line("Fields", (l) => esc(l.topics.join(" · ")))}${line("Methods", (l) => esc(l.methods.join(" · ")))}${line("Research direction", (l) => esc(l.chapters[2][1]))}${line("Illustrative publications", (l) => esc(l.works.join(" · ")))}${line("Evidence gaps", (l) => esc(l.limits.join(" · ")))}${line("Verified researchers", () => "Unknown")}${line("Record source", (l) => link("dna", { lab: l.id }, "Read " + l.short + " dossier") + "<br>" + demo)}</div>`
  );
}
export function faceoff(p) {
  const id = Object.hasOwn(problems, p.problem) ? p.problem : "retrieval",
    problem = problems[id],
    ids = problem.methods;
  const a = ids.includes(p.a) ? p.a : ids[0],
    b = ids.includes(p.b) && p.b !== a ? p.b : ids.find((x) => x !== a);
  const left = approaches[a],
    right = approaches[b];
  const options = ids.map((i) => [i, approaches[i].name]);
  const axes = [
    ["mechanism", "Mechanism"],
    ["assumption", "Assumption"],
    ["evaluation", "Evaluation design"],
    ["strength", "Strength"],
    ["failure", "Failure condition"],
    ["when", "When to prefer it"],
  ];
  const citation = (arr) => {
    const source = papers[arr.paperId];
    return (
      link("paper", { id: source.id }, esc(source.title)) +
      "<br><small>" +
      source.author +
      " · " +
      source.year +
      "</small>"
    );
  };
  return (
    heading(
      "Research Face-Off",
      "Research Face-Off",
      "Compare two approaches to one problem and inspect the assumptions behind each choice.",
    ) +
    `<div class="toolbar">${select(
      "problem",
      "Research problem",
      Object.entries(problems).map(([k, v]) => [k, v.name]),
      id,
    )}</div><section class="finding"><div class="kicker">Methods question</div><h2>${esc(problem.question)}</h2><p>Editorial comparison based on the readings below. Performance depends on the evaluation set, training data and compute budget.</p></section><div class="selectors">${select("a", "First approach", options, a)}${icon("face", 24)}${select(
      "b",
      "Second approach",
      options.filter(([k]) => k !== a),
      b,
    )}</div><div class="matrix"><div class="matrixrow matrixhead"><strong>Reading lens</strong><strong>${left.name}</strong><strong>${right.name}</strong></div>${axes.map(([key, label]) => row(label, esc(left[key]), esc(right[key]), left.name, right.name)).join("")}${row("Supporting paper", citation(left), citation(right), left.name, right.name)}</div><h2 class="section-title">Explore adjacent dossiers</h2><div class="actions">${problem.labs.map((x) => link("dna", { lab: x }, esc(labBy(x).name), "button quiet")).join("")}</div>`
  );
}
