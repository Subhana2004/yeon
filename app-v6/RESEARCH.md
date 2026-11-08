# YEON V6 — design research and implementation decisions

## Task and baseline

Rebuild **the entire YEON research-discovery experience**, not just the archive. Use the **original V4** as a reference for editorial warmth, typographic quality, and research as reading, **not as a layout template**. Reject the V5 network/map dashboard and the repeated V4 recolor passes.

Repository baseline: `app-v4/index.html` on `main`. V4 and earlier production projects must remain intact. V6 is independently built and deployed.

**User journey:** Find a research question → read the work behind it → compare other approaches → follow it → collect private research notes → challenge the evidence. Content must never imply a verified Korean professor directory when using fictional sample fixtures.

## Primary skills studied, and their responsibilities

| Source | Evidence / core guidance | V6 decision |
|---|---|---|
| [Emil Kowalski Skills](https://github.com/emilkowalski/skills) (`emil-design-eng`, `review-animations`) | Motion is a cost; weigh purpose, frequency, responsiveness, interruptibility. | Short tab and hover feedback only. No pulses, scroll-animation spam, or motion on routine search. |
| [Anthropic Skills](https://github.com/anthropics/skills) (`frontend-design`, `webapp-testing`) | Design from subject matter; avoid generic AI defaults; use actual-browser screenshots and interactions. | Editorial research folio rather than a SaaS dashboard; screenshot iteration and responsive Playwright tests. |
| [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (`ui-ux-pro-max`, `design-system`) | Product-specific decision flow, tokens, clear states, accessibility and responsive layout. | One primitive→semantic CSS token hierarchy; editorial typography, semantic surfaces, durable component states. |
| [Material 3 Skill](https://github.com/hamen/material-3-skill) | Color roles, adaptive layouts, focus/state feedback, accessible controls. Web implementation is limited. | Take the semantics and responsiveness, **not** Material components or an Android aesthetic. |
| [Karpathy-inspired Skills](https://github.com/multica-ai/andrej-karpathy-skills) | Think before coding, minimum useful complexity, surgical edits, verify outcomes. Not an official Andrej Karpathy publication. | Separate V6 source. Share data/state across pages. Explicit acceptance tests. |
| [Animate Skill](https://github.com/delphi-ai/animate-skill) | Practical CSS/React motion recipes and reduced-motion control. | Only use CSS transforms and opacity where they clarify a state change; no React dependency solely for animation. |
| [Design Motion Principles](https://github.com/kylezantos/design-motion-principles) | Frequency gate, context-dependent durations and AI-motion anti-checklist. | Avoid ubiquitous scale-hover, sequential text reveals, decoration-heavy loops. |
| [Design Engineering](https://github.com/AgentsORG/design-engineering) | States, data as content, marketing versus product UI, AI-default anti-patterns. | Research provenance and uncertainty are first-class, no faked rankings, fake alerts or generic cards. |
| [Elaya AI Design Skills](https://github.com/elayadesign/ai-design-skills) (`landing-page-design`, `figma-designer`) | Clear information architecture, realistic copy, meaningful typography, bound semantic tokens in Figma. | Apply web-relevant principles; no claim of using Figma or shipping its specific variables. |
| [Elaya Redesign Skill](https://github.com/elayadesign/redesign-skill) | Diagnose in-context, fix generic patterns, test functionality and states. | Audit previous work and eliminate repeated card grids, headline filler, decorative maps and false functionality. |

Public skill instructions were retrieved from GitHub through the connected GitHub integration, not locally cloned through a terminal (network DNS restriction). This document does **not** claim that every optional example, script, or Figma-specific workflow was executed.

## Conflict resolution and visual thesis

Some Elaya instructions prescribe one sans font and a fixed 500ms motion duration; the original V4's serif/sans editorial contrast is precisely the part the user preferred, and Emil's motion skill warns against slow, frequent feedback. Therefore V6 uses **Newsreader + DM Sans**, a narrow monospace for data labels, and short feedback transitions (not universal 500ms motion). Brand/product fit outranks rigid stylistic recipes.

**Visual thesis:** YEON is an *interactive research publication*. Use warm paper, forest ink, fine dividers, open whitespace and one quiet moss accent. Questions and evidence lead the interface; cards and maps do not. A reading thread should feel like moving through a dossier, not opening dashboard widgets.

The homepage is an editorial cover with a **real interactive selected research thread**, followed immediately by the searchable archive. Every utility view is a different document or instrument, with shared typography and controls rather than repeated card templates.

## Information architecture and UX contract

1. **Explore:** deep question-led hero; working article specimen; searchable, filterable archive; selected reading lens (question / method / boundaries), follow, compare and notes.
2. **Lab DNA:** evidence-aware three-chapter reading timeline, methods and limits. No invented publication chronology dates.
3. **Compare:** a controlled two-lab comparison with consistent aligned axes (question, approach, assumptions, limitations). No unverifiable score.
4. **Constellation:** inspect *topic overlap* as relationships and a readable relationship matrix, **not** an invented collaboration graph.
5. **Radar:** real saved/followed state, but static sample chapter timeline with clear prototype labeling. No fake live alerts.
6. **Open Doors:** 0 verified opportunities until official listings exist, plus explicit verification checklist. No fabricated jobs.
7. **Fit Lens:** user-controlled interest tags, transparent count of shared topic labels, explanatory text. No simulated admissions probability.
8. **Research Face-Off:** scenario-first methodological challenge with a non-winner verdict unless verified experimental evidence exists.
9. **Field notes:** private browser-local per-lab notes and Markdown export. No server-side accounts or cloud sync.

## Engineering and QA gates

- Static HTML/CSS/JS with no build-time API dependency and no fabricated live data.
- Shared `data.js` explicitly fictional from previous V4 fixtures.
- Semantic tags, skip link, visible focus states, keyboard navigable controls, reduced-motion handling, minimum mobile touch targets.
- Empty states, successful state feedback, dark mode, graceful storage failure.
- Browser tests for 320, 390, 768, 1024 and 1440 px; no horizontal overflow; route transitions, search, topic filtering, lens selection, follow persistence, notes and export, comparison and keyboard interaction.
- Preserve old V4 and V5. V6 has its own branch and independently named `yeon-v6` Vercel project.
- Production-like static demonstration only; external data integration/official source verification is future work and not represented as complete.

## Acceptance criteria

V6 must be **visibly different at first glance** from rejected V4-recolor attempts and V5's map. It must have unique, meaningful layout across multiple tools; it must not claim working data integrations that do not exist; its browser QA must pass before deployment. A green test does not constitute aesthetic approval—inspect screenshots and revise where needed.
