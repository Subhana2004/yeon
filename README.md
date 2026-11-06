# YEON

**Research has a bigger picture.**

YEON is an independent Korean research-discovery initiative by **Syeda Subhana**. This repository currently contains a **single landing page**, not a working research platform.

## Live site (after GitHub Pages is enabled)
https://subhana2004.github.io/yeon/

## Current scope

The landing page introduces seven planned capabilities:

1. **Lab DNA** — evidence-backed histories and research directions.
2. **Lab Compare** — compare labs by their actual documented work.
3. **Radar** — follow labs, professors, and topics for new publicly indexed research.
4. **Constellation** — source-backed research connections.
5. **Open Doors** — publicly advertised lab opportunities with verification dates.
6. **Fit Lens** — explainable overlaps between interests and published work.
7. **Research Face-Off** — compare scientific methods addressing similar questions.

**Important:** No live lab database, recruitment matching, affiliation verification, or research feeds are implemented in this landing-page release. The interactive constellation in the hero is explicitly illustrative, not real researcher data.

## Tech

Zero-build, dependency-free static site:
- Semantic HTML, modern CSS, minimal vanilla JavaScript
- Interactive, keyboard-focusable concept constellation
- Reduced-motion support
- Responsive layout
- Progressive enhancement for scroll reveals

The two externally served Google Font families are optional; fallback fonts are defined in CSS.

## Deploy to GitHub Pages

1. In this repository open **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` publishes from `main` on future pushes. If needed, open **Actions → Publish YEON landing page → Run workflow** for the first deployment.
4. Check the environment's deployment result before sharing the URL.

The workflow requires GitHub Pages to be enabled in the repository settings once. The GitHub connector cannot toggle that setting.

## Development checks

- Open `index.html` locally in a browser.
- Test desktop and mobile viewport widths.
- Navigate with keyboard and inspect focus states.
- Test `prefers-reduced-motion: reduce`.
- Test the five interactive concept nodes.
- Run Lighthouse / accessibility testing after deployment.

## Integrity

The current site avoids invented research metrics, fabricated lab relationships, fictional publications, and false claims of verified partners. No official relationship with Korean universities is implied.

## Repository

https://github.com/Subhana2004/yeon
