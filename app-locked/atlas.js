import {renderConstellation} from "./loom.js";
import {labs, papers, approaches} from "../app-index/data/catalog.js";
import {icon, toggle, url} from "../app-index/ui.js";
import {renderHome, syncHomeMotion} from "./home.js";
import {renderDNA,renderDossier,renderPapers,renderPaperDetail} from "./pages-a.js";
import {renderMethods,renderCompare,renderRadar,renderTools} from "./pages-b.js";

const state={params:{},labQ:"",institution:"",department:"",area:"",methodFilter:"",labSort:"",selectedLab:"",paperQ:"",paperProblem:"",paperYear:"",selectedPaper:"",methodQ:"",methodFamily:"",selectedMethod:"",compareA:"arbor",compareB:"mosaic",graphLab:"arbor",graphNode:0,radarLab:"arbor",radarFocus:"Multimodal",radarMode:"all"};

function init(){initHomeSearch();document.querySelector(".menu-toggle").addEventListener("click",()=>{const nav=document.querySelector("#primary-nav"),open=nav.classList.toggle("open");document.querySelector(".menu-toggle").setAttribute("aria-expanded",String(open));});document.addEventListener("keydown",e=>{if(e.key==="Escape"){const nav=document.querySelector("#primary-nav");nav.classList.remove("open");document.querySelector(".menu-toggle").setAttribute("aria-expanded","false");}});document.addEventListener("click",onClick);document.addEventListener("change",onChange);document.addEventListener("input",onInput);addEventListener("hashchange",()=>render(true));render(false);}

let hasRendered = false;

function initHomeSearch() {
  const searchButton = document.querySelector(".locked-header-search");
  searchButton.innerHTML = icon("search", 32);
  document.querySelector(".locked-header-save").innerHTML = icon("save", 32);
  searchButton.addEventListener("click", () => document.querySelector("#home-search")?.focus());
  document.addEventListener("submit", event => {
    if (!event.target.matches("[data-home-form]")) return;
    event.preventDefault();
    const query = new FormData(event.target).get("q").trim();
    const term = query.toLowerCase();
    const matches = records => records.some(parts => parts.join(" ").toLowerCase().includes(term));
    const labMatches = matches(labs.map(lab => [lab.name, lab.institution, lab.focus, ...lab.topics, ...lab.methods]));
    const paperMatches = matches(Object.values(papers).map(paper => [paper.title, paper.author, paper.method]));
    const methodMatches = matches(Object.values(approaches).map(method => [method.name, method.mechanism, method.strength, method.assumption]));
    const destination = !term || labMatches ? "dna" : paperMatches ? "papers" : methodMatches ? "methods" : "dna";
    location.hash = query ? url(destination, {q: query}) : "#dna?q=";
  });
}

function loc(){const raw=(location.hash||"#explore").slice(1),i=raw.indexOf("?");return{view:i<0?raw||"explore":raw.slice(0,i),params:Object.fromEntries(new URLSearchParams(i<0?"":raw.slice(i+1)))}}

function render(move=false){const {view,params}=loc();state.params=params;
  if (view === "constellation" && (move || !hasRendered) && params.lab) {
    state.graphLab = params.lab;
    state.graphNode = 0;
  }
  if ((move || !hasRendered) && "q" in params) {
    const queryKey = {dna:"labQ", papers:"paperQ", methods:"methodQ"}[view];
    if (queryKey) state[queryKey] = params.q;
  }
  hasRendered = true;
  const current={dossier:"dna",paper:"papers"}[view]||view;const items=[["explore","Explore"],["dna","Labs"],["papers","Papers"],["methods","Methods"],["constellation","Constellation"],["radar","Radar"],["tools","Tools"]];
  if (view === "explore") items.splice(4, 2);
  document.querySelector("#primary-nav").innerHTML=items.map(([v,label])=>`<a href="#${v}" ${current===v?'aria-current="page"':""}>${label}</a>`).join("");const pages={explore:()=>renderHome(),dna:()=>renderDNA(state),dossier:()=>renderDossier(state),papers:()=>renderPapers(state),paper:()=>renderPaperDetail(state),methods:()=>renderMethods(state),compare:()=>renderCompare(state),constellation:()=>renderConstellation(state),radar:()=>renderRadar(state),tools:()=>renderTools(state)};const start=performance.now();try{document.querySelector("#main").innerHTML=(pages[view]||pages.explore)();}catch(err){console.error("YEON atlas view failed",err);document.querySelector("#main").innerHTML='<section class="canvas"><h1>Page unavailable</h1><p>Please reload or return to Explore.</p><a href="#explore" class="button primary">Explore</a></section>';}syncHomeMotion(document.querySelector(".locked-home"));document.title=(view==="explore"?"Explore":view==="dna"?"Lab DNA":view==="compare"?"Lab Compare":view[0]?.toUpperCase()+view.slice(1))+" · YEON Research Atlas";document.querySelector("#primary-nav").classList.remove("open");document.querySelector(".menu-toggle").setAttribute("aria-expanded","false");if(move){const title=document.querySelector("#main h1");if(title){title.setAttribute("tabindex","-1");title.focus({preventScroll:true});}window.scrollTo({top:0,behavior:"instant"});}return performance.now()-start;}

function onClick(e){
  const search = e.target.closest(".locked-section .searchbox button");
  if (search) {
    const section = search.closest(".locked-section");
    (section.querySelector(".record, .loom-node") || section.querySelector(".searchbox input"))?.focus();
    return;
  }
  const zoom = e.target.closest("[data-loom-zoom]");
  if (zoom) {
    const panel = zoom.closest(".loom-panel");
    const output = panel.querySelector(".loom-zoom");
    const amount = zoom.dataset.loomZoom;
    const percent = amount === "reset" ? 100 : Math.min(175, Math.max(100, parseInt(output.value, 10) + Number(amount)));
    output.value = percent + "%";
    panel.querySelector(".loom-map").style.width = percent + "%";
    return;
  }
  const focus = e.target.closest("[data-section-focus]");
  if (focus) document.getElementById(focus.dataset.sectionFocus)?.focus();
  const tab = e.target.closest("[data-section-tab]");
  if (tab) {
    const tabs = tab.closest("[data-section-tabs]");
    tabs.querySelectorAll("[data-section-tab]").forEach(button => button.setAttribute("aria-pressed", String(button === tab)));
    tabs.querySelectorAll("[data-section-panel]").forEach(panel => panel.hidden = panel.dataset.sectionPanel !== tab.dataset.sectionTab);
  }
const a=e.target.closest("[data-select-lab],[data-select-paper],[data-select-method],[data-graph-node],[data-radar-focus],[data-radar-mode],[data-follow],[data-clear],[data-swap],[data-goto]");if(!a)return;if(a.dataset.selectLab){state.selectedLab=a.dataset.selectLab;render();}else if(a.dataset.selectPaper){state.selectedPaper=a.dataset.selectPaper;render();}else if(a.dataset.selectMethod){state.selectedMethod=a.dataset.selectMethod;render();}else if(a.dataset.graphNode!==undefined){state.graphNode=a.dataset.graphNode;const width=document.querySelector(".loom-map")?.style.width;const scroll=document.querySelector(".loom-scroll")?.scrollLeft;render();if(width){document.querySelector(".loom-map").style.width=width;document.querySelector(".loom-zoom").value=width;document.querySelector(".loom-scroll").scrollLeft=scroll;}document.querySelector(`[data-graph-node="${state.graphNode}"]`)?.focus({preventScroll:true});}else if(a.dataset.radarFocus){state.radarFocus=a.dataset.radarFocus;render();}else if(a.dataset.radarMode){state.radarMode=a.dataset.radarMode;render();}else if(a.dataset.follow){const msg=toggle(a.dataset.follow);toast(msg);render();}else if(a.dataset.clear){const keys=a.dataset.clear==="lab"?["labQ","institution","department","labName","area","methodFilter","labSort"]:a.dataset.clear==="papers"?["paperQ","paperProblem","paperYear","paperAuthor","paperMethod"]:["methodQ","methodFamily"];keys.forEach(k=>state[k]="");if(loc().view==="dna"&&location.hash!=="#dna")location.hash="#dna";else render();}else if(a.dataset.swap){const left=state.params.a||state.compareA||labs[0].id,right=state.params.b||state.compareB||labs[1].id;state.compareA=right;state.compareB=left;location.hash="#compare?a="+encodeURIComponent(right)+"&b="+encodeURIComponent(left);}else if(a.dataset.goto){location.hash="#"+a.dataset.goto;}}

function onChange(e){const el=e.target.closest("[data-filter]");if(!el||el.type==="search")return;const key=el.dataset.filter,v=el.value;if(key==="graphLab"||key==="radarLab"){state[key]=labs.find(l=>l.name===v)?.id||labs[0].id;if(key==="graphLab")state.graphNode=0;}else state[key]=v;if(key==="compareA"||key==="compareB"){const a=key==="compareA"?v:state.compareA||state.params.a||labs[0].id;const b=key==="compareB"?v:state.compareB||state.params.b||labs[1].id;location.hash="#compare?a="+encodeURIComponent(a)+"&b="+encodeURIComponent(a===b?labs.find(l=>l.id!==a).id:b);return;}if(key==="institution")state.department="";if(key==="institution"||key==="department")state.labName="";if(["institution","department","area","methodFilter"].includes(key))state.selectedLab="";if(["paperProblem","paperYear"].includes(key))state.selectedPaper="";if(key==="methodFamily")state.selectedMethod="";if(key==="loomType")state.graphNode=0;render();}

function onInput(event) {
  const input = event.target;
  const key = input.dataset.filter;
  if (!key || input.type !== "search") return;
  state[key] = input.value;
  requestAnimationFrame(() => {
    if (!input.isConnected) return;
    const position = input.selectionStart;
    const keepFocus = document.activeElement === input;
    render();
    if (!keepFocus) return;
    const fresh = document.querySelector(`input[data-filter="${key}"]`);
    fresh?.focus({preventScroll: true});
    fresh?.setSelectionRange(position, position);
  });
}

function toast(message){const el=document.querySelector("#toast");el.textContent=message;el.classList.add("visible");clearTimeout(window.__atlasToast);window.__atlasToast=setTimeout(()=>el.classList.remove("visible"),2400);}

init();
