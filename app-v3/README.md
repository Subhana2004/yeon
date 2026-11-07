# YEON / Research Fieldbook — V3

Third visual-direction experiment for the YEON **application frontend**. Intentionally independent of `/yeon/app/`, `/yeon/app-v2/` and the landing pages.

- Zero-build, static HTML/CSS/vanilla JS (works on GitHub Pages).
- **Synthetic fixture data only.** The labs, institutions, works, relationships, methods and opportunities are not real. The app intentionally avoids live-data/verification claims.
- Explore: searchable two-pane research index + interactive Lab DNA chronology.
- Compare: synchronized research lenses, swap, and direct lab selection.
- Constellation: zoomable/pannable SVG knowledge landscape with accessible list alternative. Edges represent *shared sample topic tags*, not real collaborations.
- Radar: local follow list, demo updates, read/unread filter.
- Open Doors: explicitly fictional notice states + freshness lessons.
- Fit Lens: explainable topic overlap (no admissions probability score).
- Research Face-Off: methodology lens, assumptions and limitations.
- Ctrl/Cmd + K command palette, keyboard shortcuts, local preference persistence, theme switch, mobile layouts, reduced-motion support.

## Design references

Designed after reviewing publicly accessible text of these skill repositories (not running their third-party scripts):
- [Anthropic frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design)
- [Emil Kowalski / emil-design-eng](https://github.com/emilkowalski/skills/tree/main/skills/emil-design-eng)
- [Emil Kowalski / review-animations](https://github.com/emilkowalski/skills/tree/main/skills/review-animations)
- [AgentsORG / design-engineering](https://github.com/AgentsORG/design-engineering)
- [Vercel web design guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines)

The repositories are **not cloned/installed** in this environment (GitHub DNS is unavailable to shell); the relevant skill documents were inspected through a connected GitHub API reader. No third-party executable skill code was run.

## Run locally
Open `index.html` in a browser; or `python -m http.server 8080` from the repo root and visit `/app-v3/`.

## Next stages
Replace the `LABS` fixture with an evidence-backed data adapter before describing any results as real Korean research.
