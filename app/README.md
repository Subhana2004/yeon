# YEON App — frontend-only preview

The path `/yeon/app/` hosts the initial static research-workspace frontend. No backend, accounts or live data source is connected.

## Interactive sections
- Explore: search/filter eight **fictional** labs and open example profiles.
- Lab DNA: illustrative research timelines and publication cards.
- Lab Compare: side-by-side selectable lab profiles.
- Constellation: clickable conceptual network; edges are **not** real collaborations.
- Radar: sample follow/unfollow and in-session demonstration feed.
- Open Doors: fictional opportunity status filtering; **no real vacancies**.
- Fit Lens: topic overlap demonstration; **not admission odds**.
- Research Face-Off: sample method comparison by research question.

## Data integrity
ALL labs, institutes, papers, updates, opportunities, graph edges and activity values are made-up samples for demonstrating the UI. Replace them with independently verified sources before representing this as a real Korean research directory.

## Deployment
Plain HTML/CSS/JS with no build process. The repository's existing GitHub Pages action deploys the `app/` directory at `https://subhana2004.github.io/yeon/app/`.

The existing landing pages remain unchanged.
