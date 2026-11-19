# YEON Research Index

Open `/app-index/` on any static HTTP server serving the repository. For local review, run `python -m http.server 8000` in the repository root and open `http://localhost:8000/app-index/`. ES modules require HTTP. There is no application install, build, subscription, or API key.

## Audit and implementation decisions

The rebuild started from main at `2b64829a8e8d61ccc5cd49679031cc8124530295`. V4 brings eight legible fictional research identities, editable interests, keyboard-operated archive selection and a browser regression suite. Its roughly 151 KB single HTML file combines fixtures, styles, view templates and event handling. The separate 21 KB archive stylesheet uses high-specificity overrides. Finesse repeats most of the reader in another 154 KB page. V3 separates its script but represents an earlier interface. The original landing page supplies the central editorial premise.

On a 390 px viewport, the original navigation shows part of the tool set and the first screen prioritizes the introductory field note. The original smoke suite passed all six widths, including its document overflow assertion. The larger issue was wayfinding. The old view dispatcher keeps tool and search context in memory, its Face-Off compares a fixed pair, and the evidence boundaries of a relation are difficult to inspect independently.

The new route keeps the eight records and recognizes legacy locally followed lab IDs. A navigable dossier replaces the embedded archive preview. Hash routes encode filters, selections and graph focus so that a dossier, comparison or evidence note can be reopened directly. V4 and the earlier experiments remain available in their original directories. Production Vercel routing and the Pages deployment workflow are outside this change.

## The Index design system

| Element | Decision |
| --- | --- |
| Surfaces | Porcelain `#F4F6FA` for the page, white for records, deep navy `#121F37` for scientific illustrations |
| Text and signals | Ink `#172338`, secondary text `#506078`, interactive cobalt `#294FB7`, restrained amber `#F1B75B` on dark plates |
| Type | Local Instrument Serif for editorial titles and questions. DM Sans handles navigation, controls, body copy and graph labels. OFL licenses live beside the fonts. |
| Scale | Body 16 px, secondary metadata 13 px, field captions 12 px, section titles 34–52 px, page titles 50–84 px. Headlines use fluid sizing. |
| Rhythm | 8, 16, 24, 32 and 48 px spacing steps with fluid outer gutters. Content has a 1560 px outer maximum. |
| Controls | Native selects and checkboxes, 44 px primary controls, visible outline on keyboard focus, consistent link names and selected states |
| Grids | A two-column laboratory index, a reading column with marginal notes, and a comparison matrix grouped by question. Narrow layouts repeat side labels beside each comparison value. |
| Evidence | Source and record type appear beside titles. Expandable method notes carry assumptions and limitations. Each primary reading has a source link and a checked date. |
| Graph | Show the selected node and its immediate neighbors. Plain-language relations identify each edge. Filter by type or relation, inspect or re-centre, switch to a list, or pan and zoom the map. Small screens start in list view. |
| Motion | Short hover transitions on controls. Graph motion follows pointer input. Reduced-motion settings remove transitions. |

The folded wire surface on the opening method plate is an original mathematical illustration. It introduces the idea of a representation space without suggesting measured data.

## Feature and evidence guide

| View | What a reader can do |
| --- | --- |
| Lab DNA | Inspect a question, three narrative chapters, two methodological assumptions, sample works, independent readings, missing researcher information and shared-topic neighbors. |
| Lab Compare | Select two different labs, inspect shared labels, compare methods, directions and gaps, then open either source dossier. |
| Radar | Search and follow labs, fields or techniques. Review personal selections or sample chapter updates. |
| Constellation | Select a field, method, lab or paper, inspect the asserted connection and its provenance, then follow it into the reader. |
| Open Doors | Filter by area, institution, position, eligibility and availability. Inspect a fictional notice or the verified collection. |
| Fit Lens | Choose interests and techniques, inspect exact overlaps and possible reading directions, save selections and continue to opportunities. |
| Research Face-Off | Compare lexical, dense and late-interaction retrieval or two forms of contrastive representation learning. Inspect assumptions, failure conditions and evaluation requirements. |

`data/fixtures.js` preserves the original demonstration content. `data/catalog.js` defines lab records, primary readings, editorial adjacencies and approach comparisons. `data/opportunities.js` selects public records with a source and verification date and derives expiry from the deadline. A public metadata record has its own URL and checked date. An editorial suggestion carries a relationship description. An unknown value stays unknown.

A lab-to-paper reading suggestion is an editorial selection. Fictional labs have no verified researchers, publication authorship, collaborations or recruitment openings. The four independent papers link to author manuscripts or the ACL Anthology. Research trajectory chapters have narrative order only. Fit Lens counts shared labels. It does not assess proficiency, admission likelihood or scientific quality. Radar stores follows in this browser and has no monitoring or notification service. An isolated preview on another origin has its own browser storage.

## Review

The feature modules live under `views/`. `ui.js` supplies common controls, route serialization and browser-local persistence. `app.js` handles navigation and delegated events. The review needs only a static file host. Keep links relative so that both Pages subpaths and a standalone preview root resolve.

[Browser checks, measurements and screenshot comparisons](../docs/index-reader/QA.md)
