# Actual skill repository checkouts — verified November 9, 2026

GitHub Actions runner used `git clone --depth 1`, successfully cloning all **12 of 12** repositories. The original local sandbox could not resolve `github.com`, so this was executed in a separate GitHub Actions runner. **The clones are ephemeral runner workspaces, not installed on the user's Windows computer.** Re-run `clone_skills.sh` on a networked machine to get local copies.

Run: https://github.com/Subhana2004/yeon/actions/runs/42649731565

| Repository | Short revision | Skill files | Result |
|---|---|---:|---|
| emilkowalski/skills | `715c1807e08c` | 18 | Cloned |
| anthropics/skills | `2c5958ecac7c` | 20 | Cloned |
| nextlevelbuilder/ui-ux-pro-max-skill | `4f2dbb67e649` | 13 | Cloned |
| hamen/material-3-skill | `14385f2bf380` | 1 | Cloned |
| multica-ai/andrej-karpathy-skills | `2c606141936f` | 1 | Cloned |
| delphi-ai/animate-skill | `71bc617e7000` | 1 | Cloned |
| kylezantos/design-motion-principles | `4a9ca879f24a` | 1 | Cloned |
| AgentsORG/design-engineering | `abe29dc5dba8` | 1 | Cloned |
| elayadesign/ai-design-skills | `456d9e0d3e2d` | 2 | Cloned |
| elayadesign/redesign-skill | `7df13f6a289f` | 1 | Cloned |
| vercel-labs/agent-skills | `1a2c79d4e6c4` | 9 | Cloned |
| Gabriel-Dalton/digital-accessibility-skill | `8e403000b396` | 1 | Cloned |

The SHA and file-count values come from the runner-generated `clone-manifest.tsv`, retained in the GitHub Actions artifact. They are **not invented version identifiers**.

## Catalog execution

The cloned UI/UX Pro Max `search.py` generated a Markdown design system. It recommended:

- **Swiss Modernism 2.0**: rational modular grids, asymmetry and restrained materiality.
- Academic navy `#1E3A5F`, slate secondary, pale paper, accent color with sufficient contrast.
- Academic typography pair `Crimson Pro + Atkinson Hyperlegible`.
- Design rules: no low contrast, excessive visual clutter, or motion-heavy chrome; visible focus; reduced motion; 375/768/1024/1440 review.

**Applied selectively**: the user explicitly rejected giant serif display and previous cloned aesthetics. The new Fieldwork direction uses one Manrope family (plus technical mono), a cool-paper/marine/coral palette, and an asymmetrical research instrument layout. The generator is an evidence-backed recommendation, not an obligation to copy its palette or impose another generic template.

The first catalog run's extra `--stack html` query was invalid; the supported stack name is `html-tailwind`. A follow-up workflow fixed this option.

The artifacts retain:
- `clone-manifest.tsv`, exact SHA and counts.
- `RESEARCH_DESIGN_SYSTEM.md`, generated design system.
- `TYPOGRAPHY_GUIDANCE.txt`, reading-type guidance.
- `ACCESSIBILITY_GUIDANCE.txt`, accessibility guidance.
- `WEB_STACK_GUIDANCE.txt`, corrected on the follow-up run.
- `catalog-errors.txt`, errors rather than hidden failures.

### Remaining limitations

Cloning in Actions does not automatically install these skills into the assistant environment or into the local project. It does establish real source access and a reproducible checkout history. The design still requires human acceptance and visual QA; no automated test can prove aesthetic quality. Do not misrepresent fictional sample labs as verified universities.
