# YEON — Codex working rules
Locked design PNGs take priority over new concepts. Use the repo skill `.agents/skills/yeon-visual-fidelity/SKILL.md` only for visual reconstruction. Open Doors frozen; production `main` untouched.

## Token budget
- One page and one locked reference per task; don't dump the whole ZIP, repository, logs, or prior chats.
- Read only changed modules and exact matching lines (`rg -n`, scoped `sed`, `git diff --stat`; full diff only for changed files).
- First reuse existing code and native browser capabilities; no framework migration, needless abstractions, generated boilerplate or broad refactor (Ponytail/YAGNI principle).
- Keep responses concise (Caveman-lite principle): **changed; tested; remaining gaps**. No running narration or reprinted brief.
- After each page, update `YEON_PROGRESS.md` with only page/reference, changed files, tests/screenshots, top 3 remaining gaps. New session reads it, not history.
- Use `python tools/yeon_ref.py ZIP PAGE OUTPUT_DIR` to extract only that page's PNG for comparison.

Do **not** compress or omit: reference image details, code diffs, failing test errors, security or accessibility findings, data provenance, and unverified claims. Do not claim fidelity from compilation alone. No merge without user approval.
