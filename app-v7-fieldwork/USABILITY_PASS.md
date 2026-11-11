# YEON V7 — User-Friendly Research Explorer

**Scope:** Only the section directly below the home hero. The hero, navigation, other research pages, saved notes and data fixtures remain unchanged.

## The problem we solved

The previous research trails used four differently sized expandable cards. Selecting a question resized the entire row, moved nearby content and revealed extra controls inside the card. It looked interactive, but the action was not immediately understandable.

## Before vs. after

| Area | Before | New behavior |
| --- | --- | --- |
| First impression | Four large competing research stories | Four short **plain-language topic choices**, with a single clearly selected example |
| User action | Click one card, watch other cards change width | **Pick a topic**; one dedicated preview updates instantly |
| Reading | Question, method, limitation and button distributed within expanding cards | One clear reading order: **question → explanation → approach → limitation → read full story** |
| Navigation | Read CTA tucked inside a selected card | One prominent **Read the full research story** button in a consistent location |
| Mobile | Stacked accordions expand and change the height/position of surrounding content | **2×2 compact choices** followed by one full-width preview, no jumping or nested expansion |
| Keyboard | Arrow-key selection, plus card position changes | Same arrow-key selection, unchanged layout, visible focused choice |
| Motion | Width-changing grid transition | Short color/selection feedback only, no frequent movement |
| Colors and type | Shared Fieldwork system | Exactly the same marine/chalk/sea-glass/coral/Manrope system |

## Three-step use case

1. **Choose** one of the four short topics.
2. **Preview** its complete research question, one approach and one reason for uncertainty.
3. **Read** the full dossier, or switch topics without navigating away.

A separate **Browse all eight examples** link remains available. The four selections and their preview are still generated from the existing **fictional** research fixtures; no real academic profiles are implied.

## Skills applied, not just named

- **Anthropic frontend-design:** focus the content on an actual research question, rather than design-only visuals.
- **Emil Kowalski design engineering:** no motion during frequent switching; selection state is clear and responsive.
- **UI/UX Pro Max:** clear control affordance, one primary action, touch-friendly controls and stable mobile hierarchy.
- **AgentsORG design engineering:** remove unnecessary components; don't use animation or complex cards to compensate for unclear UX.

## Verification gate

- Existing 7-viewport Chromium browser suite (320, 390, 768, 840, 1024, 1280, 1440) exercises search, dossier, compare, notes, keyboard navigation, mobile menu, exports and the new topic chooser.
- Existing design-consistency suite checks computed palette/typography invariants and 10 research routes.
- Review captured desktop and mobile screenshots for readability, visual focus and horizontal overflow.
- Do not call a redesign aesthetically approved solely because checks pass.
- Preserve the previous deployment until the new version is validated.
