# Elena Rossi · Stage 2 v1

This is a **simulated persona review**, not a client interview, native Gulf Arabic sign-off, screen-reader certification or physical-device benchmark. This reviewer implemented Arrival and earlier preferences, so the review is not an independent external design audit; conclusions are tied to captured evidence. No production files were edited during review.

Scores judge **Stage 2 Arrival and Living Map**. Full conversational reasoning, financial comparison/payment plans, project stories and private-office workflows belong to later stages. Their absence is not scored as a Stage 2 implementation failure. Spatial comparison, sources, layers, stories and the mobile sheet are current-stage responsibilities.

The formal [manifest](../media/v1/manifest.json) contains **24 configurations**: EN/AR × dark/light × 390/1024/1440 × Home/Explore, with zero reported axe violations, page errors or document overflow. Directly opened screenshots include EN-dark Home/Explore at 1440, EN-light Explore at 1024, AR-light Home at 1024 and Explore at 390, AR-dark Home at 390, and the complete AR-light mobile Home. Zero overflow does not establish that floating controls do not cover one another.

Independent Chrome flows with reduced motion were exercised at 390×844 (Sheikha/Elena) and 1440×1000 (Karim). [client-interactions.json](client-interactions.json) records original briefs, actual displayed cards, camera state, source context, compare text, layer states and keyboard return focus. Both signature videos were sampled at explicit moments, documented in [video-observations.json](video-observations.json). The supplied signature harness subsequently failed: comparison overlays the sheet handle. The raw files remain failed-run evidence. The mobile Home recording `page@bd2c15346ad6d101d027ce108e5c07c2.webm` is 7.48 s: 1.00 s shows map preparation and 6.48 s shows the typed two-market camera state. `page@cb5e3c21c083d7784d7329767eb2cd7a.webm` is 18.12 s and 17.12 s still shows “Preparing your collection…”. These samples demonstrate state changes, not successful end-to-end navigation or 60 fps.

Manifest map readiness ranges from 706 to 14,948 ms in the local development run; this is **not LCP**, and it does not establish production performance. No physical phone, native Gulf reader, production INP/LCP or screen-reader session was certified. Source records match the supplied dataset; current market truth was not independently verified. No private listing leak was observed, but this was not the full Stage 4 security audit.

“I can see where Dubai is and turn schools on. I still need the map to explain why one neighbourhood would suit my family better than another.”

## Observed flow

1. Entered the family-with-two-children/British-school request on mobile English light Atlas.
2. Submitted and waited for settled tiles. The original request remained; the school layer was already pressed.
3. Collapsed the sheet, opened Map tools and toggled Schools: pressed state changed from true to false.
4. Selected 20 minutes. A reach area was enabled; the panel clearly described the fictional POIs and approximate 40 km/h radius without routing.
5. Pressed Escape: tools closed and focus returned to Map tools. Selected The Islands story: Palm Jumeirah appeared with stop 1/3 and manual-navigation reduced-motion copy.

## Scorecard

| Criterion            |    Score | Evidence                                                                                                                                                 |
| -------------------- | -------: | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |      8.5 | The globe and serif opening invite exploration, while first-run preparation delays the geographic reveal.                                                |
| Originality          |        9 | The conversation-to-geography premise feels unlike a conventional filter portal.                                                                         |
| AI-first             |        8 | The British-school family request enables Schools and preserves all words, without pretending that school type or family fit was verified.               |
| Map experience       |        8 | Layers, reach area and island story work, but story text says only “Three island settings along the Dubai coast” instead of distinguishing those places. |
| Visual craft         |      8.5 | Light map geometry is legible and the mobile sheet is polished; overlapping floating controls interrupt the composed hierarchy.                          |
| Motion quality       |      8.5 | Reduced motion disables story autoplay and offers manual stops; local camera responds without an invented movement claim.                                |
| Arabic & RTL         |        8 | Arabic screens were also inspected and retain direction/display craft, but known untranslated evidence prevents stronger endorsement.                    |
| Trust & evidence     |        9 | Fictional POIs, rough reach geometry and missing routing/traffic are prominently disclosed (`elena-02-tools.png`).                                       |
| Discretion & privacy |        9 | The request stays reviewable and no enquiry is sent automatically.                                                                                       |
| Developer appeal     |      8.5 | The place-led design gives projects context; stronger story-specific facts would make that context more persuasive.                                      |
| Speed                |        8 | Layer buttons respond locally; recorded map readiness and the failed end-to-end signature do not prove production budgets.                               |
| Accessibility        |        8 | Schools exposes pressed state; Escape closes tools and restores its trigger. Overlay collisions and no screen-reader certification limit the score.      |
| **Mean**             | **8.42** | Stage 2 gate requires ≥9.0 and every score ≥8.                                                                                                           |

## Three delights

1. “The map reacts to the thing I asked about.” Schools is enabled by the request and its toggle state is accessible and reversible.

2. “You tell me when a map is illustrative.” Fictional lifestyle points and rough reach areas are labelled in the controls, not left for me to infer.

3. “I can explore at my pace.” The Islands story presents manual stops under reduced motion and the tools return keyboard focus correctly.

## Three problems

1. **P2 — make map stories teach a distinction.** Palm Jumeirah shows the same generic coastal sentence used for the island story. Add concise, source-backed stop-specific context and an honest practical trade-off; do not invent a British-school recommendation. Evidence: `elena-03-story.png`.

2. **P2 — keep geographic content usable around panels.** Open tools largely occupies the mobile map and covers source disclosure; expanded sheet states also collide with controls. Use deliberate panel exclusivity, smaller control groups or reserved disclosure space. Evidence: `elena-02-tools.png` and Sheikha expanded state.

3. **P2 — complete the signature journey after the overlay repair.** The raw navigation recording ends in “Preparing your collection…” and the parent reports the comparison/sheet-handle failure. Re-record successful mobile map → evidence → comparison with usable controls before advancing.

## Verdict

“I would continue exploring, but the map needs a clearer lesson and cleaner panel choreography before approval.”

**Does not pass:** mean 8.42; minimum 8. Preserve this v1 evidence and re-review fresh repaired captures. No score has been raised to satisfy the gate.
