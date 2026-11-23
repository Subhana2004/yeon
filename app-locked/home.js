import { approaches, fields, labs, papers } from "../app-index/data/catalog.js";
import { esc, icon } from "../app-index/ui.js";

const glyphs = {
  layers: '<path class="face" d="m2 7 10-5 10 5-10 6Z"/><path d="m2 12 10 6 10-6M2 17l10 6"/><path class="accent" d="m12 23 10-6m-3-7 3 2"/>',
  compare: '<circle cx="8" cy="12" r="8"/><circle class="accent" cx="16" cy="12" r="8"/><path d="M12 5a8 8 0 0 1 0 14"/>',
  graph: '<path d="m7 5 5 7 5-7M4 19l8-7 8 7"/><circle cx="6" cy="4" r="2"/><circle cx="18" cy="4" r="2"/><circle cx="3" cy="20" r="2.4"/><circle cx="21" cy="20" r="2.4"/><circle class="accent" cx="12" cy="12" r="2.4"/>',
  radar: '<circle cx="12" cy="12" r="11" stroke-dasharray="26 2 10 2 19 3"/><circle cx="12" cy="12" r="7" stroke-dasharray="24 1 9 1 7 2"/><circle class="solid" cx="12" cy="12" r="3.2"/>',
  doors: '<path class="accent" d="M16 3l5 2v17l-5-2m0-7h2"/><path d="M3 2h13v21H3zm0 0 13 4"/>',
  cube: '<path class="face" d="m2 7 10-6 10 6-10 6Z"/><path d="M2 7v11l10 5V13"/><path class="accent" d="M22 7v11l-10 5"/>',
  face: '<path d="M1 5h6l12 14h4M1 19h6L19 5h4"/><path class="accent" d="m21 2 3 3-3 3m0 8 3 3-3 3"/>',
  paper: '<path d="M6 2h8l4 4v16H6zm8 0v5h4M9 11h6m-6 4h6m-6 3h4"/>',
  lab: '<path d="M9 2h6m-5 0v8L4 21h16l-6-11V2M7 16h10"/>',
  link: '<path d="m10 8 4-4a4 4 0 0 1 6 6l-4 4m-2 2-4 4a4 4 0 0 1-6-6l4-4m1 5 6-6"/>',
};

function homeIcon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[name]}</svg>`;
}

const tools = [
  ["#dna", "Lab DNA", "Explore a lab in depth", "layers"],
  ["#compare", "Lab Compare", "Compare research directions", "compare"],
  ["#constellation", "Constellation", "Map research connections", "graph"],
  ["#radar", "Radar", "Follow topics and updates", "radar"],
  ["../app-index/#doors", "Open Doors", "Find research opportunities", "doors"],
  ["../app-index/#fit", "Fit Lens", "See your research fit", "cube"],
  ["../app-index/#faceoff", "Research Face-Off", "Compare methods and approaches", "face"],
];

const popularTopics = ["Multimodal learning", "Human–AI interaction", "Clean energy materials"];

function renderArtwork() {
  const labels = [
    ["Papers", `${Object.keys(papers).length} published`, "paper", "#papers"],
    ["Labs", `${labs.length} demo dossiers`, "lab", "#dna"],
    ["Methods", `${Object.keys(approaches).length} approaches`, "layers", "#methods"],
    ["Topics", `${fields.length} indexed fields`, "graph", "#constellation"],
    ["Connections", "Evidence links", "link", "#constellation"],
  ];
  return `<div class="locked-art">
    <div class="locked-art-stage" aria-hidden="true"><picture class="locked-compact-art">
      <source media="(max-width: 1050px)" srcset="./assets/home-atmosphere-compact.webp">
      <img width="768" height="474" alt="" decoding="async">
    </picture><canvas class="locked-live-scene" aria-hidden="true"></canvas></div>
    <ul class="locked-art-labels" aria-label="Atlas coverage">
      ${labels.map(([label, detail, glyph, href], index) => `<li class="locked-label-${label.toLowerCase()}"><a href="${href}" data-evidence-label="${index}"><span>${homeIcon(glyph)}</span><div><strong>${label}</strong><small>${detail}</small></div></a></li>`).join("")}
    </ul>
  </div>`;
}

export function renderHome() {
  return `<section class="locked-home">
    <div class="locked-copy">
      <p class="locked-kicker">Korea’s research, connected</p>
      <h1><span>Explore</span> <span>The Evidence</span> <em>Behind Research.</em></h1>
      <p class="locked-intro">A unified space to explore Korea’s research <br class="locked-intro-break">laboratories, papers, methods and their connections.</p>
      <form class="locked-search" role="search" aria-label="Research atlas" data-home-form>
        ${icon("search", 32)}
        <input id="home-search" name="q" type="search" aria-label="Search research" placeholder="Search labs, papers, methods or topics…">
        <button type="submit" aria-label="Search"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 16h24m-11-10 11 10-11 10"/></svg></button>
      </form>
      <div class="locked-topics"><span>Popular topics</span>
        ${popularTopics.map(topic => `<a href="#dna?q=${encodeURIComponent(topic)}">${esc(topic)}</a>`).join("")}
      </div>
    </div>
    ${renderArtwork()}
    <nav class="locked-tools" aria-label="Research tools">
      ${tools.map(([href, name, subtitle, glyph]) => `<a href="${href}">${homeIcon(glyph)}<strong>${name}</strong><small>${subtitle}</small></a>`).join("")}
    </nav>
    <p class="locked-signoff">Korean Research <span>×</span> Evidence <span>×</span> Exploration</p>
  </section>`;
}

const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
let mountedHome;
let stopMotion;
let motionRequest = 0;

export function syncHomeMotion(home) {
  if (mountedHome === home) return;
  stopMotion?.();
  stopMotion = undefined;
  mountedHome = home;
  const request = ++motionRequest;
  if (!home || motionPreference.matches) return;
  const canvas = home.querySelector(".locked-live-scene");
  let context;
  try {
    context = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: true });
  } catch {
    return;
  }
  if (!context) return;

  import("./home-scene.js").then(({ mountHomeScene }) => {
    if (request !== motionRequest || motionPreference.matches) return;
    stopMotion = mountHomeScene(home, canvas, context);
  }).catch(() => {
    // The original locked artwork is already visible when rendering cannot start.
    canvas.classList.remove("is-live");
  });
}

motionPreference.addEventListener("change", () => {
  const home = mountedHome;
  mountedHome = undefined;
  syncHomeMotion(home);
});
