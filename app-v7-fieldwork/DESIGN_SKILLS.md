# YEON V7 — Skill-first Fieldwork: source audit

**Status:** a fresh implementation in `app-v7-fieldwork/`, **not** a CSS retheme of V4/V6/V7 Signal Room.

## Repository access & honesty

On November 9, 2026, full `git clone --depth 1` attempts against the original GitHub skill repositories failed in the execution container because `github.com` DNS did not resolve. The repository contents listed below were **read using the connected GitHub integration** (individual original `SKILL.md` / reference files), but the original repositories were **not cloned**. This is a limited, explicit fallback, not a success claim. A reproducible clone script is supplied at `clone_skills.sh`; it should be rerun in an environment with GitHub network access. Do not execute untrusted third-party scripts without inspecting them.

## Original source material actually inspected

| Repository | File(s) inspected | Applied decision |
|---|---|---|
| `emilkowalski/skills` | `skills/emil-design-eng/SKILL.md`, `skills/review-animations/STANDARDS.md` | Avoid repeated-list animation. Utility actions instant; consequential open/close interactions 160–230ms. |
| `anthropics/skills` | `skills/frontend-design/SKILL.md`, `skills/webapp-testing/SKILL.md` | Start from research as an activity, not a generic SaaS landing page. Use Chromium screenshots to challenge layout. |
| `nextlevelbuilder/ui-ux-pro-max-skill` | `.claude/skills/ui-ux-pro-max/SKILL.md` | Specify single global tokens, context-first pages, map state, responsive test matrix. Searchable data scripts could not run without a full clone; don't claim to have executed the catalogs. |
| `hamen/material-3-skill` | `skills/material-3/SKILL.md` | Explicit interaction, typography, shape, focus and color roles; no Material UI copy. |
| `multica-ai/andrej-karpathy-skills` | `CLAUDE.md` | Think first, keep implementation simple and verify actual behavior. Not authored by or endorsed by Karpathy. |
| `delphi-ai/animate-skill` | `SKILL.md` | Purposeful CSS feedback, device capability gating, reduced motion. |
| `kylezantos/design-motion-principles` | `skills/design-motion-principles/SKILL.md` and `references/anti-checklist.md` | No pulsing CTA, scroll-reveal spam, hover-scale-on-everything or bounce for utility controls. |
| `AgentsORG/design-engineering` | `skills/design-engineering/SKILL.md`, `references/anti-patterns/ai-default-tells.md` | Reject purple gradients, feature-card formula, uniform pages, meaningless graphs, miniature body text. |
| `elayadesign/ai-design-skills` | `skills/landing-page-design/SKILL.md` | Restrict to one primary font (Manrope), functional mono labels, decisive CTA and legible line lengths. |
| `elayadesign/redesign-skill` | `skills/redesign-existing-projects/SKILL.md` | Audit type, spacing, surface, interactivity, content, state completeness and responsive fidelity. |
| `vercel-labs/agent-skills` | `skills/web-design-guidelines/SKILL.md` | Use W3C/WCAG 2.2 as validation reference. Preserve focus, clear accessible names, minimum touch-size and motion preferences. |

A further W3C source was consulted: https://www.w3.org/TR/WCAG22/

`Gabriel-Dalton/digital-accessibility-skill` was found on the web, but its attempted `SKILL.md` path was not available through the connected GitHub integration. Do **not** include it in the list of files inspected.

## V4–V7 failures addressed

- V4/V6: two-pane archive and same green/cream palette repeated everywhere.
- V6 Studio: large generic page title followed by static tables and cards.
- V7 Signal Room: harsh all-caps display typography and black-purple UI direction; repeated lab cards, and interactions that remain visually utilitarian.
- The redesign is **not** judged by green browser tests alone. Visual review of screenshots is mandatory.

## New design thesis: Fieldwork

YEON is a **research field guide**, not a tech portfolio or conventional dashboard. The experience follows a coherent path:

1. **Curiosity** — start with an actual research question, not fake rankings.
2. **Investigation** — open a full narrative dossier with distinct question/approach/limitations.
3. **Comparison** — contrast two research methods using one axis at a time.
4. **Practice** — follow topics, keep notes, and verify openings.

**Visual system:** bright cool paper, deep marine ink, a single vibrant vermilion accent; Manrope for type plus mono labels only for data. Type size prioritizes real reading and balanced hierarchy. Avoid purple-neon, dark wallpaper, oversized all-caps, and ubiquitous borders. Different tasks deserve different page structures. The research index is a **list**, not the same repeating card grid.

**Interaction system:** selected research question updates a specimen live; filtered results update without page jumping; keyboard selection and focus preserved; dossier mode switching has clear selected state; saved labs persist locally; note export is a real file download; no claims of connected admissions, university openings, or live rankings.

## Before release

Test at 320, 390, 768, 1024, and 1440 px in a real browser. Inspect desktop/mobile screenshots, verify no horizontal overflow, check keyboard access, mobile navigation and all route changes; check local persistence. Release to a new preview only, not to any previously liked/rejected V4–V7 domain. All eight source labs remain explicitly **fictional prototypes**, not real Korea university profiles.
