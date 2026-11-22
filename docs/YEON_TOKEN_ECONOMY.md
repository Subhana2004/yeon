# YEON — minimal-token workflow (not a license to lose fidelity)

**Current default:** repo-local `AGENTS.md` + **one** `yeon-visual-fidelity` skill + targeted Playwright screenshot comparison. Do not install a skill bundle or proxy globally. Results are not guaranteed; compare baseline usage first.

### Open-source tools reviewed
- [Caveman](https://github.com/JuliusBrussee/caveman): trims agent **visible prose**; project's 65% figure is for output tokens only. Full skill can add input overhead. Current repo takes *Caveman-lite style* into `AGENTS.md` instead of installing its large full skill.
- [Ponytail](https://github.com/DietrichGebert/ponytail): reuse existing code / native primitives / avoid unnecessary abstraction. Strong fit for YEON **only if fidelity and accessibility remain unchanged**. Principle applied in `AGENTS.md`; plugin/hook not installed.
- [OpenAI Playwright skill](https://github.com/openai/skills/tree/main/skills/.curated/playwright): optional for screenshot + interaction QA. Invoke **only when testing**; existing tests/scripts first.
- [RTK](https://github.com/rtk-ai/rtk): optional local shell-output trimming on repeat verbose commands (logs, status). Do not truncate diffs, evidence, failed tests, image details; don't install until repeated terminal output is measured as material cost.
- [Headroom](https://github.com/headroomlabs-ai/headroom): proxy/compression potentially hides signal and can add retrieve turns. **Not enabled**. No auto-instrumentation.

### Execute one page per Codex task
1. `python tools/yeon_ref.py YEON_LOCKED_DESIGN_CODEX_HANDOFF.zip labs out/refs` (swap page: home/labs/papers/methods/compare/constellation). Only view that selected reference.
2. Use targeted `rg -n` and open specific files—not the whole repository. Fix 3–5 most visible differences; keep all existing interactions.
3. Run focused functional test; screenshot same-size desktop and mobile. Compare using `.agents/skills/yeon-visual-fidelity/scripts/visual_compare.py`. Never substitute image similarity for human visual review.
4. Save `YEON_PROGRESS.md`: page; PNG; edited paths; tests; screenshot links; 3 remaining issues. Resume from that file, not a chat recap.
5. Response ≤ 8 lines unless user requests details. No screenshots in long log text; reference file paths.

### Guardrails
Open Doors frozen. Methods primary image is a **candidate requiring verification**; Radar not yet definitively locked. Never hallucinate actual lab openings, affiliations or quantitative ecosystem stats. Code/asset correctness, visual fidelity, accessibility, provenance and exact error output outrank token budget. Do not report invented percentage savings.
