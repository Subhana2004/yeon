---
name: yeon-visual-fidelity
description: Reconstruct one user-approved YEON Research Atlas screenshot faithfully, using minimal context, targeted code edits and screenshot comparison. Invoke for Explore, Lab DNA, Papers, Methods, Lab Compare, Constellation; never redesign Open Doors.
---
# YEON visual lock — single-page workflow

## References
Required attached ZIP: `YEON_LOCKED_DESIGN_CODEX_HANDOFF.zip`. Read `README_START_HERE.md` once. For each task, read only ONE full-resolution PNG from `01_PRIMARY_DESIGN_REFERENCES/`. Do not treat `02_CONTEXT_ONLY_NOT_APPROVED/` as accepted designs.

- Explore: `01_HOMEPAGE/LOCKED_homepage_fog_layers_nav.png`
- Lab DNA: `02_LAB_DNA/LOCKED_lab_dna_white_steel_blue_filters.png`
- Papers: `03_PAPERS/LOCKED_papers_search_filter_inspector.png`
- Methods: `04_METHODS/METHODS_last_polished_candidate_verify.png` (candidate; verify uncertain changes)
- Lab Compare: `05_LAB_COMPARE/LOCKED_lab_compare_three_column_overlap.png`
- Constellation: `06_CONSTELLATION/LOCKED_constellation_evidence_loom_light.png` (LIGHT loom, not dark cube)

All relative to `01_PRIMARY_DESIGN_REFERENCES/`. Radar is **not locked**. **Open Doors is frozen**. Preserve Fit Lens, Research Face-Off, existing data provenance and working navigation. Never invent university counts, affiliations, lab openings or evaluation scores.

## Token-efficient execution
1. ONE page per invocation. Before editing, inspect the reference PNG and current same-size browser render; report only 3–5 biggest discrepancies. Open targeted source files; avoid dumping whole directories or restating full design briefs.
2. Keep dominant composition, geometry, color, typography, filters, middle results and inspector exactly aligned to the PNG. Homepage: atmospheric fog and layered research meshes, seven-tool strip. Inner pages: pearl-white canvas, matte coral actions, steel-blue **component indicators only**, never full blue backgrounds or neon orange glows.
3. Change only needed files; don't rebuild functional routes or reimagine approved visual elements. Use actual DOM controls and source-linked data, not a static screenshot covering dead buttons.
4. Run focused route test + Playwright desktop `1672×941` and mobile `390px` screenshots. Compare visually to the exact PNG. Screenshots are needed; a build-pass is NOT visual-pass.
5. Write concise `YEON_PROGRESS.md`: page, reference, changed files, up to 3 remaining visual mismatches, tests and screenshot paths. Next task reads only this checkpoint plus the new page reference.
6. Full regression, mobile/desktop sizes and accessibility checks before PR review. Work in a new branch from draft PR #18. Do not modify production main or merge without approval.

## Stop and report
If the reference ZIP isn't accessible, stop rather than infer. If a design isn't locked, mark as unapproved. If the user asks for visual fidelity, do not generate new concepts. Final response: 1 line changed, 1 line tested, 3 remaining gaps max, preview + draft PR link.
