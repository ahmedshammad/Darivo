# Concept B — Sand Editorial

An architectural journal opening into a personal atlas. Static concept only; no feature backend, real inventory, authentication or data transmission from the composer.

## Open

Serve the repository root, then visit `/prototypes/concept-b/?lang=en&theme=light&view=home`.

Parameters: `lang=en|ar`, `theme=light|dark`, `view=home|map`. Theme and language controls preserve the selected view. The prototype imports actual geographic cartography from `../shared/map.js`; it does not substitute an illustration for geography. Internet access is needed for map tiles.

## Signature flow

1. Enter “A summer home on the North Coast” in `#brief` and pause. The map moves to the Mediterranean.
2. Submit `#composer` with Enter or `.send`. The atlas opens with a deliberately short fictional selection.
3. Activate the first `.save`; `#save-count` becomes 1. No data leaves the page.
4. Activate `.focus-place` to move toward an approximate demo location.
5. On mobile, `#sheet-toggle` expands and collapses the recommendation sheet with `aria-expanded`.
6. Return home through `.wordmark`; collections and `[data-city]` controls offer other places.

Other selectors: `#locale-toggle`, `#theme-toggle`, `[data-view="map"]`, `[data-prompt="egypt"]`, `#saved-button` (desktop), `#voice`.

`window.__conceptReady` signals shared-map initialization completion, including a failure state. `window.__conceptMap` exposes the initialized MapLibre instance. Use `map.isStyleLoaded()` and map tiles state when screenshots need strict cartographic readiness.

## Local validation

2026-10-22: Chrome/Playwright verified 1440px English Home and 390px Arabic dark Map, with no horizontal overflow. Four axe checks passed with zero WCAG 2 A/AA and 2.1 AA violations: English light Home, English dark Map, Arabic light Home, Arabic dark Map. A typed North Coast intent selected “The Mediterranean coast”; saving the first demo home changed the count to 1. Full review screenshot matrix and performance/native-language evaluations belong to the parent Stage 0 review. These checks are not a conformance claim or persona score.

## Intentional constraints

Fictional projects and prices are explicitly badged Demo; no units or claims attach to real projects. Prices are not converted. Selection lives only in current page memory. Voice uses browser recognition only after explicit activation, with typing fallback. The browser's own speech service may process audio; this must be explained before any production voice flow. The existing Arabic font is Plex; a dedicated Arabic editorial face remains a production design requirement. No simulated model response is represented as actual AI reasoning.
