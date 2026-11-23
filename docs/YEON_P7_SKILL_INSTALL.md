# YEON P7 — verified upstream skills (on-demand only)

This preparation branch adds **unchanged upstream text skills**, not third-party executable hooks, proxies or global configuration. Licenses are included alongside the skill files.

| Repo-local skill | Upstream | Trigger / scope |
|---|---|---|
| `.agents/skills/caveman/SKILL.md` | https://github.com/JuliusBrussee/caveman/tree/main/skills/caveman | **Only** concise progress/final reports; do not compress commands, code, failures or design evidence |
| `.agents/skills/ponytail/SKILL.md` | https://github.com/DietrichGebert/ponytail/tree/main/skills/ponytail | Implement P7 with minimal **complete** changes, never skip an approved effect or quality gate |
| `.agents/skills/verify-and-stop/SKILL.md` | https://github.com/JuliusBrussee/caveman/tree/main/skills/verify-and-stop | Verification: avoid redundant re-runs after enough evidence is collected |
| `.agents/skills/surgical-patch/SKILL.md` | https://github.com/JuliusBrussee/caveman/tree/main/skills/surgical-patch | Repair focused UI/GLSL bugs without broad refactors |

**Existing:** YEON visual fidelity and screenshot comparison scripts; Playwright already installed in the Work session. Do not reinstall them if verified.

## Activation plan

1. Start from **this skill-prep branch**, itself based on latest P2–P6. Create a new P7 implementation branch from it, not from production main.
2. Load `yeon-visual-fidelity` plus *one locked homepage PNG*. Apply Ponytail principles during implementation, unless they conflict with all six approved effects or complete QA; those requirements win.
3. Invoke Caveman for a verbose progress report **only**, not for implementation or visual-review analysis. Its session-persistent terseness may be undesirable during detailed debugging, so activate only deliberately and restore normal mode for technical reviews.
4. Invoke `surgical-patch` when a localized regression is identified; `verify-and-stop` for final gate assessment. Do not load all skills together.
5. Use scoped file reads, focused tests, and one concise `YEON_PROGRESS.md` checkpoint. Report exact failures; preserve evidence on all four viewports.
6. **No RTK/Serena/Headroom/compression proxies installed.** Installation requires measurement/approval; hidden command rewriting or compression can conceal important failed checks.

## Quality contract
- Implement **all six** locked P7 effects, not a subset.
- Keep locked P1 composition and P2–P6 interactions; Open Doors frozen.
- Run WebGL animation recording, Playwright/axe, reduced motion/fallback, all-width screenshots, FPS/performance measurements.
- Never substitute unverified token-saving percentages for measured usage.
- Review third-party skill text before use. No automatic external installer or hook was executed here.

## Source attribution
Original source files are copied byte-for-byte from official GitHub repositories. License text is preserved in each skill folder. This branch contains no 3D implementation code.
