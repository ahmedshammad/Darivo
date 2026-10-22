# Elena Rossi · Stage 2 second review

This is a **simulated self-audit**, not a client interview or independent external approval. The reviewer authored Arrival and earlier preferences. Findings are tied to visible artifacts and recorded behavior; this review cannot certify native Gulf Arabic, physical-phone behavior or screen-reader quality. The failed first round remains unchanged in [v1](../v1/).

Scores judge **Stage 2 Arrival and Living Map**, including spatial comparison, layers, stories, fallback and mobile sheet behavior. Full concierge reasoning, real school suitability, payment-plan comparison, project pages and private-office workflows belong to later stages. Their absence is not counted as a current implementation failure.

## Evidence and limits

- The latest [v3 matrix](../media/v3/manifest.json) covers **24 configurations** across Home/Explore, EN/AR, dark/light and 390/1024/1440. It records zero axe violations, page errors or document overflow. Map-ready timestamps range 480–2,869 ms; these are not LCP measurements.
- [Eight fallback captures](../media/v3/fallback-manifest.json) cover 375/390, EN/AR and both themes, also with zero recorded axe violations, errors or overflow. The Arabic tablet helper is now clear of source disclosure, and the duplicate fallback notice is gone.
- The full matrix was reviewed through representative actual images: `arrival-en-dark-1440-viewport.png`, `arrival-ar-light-1024-viewport.png`, `explore-en-light-1024.png`, `explore-ar-dark-1440.png`, `explore-ar-light-390.png`, both 375px fallback themes/languages, and the EN/AR signature comparison, evidence and layers states. The files are in [media/v3](../media/v3/). The two final signature `.webm` files are retained there; this second review does not claim independent frame-by-frame playback. Motion evidence below comes from measured renderer intervals, not inferred video smoothness.
- The [Arrival numeral/wordmark probe](../media/arrival-v2/checks.json) verifies EN/AR × Latin/Arabic-Indic at 390px: correct prompt/collection years and counters, no broken words and no horizontal overflow. The repaired developer images were opened during the repair check.
- After the parent reported **26 passing full browser regressions**, a necessary missing comparison was independently exercised on production port 3001 at 1440 and 390. [Fresh cross-market observations](../media/v3/karim-cross-market/checks.json) and the three corresponding screenshots preserve both the desktop repair and the remaining mobile failure. No UI code was edited during this review. The browser was closed and released afterward.
- [Production performance v4](../performance/v4/README.md): Home **97**, Explore **90**; LCP **2,340.72 / 2,934.83 ms**, TBT **126 / 237 ms**, CLS **0 / 0**. The separate **LCP <2.0 s target remains unmet**. TBT is not INP. Three-second moving-render samples on **Apple M3 Metal/headless Chrome** have medians 16.5–16.7 ms and p95 17.5–19.7 ms; there were no moving intervals over 33.34 ms in the four samples. This supports near-60Hz in those samples, not sustained 60fps on an M1 or mid-range physical phone. INP and field performance are not established.

Source records are checked against the supplied dataset, not independently verified current market truth. Zero axe findings and passing browser tests are not full WCAG certification. The exact scores below are not rounded up to meet the gate.

“The map is easier to read, and the controls no longer fight the comparison card. I would still want the mobile map to keep every selected place in view.”

## Observed recheck

1. Re-inspected English light Atlas at 1024 and Arabic mobile/desktop counterparts for visible map teaching and control placement.
2. Checked `signature-en-layers.png`: Schools is visibly selected and Demo/approximation disclosures remain legible inside the tools panel.
3. Checked both signature comparison states: the comparison is part of the sheet, with a visible “Show connections on the map” action rather than the former obstructing floating panel.
4. Checked 375px fallback: real regional geography and one clear limitation message remain available when street/3D detail is absent.
5. Incorporated the fresh phone comparison failure. Revised stop-specific story prose is present in `messages/explore.ts`, but no new independent story walkthrough was performed in this review; that source change alone is not claimed as a fully verified teaching journey.

## Scorecard

| Criterion            |      Score | Evidence                                                                                                                                                    |
| -------------------- | ---------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |          9 | The clearer, faster globe and readable light Atlas provide a strong first orientation.                                                                      |
| Originality          |          9 | The conversational globe-to-city transition retains a distinctive spatial identity.                                                                         |
| AI-first             |          9 | Typed place/layer requests drive the screen and retain original words; the interface discloses that school suitability is not verified.                     |
| Map experience       |        8.5 | The school controls, reach tools and repaired local context support orientation, but the mobile cross-market comparison is still geographically incomplete. |
| Visual craft         |          9 | The tablet helper, fallback message and developer wrapping are repaired; mobile comparison/evidence now uses the sheet coherently.                          |
| Motion quality       |          9 | M3 render-event samples are near 60Hz and reduced-motion handling remains explicit, without claiming phone certification.                                   |
| Arabic & RTL         |          9 | Arabic layouts and ordinary evidence vocabulary are coherent in supplied captures; my persona cannot certify native Arabic quality.                         |
| Trust & evidence     |        9.5 | School/lifestyle points are labelled Demo, reach is an illustrative radius, and cross-country lines no longer imply driving routes.                         |
| Discretion & privacy |          9 | The experience avoids pressure and keeps enquiries reviewable before any send.                                                                              |
| Developer appeal     |          9 | The place/evidence treatment supports developer credibility without needing fabricated renders or inventory claims.                                         |
| Speed                |          8 | Lighthouse score recovery is real; LCP 2.34/2.93s still misses the target and INP is unestablished.                                                         |
| Accessibility        |          9 | Keyboard/source/sheet checks and the zero-axe matrix support usability, while the mobile map action still fails functionally despite being operable.        |
| **Mean**             | **8.9167** | Gate: average ≥9.0 and no criterion <8.                                                                                                                     |

## Three delights

1. “The disclosures teach me how to read the map.” Demo lifestyle points, price symbols and approximate travel areas are qualified rather than silently presented as ground truth.

2. “The screen is calmer when I inspect something.” Comparison and evidence now live in the sheet with clear map controls.

3. “A connection failure does not leave an empty screen.” The 375px regional fallback gives useful geography and honest limits.

## Three problems / limits

1. **Current blocker — some mobile selections still leave the picture.** The reproduced June–Orla map action does not frame Dubai. Fix the camera after the sheet/padding change and demonstrate both endpoints; this is relevant to any teaching map.

2. **Performance is improved, not finished.** The current production LCP results still exceed the two-second brief, and the M3 sample does not certify a mid-range phone.

3. **Teaching depth needs continued validation.** The revised story prose is more specific in source, but the new story sequence was not independently walked through here. Actual British-school suitability remains future sourced-data/concierge work, not something the Demo school markers can establish.

## Verdict

“The repaired design is easier to use, but I would hold the stage while mobile framing and the measured startup budget remain open.”

**Does not pass the Stage 2 score gate:** mean 8.9167; minimum 8. The new mobile comparison blocker is preserved, not erased by the successful desktop repair. These are bounded simulated scores, not a claim of universal production readiness. Re-review the repaired behavior with new evidence; preserve both failed rounds.
