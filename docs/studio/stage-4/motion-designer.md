# Motion Designer — Project Story discovery

Motion connects selection, place and decision. It must not turn the eight-chapter Story into a mandatory animation. This is a plan using the accepted Noir Atlas motion vocabulary; no motion code or new measurement is included.

## Choreography

| Moment              | Intended behavior                                                                                                                                                                     | Reduced motion / interruption                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Card → Story        | Preserve exact title and source identity; a short shared-element transition may connect the selected cover to the story if the same authorized entity is available. Target 200–400ms. | Normal navigation and immediate focusable h1. No dependency on an API or screenshot transition completing. |
| Hero → Idea         | Native page scroll; desktop media stays sticky below the header while narrative advances. No parallax text, scroll lock or mandatory reveal.                                          | Same content and layout; no translation.                                                                   |
| Idea → Place        | If switching cover to initialized map, preserve dimensions/geographic center and use a restrained opacity transition. Target 200ms; never cover a blank map with a false ready state. | Immediate replacement when ready; named geography remains available during load/failure.                   |
| Explicit map choice | Existing LivingMap camera movement, usually 400–600ms, only for requested Overview/Local/layer/story actions.                                                                         | Duration zero. User input cancels automatic movement.                                                      |
| Numbers             | Milestones are readable on first render. No counting-up currency, animated yield or delayed sources.                                                                                  | Identical static ledger and timeline.                                                                      |
| Save / request      | Immediate pending feedback, then a quiet named receipt; maintain focus and provide the actual next action.                                                                            | Same feedback without spatial movement. No success check before the server confirms.                       |

Use `--ease-out`, `--motion-short/medium/long` and the existing 8px spacing/type scales. No spring bounce or endless ambient motion. Long Arabic names must not animate by individual glyphs; preserve joining, bidi and screen-reader text. Reading surfaces remain opaque throughout transitions.

## Scroll and accessibility

Use document scrolling and CSS sticky first. The brief requests Lenis on editorial pages, but adding a second scroll controller would repeat prior ancestor-scroll/focus problems unless proven useful. Proposal: evaluate Lenis only after the native flow is stable and with a recorded rationale; if it cannot preserve keyboard, focus, hash navigation, browser find and reduced motion, retain native scrolling and record that explicit deviation for parent approval. No silent library substitution or altered acceptance budget.

Scroll-linked visual emphasis may update a chapter indicator; it must not move focus, hide article content or make reading depend on an animation frame. Anchor targets use scroll margin for the header, and action-bar space is reserved. Native disclosure focus remains visible after expansion. On phone and short-height screens, sticky media becomes normal flow; no hard minimum height pushes controls offscreen.

## Validation plan

Record one uninterrupted seeded-client path from the initial Concierge prompt through map/story/portfolio/dossier/viewing request, with elapsed time visible and no removed network waits. The eight editorial chapters are optional reading, not an obstacle to the three-minute path. Separately demonstrate the reference-project enquiry branch and an authorization loss.

Measure actual map render cadence and browser RAF during Story navigation/camera actions on the retained build, using the bounded instrumentation already available. Retained [Stage 3 M3 motion evidence](../../reviews/stage-3/media/motion-v1/) is informative only: twelve windows and one interval above 33ms do not certify a new layout, physical phone or M1. Repeat cold-load Lighthouse without changing settings; initial geography, typography and useful actions remain present. Strict LCP below two seconds remains an open cross-stage requirement, not a reason to hide content behind choreography.
