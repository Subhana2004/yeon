import {
  explore,
  results,
  toolsPage,
  dna,
  paper,
  sources,
  missing,
} from "./views/discovery.js";
import { compare, faceoff } from "./views/comparisons.js";
import { radar, fit, doors, opportunity } from "./views/notebook.js";
import { constellation, bindPlot } from "./views/constellation.js";
import {
  esc,
  icon,
  url,
  route,
  link,
  toggle,
  follows,
  toolsList,
} from "./ui.js";

const views = {
  explore,
  dna,
  paper,
  sources,
  tools: toolsPage,
  compare,
  faceoff,
  radar,
  fit,
  doors,
  opportunity,
  constellation,
};
const main = document.querySelector("main"),
  menu = document.querySelector("#menu"),
  nav = document.querySelector("#topnav");
let previous = "",
  timer;
function announce(message) {
  const box = document.querySelector("#notice");
  box.textContent = message;
  clearTimeout(timer);
  timer = setTimeout(() => (box.textContent = ""), 3500);
}
function closeMenu() {
  nav.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
}
function render(move = false) {
  const { view, p } = route(),
    same = previous === view;
  previous = view;
  const active =
    {
      dna: "explore",
      paper: "explore",
      opportunity: "tools",
      compare: "tools",
      doors: "tools",
      faceoff: "tools",
      fit: "tools",
    }[view] || view;
  const focused = document.activeElement;
  const key =
    focused &&
    ["param", "node", "follow", "choice", "query"].find(
      (k) => focused.dataset?.[k],
    );
  const value = key && focused.dataset[key],
    choice = key === "choice" ? focused.value : null;
  const cursor = key === "query" ? focused.selectionStart : null;
  nav.innerHTML = [
    ["explore", "Explore"],
    ["constellation", "Constellation"],
    ["tools", "Research tools"],
    ["radar", "My Radar"],
  ]
    .map(
      ([v, n]) =>
        `<a href="${url(v, v === "radar" ? { show: "saved" } : {})}" ${v === active ? 'aria-current="page"' : ""}>${v === "radar" ? icon("save", 16) : ""}${n}</a>`,
    )
    .join("");
  closeMenu();
  try {
    main.innerHTML = (Object.hasOwn(views, view) ? views[view] : missing)(p);
    bindPlot();
  } catch (error) {
    console.error(error);
    main.innerHTML =
      "<h1>Reader unavailable</h1><p>Reload the page or return to the index.</p>" +
      link("explore", {}, "Return to Explore");
  }
  document.title =
    (view === "explore"
      ? "Explore"
      : main.querySelector("h1")?.textContent || "Reader") +
    " · YEON Research Index";
  if (same && key) {
    const restored = [...main.querySelectorAll("[data-" + key + "]")].find(
      (el) => el.dataset[key] === value && (!choice || el.value === choice),
    );
    restored?.focus({ preventScroll: true });
    if (cursor !== null && restored?.setSelectionRange)
      restored.setSelectionRange(cursor, cursor);
  }
  if (move && !same) {
    const title = main.querySelector("h1");
    title.tabIndex = -1;
    title.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  if (
    same &&
    view === "constellation" &&
    key === "node" &&
    document.querySelector(".edgelist")
  )
    document.querySelector(".inspector")?.focus();
}
function change(delta, replace = false) {
  const { view, p } = route();
  const next = url(view, { ...p, ...delta });
  if (replace) {
    history.replaceState(null, "", next);
    return;
  }
  if (location.hash !== next) location.hash = next;
}
menu.onclick = () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("open", open);
};
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("open")) {
    closeMenu();
    menu.focus();
  }
  if (e.target.matches("g[data-node]") && ["Enter", " "].includes(e.key)) {
    e.preventDefault();
    change({ node: e.target.dataset.node });
  }
});
document.addEventListener("click", (e) => {
  const btn = e.target.closest("a,button,[data-node]");
  if (!btn) return;
  if (btn.matches(".skip,[data-scroll]")) {
    e.preventDefault();
    const el = document.getElementById(btn.dataset.scroll || "main");
    el.focus({ preventScroll: true });
    el.scrollIntoView();
    return;
  }
  if (btn.hasAttribute("data-follow")) {
    announce(toggle(btn.dataset.follow));
    render();
    return;
  }
  if (btn.hasAttribute("data-save-fit")) {
    const keys = [...main.querySelectorAll("[data-choice]:checked")].map(
      (el) => el.value,
    );
    let message = "Selected interests saved to Radar on this device.";
    for (const key of keys)
      if (!follows.has(key)) {
        const outcome = toggle(key);
        if (outcome.startsWith("Browser")) message = outcome;
      }
    announce(message);
    return;
  }
  if (btn.dataset.node) change({ node: btn.dataset.node });
  if (btn.matches("a") && nav.contains(btn)) closeMenu();
});
document.addEventListener("change", (e) => {
  const el = e.target;
  if (el.dataset.param) {
    const param = el.dataset.param;
    const delta = { [param]: el.value };
    if (param === "root") Object.assign(delta, { node: "", type: "", rel: "" });
    if (param === "problem") Object.assign(delta, { a: "", b: "" });
    if (param === "a" && route().p.b === el.value) delta.b = "";
    change(delta);
  }
  if (el.dataset.choice) {
    const param = el.dataset.choice;
    const checked = [
      ...main.querySelectorAll('[data-choice="' + param + '"]:checked'),
    ].map((c) => c.value);
    // A sentinel distinguishes an intentional empty selection from loading stored preferences.
    change({ [param]: checked.join("|") || "-" });
  }
});
document.addEventListener("input", (e) => {
  if (!e.target.dataset.query) return;
  change({ q: e.target.value }, true);
  const { view, p } = route();
  if (view === "explore")
    document.querySelector("#results").innerHTML = results(p);
  else render();
});
addEventListener("hashchange", () => render(true));
render();
