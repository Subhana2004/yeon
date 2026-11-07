# YEON V4 — Research Reader design preview

This directory contains an alternative frontend experience for YEON, hosted independently at [the V4 preview](https://subhana2004.github.io/yeon/app-v4/).

## Compare two working Explore directions
- **Discover by interest**: choose a subject, browse labs, then investigate a question, method and limitation.
- **Investigate a lab**: put a selected dossier first and open the collection as a secondary action.

The Explore view includes functional research-field selection, sample labs, a three-part research reading lens, Lab DNA chapter switching and contextual navigation. The other six feature tools continue from V3's frontend. The design uses spacious editorial composition, calm surfaces and user-triggered feedback.

**All labs, institutions, papers, opportunities and relationships are fictional demonstration fixtures. There is no live research API or backend.**

## Skill/source provenance
The design was informed by manual inspection of upstream guidance in Anthropic Frontend Design, Impeccable, Jakub Krehel's Better Layout / Better UI, Emil Kowalski's Review Animations, and hueyexe UX Usability Foundations. Network/DNS restrictions prevented Git cloning and installation; no third-party skill scripts were executed or copied into this page. This is a design implementation informed by source review, not a claim that the upstream skill packs were installed.

## Testing
Local Chromium regression passed at widths 1440, 1024, 760, 390 and 320 px including Explore, mode switching, field filtering, reading lens, Lab DNA, comparison, Constellation, the remaining tools, dark theme, and no horizontal overflow. Test runner used font fallbacks (Google Fonts unavailable in the local sandbox). Public-site exact font rendering and Lighthouse measurements remain unverified.

## Tech
Single-file static HTML/CSS/JavaScript demo. No app dependencies, compatible with GitHub Pages. V3, V2, V1 and landing pages are not modified.
