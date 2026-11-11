# YEON / Cohesive Experience — Visual Review

**Revision:** 11 November 2026  
**Status:** Separate V7.2 preview; preserve existing YEON V7 Fieldwork and Consistent deployments.

## Product direction

**Explore → Understand → Compare → Save.**

The earlier UI had a weak, crowded top navigation; a featured sample that duplicated the question chooser; isolated, differently composed tools; a billboard-style empty opportunity counter; and little connection between the homepage and task workflows.

This revision treats YEON as one research reading environment, with shared typographic scale, spacing, borders, surface roles, visible selection states and predictable route behavior. Avoid decorative dashboards or fake research statistics.

## Before / after

| Area | Previously | Revised |
|---|---|---|
| Top panel | Five flat text links, vague “Search” button | Four priority routes in a clear grouped navigation, dedicated Tools menu, prominent search |
| Mobile navigation | Long full-height menu with little direct access | Compact branded topbar plus four quick destinations; secondary tools in grouped menu |
| Hero | Featured example with redundant topic buttons | Single illustrative research field note showing question, method, uncertainty and one action |
| Journey band | Broad principles | Three useful steps: find a question, understand evidence, save the next step |
| Question explorer | Plain topic choices and preview | Stronger type hierarchy and consistent selected-state materials; preserves fast switching |
| After the explorer | Unrelated billboard and notes card | Three connected next actions: Compare, Explore topics, Save to desk |
| Page intros | Similar large headings followed by separate components | Shared breadcrumb, concise headline, useful “how to use” guidance |
| Research Index | Functional list with minimally grouped filters | Easier-to-scan catalog, consistent search and filters, readable rows |
| Dossiers | Distinct visual identity, weak spacing flow | Retained navy reading cover; calmer chapters, clearer tabs and evidence panels |
| Compare | Different panel geometry | Equal reading materials with one lens at a time, without fake numerical scores |
| Topic Atlas | Four generic boxes | Consistent research directory with field descriptions and related examples |
| My Desk | Oversized “00” tile and empty space | Useful compact summary plus an inviting reading-list empty state |
| Open Doors | Huge zero count dominating screen | Clear “no verified openings” status and actionable verification checklist |
| Fit Lens | Form-like topic choices | More consistent controls and transparent, explainable topic overlap |
| Face-Off | Isolated challenge panels | Consistent challenge → approaches → how to test hierarchy |
| Footer | Visually separate from navigation | Same typographic and color system, retained source and disclosure links |

## Skills and decisions

Based on the existing audited original GitHub design-skill repositories and the skill catalog in `DESIGN_SKILLS.md` and `CLONE_RESULTS.md`:

- **Anthropic frontend-design:** make research content, not decorative effects, the center of the interface.
- **Emil Kowalski:** repeated navigation/search/selection should not have theatrical animation.
- **AgentsORG design-engineering:** remove generic AI UI defaults, preserve purposeful empty states, keyboard semantics and mobile navigation.
- **UI/UX Pro Max:** one navigational hierarchy, semantic design tokens, minimum touch targets, responsive legibility.
- **Material 3 / accessibility guidance:** explicit focus, selected state, user-facing labels and reduced-motion preference.

## Data and safety

All eight laboratory profiles are **fictional prototype fixtures**. The site deliberately does not claim verified Korean faculty, papers, live opportunities or admissions fit. Notes and saved selections are browser-local.

## Verification

At the revision commit:
- Real Chromium functional suite across 320, 390, 768, 840, 1024, 1280 and 1440 px, including new Tools dropdown, mobile quick-navigation count, research/dossier reading, search, note persistence, export, comparison, checklists and keyboard controls.
- Ten-route visual consistency suite, computed CSS surfaces and no horizontal overflow at 320, 390, 768 and 1440 px.
- Actual screenshots reviewed for the homepage and internal pages at 1440 px and the principal flows at 390 px.
- Visual acceptance remains subjective; passing tests is not proof of ideal aesthetics.

Source changes are isolated on a separate branch and should not be merged or replace the original live deployment without user approval.
