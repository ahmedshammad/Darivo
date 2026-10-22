# Concept C · Noir Atlas (originally Glass Atlas)

Static Stage 0 Home and Living Atlas concept. Serve from the repository root (the studio preview uses port 6006), then open `/prototypes/concept-c/`. This does not alter the production application.

- `?lang=en|ar&theme=dark|light&view=home|map` selects a capture state.
- `#home-view` and `#map-view` switch the two views.
- `#intent` is the conversation input. Typing Dubai, Saadiyat or North Coast (including Arabic equivalents) moves the actual geographic camera. Submit `#ask-form` to show the simulated response and Brief.
- `[data-prompt=coast]` demonstrates the North Coast flow; `[data-prompt=teach]` demonstrates Dubai orientation.
- `[data-place]` selects a market; `[data-project]` selects one of three fictional concepts and moves the camera to an approximate illustrative location.
- `#edit-brief` returns focus to the request. `#voice` explicitly explains that voice input is not implemented in the static concept.
- Language and theme controls preserve the selected view. Reduced motion removes camera animation and entrance motion.

The map imports the shared MapLibre module and actual OpenFreeMap geography; it requires network tiles. Recommendation cards are fictional demo concepts. The separate reference spotlight displays supplied real-project facts with source, date and basis; those projects have no connection to the fictional cards. Live inventory, production agent behavior, private storage or production feature completion is not implied. The mobile reply expands to reveal its content. The prototype uses local licensed fonts and no developer imagery.

The shared map's browser inspection handle is `window.__map`.

Initial visual QA used Chrome at 1440×1000 and 390×844. Keyboard submission moved the camera to North Coast, updated the Brief, and the edit action correctly focused the input; mobile horizontal overflow was zero. Official Stage 0 screenshots, recordings and persona reviews are maintained by the studio under `docs/reviews/stage-0/`.

## Home concept revision v2

The comparative review found the initial left-aligned editorial Home too close to Concept A. V1 is retained in `reviews/home-v1.png`. V2 uses a centered actual globe (`setProjection({type:'globe'})`, center 42°E / 27°N, zoom 2.4), a restrained centered headline and two glass regional context plates. `reviews/home-v2.png` records that direction. Entering Explore changes the projection to Mercator and flies to the selected market; the response journal is preserved. Verified in Chrome: Gulf region plate → Explore, Mercator projection, Dubai center 55.16 / 25.10; mobile overflow remains zero. Official final screenshots should capture the latest attribution spacing fix.

## Selected direction refinement v3 · Noir Atlas

The concept selection in `docs/studio/stage-0/concept-selection.md` selected C's spatial structure for refinement, not production implementation or a passed stage. V2 issues and changes:

- Teal glass styling became Noir/Ink/Graphite and Sand/Ivory, with restrained accessible bronze text shades. The geographic map is recoloured with the same palette.
- Arrival map labels competed with the heading. Home hides base-map symbols, retains the selected community anchors, and restores the original symbol visibility in Explore.
- Arabic editorial text now uses the licensed Amiri display subset from the shared font directory, preloaded only for Arabic. UI stays IBM Plex Sans Arabic. Italics are disabled in Arabic; mobile headings were visually checked for clipping.
- Mobile response cards hid the chosen place. A keyboard-operated `#sheet-toggle` uses `aria-expanded` and opens a scrollable reply. The Brief remains visible. Map padding is computed from visible panels and sheet bounds, including RTL desktop placement. Reduced-motion camera duration is zero; other camera moves are 600 ms. Checked at 390×844: after the expanded-sheet camera update, the requested position projected to y321 with sheet top y390.
- Every mobile market remains available, including North Coast. The three fictional concepts now have different rationales and explicit trade-offs. School requests update the Brief to “Schools to verify” and explain the evidence gap instead of claiming proximity.
- A separate `#source-reference` dialog loads the supplied reference JSON, choosing ORLA for UAE context and SouthMED for North Coast. The displayed price comes directly from the record, with its original date granularity, basis, original source links, indicative warning, approximate coordinates and on-request availability. The dialog makes clear that the demo concepts do not belong to these real projects. Numeric dates and coordinates are bidi-isolated. No facts are substituted on fetch failure.
- Attribution now occupies its own row above the footer and below the composer, at readable mobile text size. Voice remains an honest informational control in this static prototype.

Verified checks: EN/AR light Explore at 390×844 had no axe WCAG 2/2.1 AA violations; source dialogs also had none. Mobile horizontal overflow was zero. Keyboard sheet and Brief editing work. ORLA loaded AED57,300,000 / 2026-06 / agent listing. SouthMED loaded EGP91,200,000 / 2026 / press report. Elena's full British-school request retained a school-verification priority. These checks establish static-concept behavior, not production accessibility certification, verified school data, live inventory or a full AI agent. Official v3 screenshots, motion/performance evidence and persona scores belong in the stage review folder.

## Targeted review repair v4

The v3 review exposed three concrete defects. First, geographic attribution was a child of the map beneath the decorative scrim. The actual MapLibre control container now lives directly under `body` in a pointer-transparent overlay at z-index 4; its controls remain interactive and retain their separated bottom row. This preserves the control's functionality while removing the dimming layer.

Second, Saadiyat incorrectly opened a Dubai reference. Context now selects three distinct supplied dataset IDs: Dubai → `orla-palm-jumeirah`; North Coast → `southmed`; Saadiyat → `sei-saadiyat`. The reference template also distinguishes broker project-page basis from agent listings and press reports, and uses the appropriate apartment/villa label. Verified Saadiyat displays Sei Saadiyat, AED2,950,000, as-of2026-08, broker-project-page basis and its Luxhabitat source.

Third, single-location parsing lost explicit client intent. The static demonstration now retains all mentioned markets in textual order, including Palm as an alternative to Saadiyat, normalizes Arabic/Persian digits for a requested year, and records summer/family/investment purposes and an explicit discretion request. The camera starts with the first mentioned market. The original request is preserved verbatim in a keyboard-expandable “Your words, retained” disclosure. Multi-place replies explicitly say that this prototype has not compared real listings. Unexpressed priorities are “To clarify”; school requests remain “Schools to verify.” Initial state is explicitly labelled an illustrative Brief. No storage, privacy service or production agent is implied. Request completion uses a screen-reader status announcement instead of obscuring the reply with a generic toast.

Verified at390×844: Karim's mixed request retains `Summer home · Investment`, `North Coast · Dubai` and2028. Sheikha's Arabic request retains `Saadiyat · The Palm`, family, Arabic-digit2028 and discretion. Source control parent isBODY, stacking z-index4, horizontal overflow0. Official v4 captures and quality measurements should be regenerated after these changes; previous frame-time data is not claimed as uncontended evidence.
