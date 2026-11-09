# YEON Fieldwork — Unified Interface System
**Audit and release note · 9 November 2026 · Draft, independent preview**

## Diagnosis
Fieldwork contained one typography family but multiple unrelated visual moods. The existing screen review showed:
- A sage-tinted homepage feature paired with a giant peach marketing banner.
- Four differently colored topic cards, despite each representing the same information type.
- An orange Open Doors zero-state, a navy My Desk summary, a mint research challenge and peach Face-Off side.
- Compare used a tinted second column, potentially suggesting visual preference or quality.
- Buttons, cards and tabs changed radii, weights and background treatment between pages.

This is the "assembled from separate templates" feeling the user reported. The site already had a coherent research workflow; a fresh redesign of functionality is not the objective.

## One system: color roles (not colors per page)

| Token | Color | Meaning | Usage |
|---|---|---|---|
| `--bg` | `#F5F7F5` | Cool chalk | Browser background |
| `--white` | `#FFFFFF` | Paper | All readable tools, cards, controls |
| `--paper` | `#FBFCF9` | Warm white | Navigation and notes |
| `--mist` | `#E3EEE9` | Sea glass | Highlighted *questions* and homepage specimen |
| `--ink` | `#1B343C` | Primary text | Titles, controls, strong labels |
| `--mid` | `#5B7075` | Muted copy | Secondary text |
| `--dark` | `#203E46` | Deep marine | Explicit evidence or saved-work panels |
| `--accent` | `#BD492F` | Vermilion signal | Active state, one primary call to action, topic marker |
| `--accent-ink` | `#94331F` | Deep signal | Small labels on light surfaces |

No more section-specific pink, blue, lavender and orange feature backgrounds. Color is now a **semantic role**, not a visual theme for each route.

## Type hierarchy
One Manrope sans-serif for the product. IBM Plex Mono solely for short, functional metadata (field numbers, check status, labels). Weights 500/600/700, not repeated 800 black display. Titles use balanced lines and tight but readable tracking. Each research page header uses one shared responsive 38–60px size, body copy 14–16px with ~1.75 line height. Emphasis follows actual information priority.

## Component grammar
- Main controls: 48px touch height. Small actions: 40px when appropriate.
- Cards: 10px corners, single cool-gray border, no gratuitous shadow/gloss.
- Controls: 8px corners, shared focus and pressed states.
- Spacing: 8/16/24/32/48/64px steps. Extra-large cover typography is isolated to the first discovery screen.
- Every tool route uses the existing `page-header` grammar and comparable top spacing.
- One paper surface for both compared labs. Border marker, rather than background, distinguishes columns.
- Every topic card has the same surface; titles and tags distinguish the topics.
- Desk, Open Doors and Face-Off verdict use the same dark marine surface, no bespoke colored alert pages.
- The homepage question feature, secondary feature and Face-Off challenge use the same sea-glass surface.
- Warnings/prototype caveats remain consistently presented as notice strips.

## Accessibility and motion
- Reduced-motion media query remains enforced.
- No repeated hover scaling or animated search/filter interactions.
- Focus-visible states are preserved.
- Static text contrast should meet at least WCAG AA: white on accent 5.05:1; deep accent text on paper 7.41:1; ink on chalk 12.17:1, verified with sRGB contrast calculations.
- All eight profiles are **fictional**; no fabricated universities, opportunities or rankings.

## Verification, not just pass/fail
1. Existing real Chromium functional suite tests navigating all research tools, note persistence, command search, topic and comparison controls, keyboard and exported Markdown at 320–1440px.
2. New visual invariant suite checks the actual computed CSS across **10 routes**, four widths and 20 screenshots: homepage paired material, four matching topic panels, matching comparison papers, matching Face-Off approaches, one dark evidence ink for Desk/Doors/Verdict, one heading font, no overflow.
3. Review captured images manually. Do not equate green Playwright status to subjective aesthetic approval.
4. Deliver to a separate `yeon-v7-consistent` preview, leaving `yeon-v7-fieldwork` and all V4–V7 versions unchanged until user acceptance.

## Skill basis
This consistency pass builds on the previously executed 12-repository original design-skill checkout and documented generator output in `app-v7-fieldwork/CLONE_RESULTS.md`. Applied: Emil Kowalski's motion-frequency rules; AgentsORG AI-default anti-patterns; Anthropic's subject-driven frontend design; Elaya's typography/spacing discipline; UI/UX Pro Max visual-system reasoning and accessible states. Existing skill clone report is retained in Actions, not presented as files installed on the user's PC.
