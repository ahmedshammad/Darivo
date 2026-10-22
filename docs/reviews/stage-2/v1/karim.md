# Karim Hassan · Stage 2 v1

This is a **simulated persona review**, not a client interview, native Gulf Arabic sign-off, screen-reader certification or physical-device benchmark. This reviewer implemented Arrival and earlier preferences, so the review is not an independent external design audit; conclusions are tied to captured evidence. No production files were edited during review.

Scores judge **Stage 2 Arrival and Living Map**. Full conversational reasoning, financial comparison/payment plans, project stories and private-office workflows belong to later stages. Their absence is not scored as a Stage 2 implementation failure. Spatial comparison, sources, layers, stories and the mobile sheet are current-stage responsibilities.

The formal [manifest](../media/v1/manifest.json) contains **24 configurations**: EN/AR × dark/light × 390/1024/1440 × Home/Explore, with zero reported axe violations, page errors or document overflow. Directly opened screenshots include EN-dark Home/Explore at 1440, EN-light Explore at 1024, AR-light Home at 1024 and Explore at 390, AR-dark Home at 390, and the complete AR-light mobile Home. Zero overflow does not establish that floating controls do not cover one another.

Independent Chrome flows with reduced motion were exercised at 390×844 (Sheikha/Elena) and 1440×1000 (Karim). [client-interactions.json](client-interactions.json) records original briefs, actual displayed cards, camera state, source context, compare text, layer states and keyboard return focus. Both signature videos were sampled at explicit moments, documented in [video-observations.json](video-observations.json). The supplied signature harness subsequently failed: comparison overlays the sheet handle. The raw files remain failed-run evidence. The mobile Home recording `page@bd2c15346ad6d101d027ce108e5c07c2.webm` is 7.48 s: 1.00 s shows map preparation and 6.48 s shows the typed two-market camera state. `page@cb5e3c21c083d7784d7329767eb2cd7a.webm` is 18.12 s and 17.12 s still shows “Preparing your collection…”. These samples demonstrate state changes, not successful end-to-end navigation or 60 fps.

Manifest map readiness ranges from 706 to 14,948 ms in the local development run; this is **not LCP**, and it does not establish production performance. No physical phone, native Gulf reader, production INP/LCP or screen-reader session was certified. Source records match the supplied dataset; current market truth was not independently verified. No private listing leak was observed, but this was not the full Stage 4 security audit.

“You have kept my two-market brief. Now show me the two places together, rather than giving me a huge journey time beside a map of only one coast.”

## Observed flow

1. Entered “North Coast summer home ready by 2028, compare with a Dubai investment. Budget in GBP, pay in EGP.” in desktop English Atlas.
2. Submitted and waited for settled tiles. All original words remained in the brief. The 12 visible cards contained both markets but were dominated by Dubai and demo entries.
3. Selected North Coast demo project 14 and Orla on Palm for map comparison.
4. Read the connection card: 2,640.1 km and approximately 3,960 minutes, with the straight-line/40 km/h disclaimer.
5. Captured the resulting map: it still framed the North Coast; both selected endpoints were not visible. The panel covered the source disclosure.

## Scorecard

| Criterion            |    Score | Evidence                                                                                                                                                  |
| -------------------- | -------: | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |      8.5 | The settled EN-dark globe is compelling; raw first-run video still shows preparation at one second.                                                       |
| Originality          |        9 | The geographic editorial approach feels differentiated and suitable for a cross-border portfolio.                                                         |
| AI-first             |        8 | North Coast, Dubai, 2028, GBP and EGP all survive in the original brief; non-location requirements are explicitly not verified filters.                   |
| Map experience       |        7 | Cross-market compare displays a distance card while the camera remains on North Coast, failing to show both endpoints (`karim-02-compare.png`).           |
| Visual craft         |      8.5 | Desktop composition is strong; compare covers source disclosure, and mobile developer words fragment in the formal matrix.                                |
| Motion quality       |      8.5 | Camera movement responds to intent; failed signature flow and no physical-device frame measure limit confidence.                                          |
| Arabic & RTL         |        8 | English is readable and Arabic direction is coherent in inspected states, but untranslated evidence values remain.                                        |
| Trust & evidence     |      8.5 | Source currency and dated basis are honest. The 2,640.1 km / ~3,960 min formula is disclosed, yet the cross-country time is not a useful travel estimate. |
| Discretion & privacy |        9 | There is no unsolicited enquiry or pressure to buy; public evidence is separated from private access.                                                     |
| Developer appeal     |        8 | Authentic reference records help credibility, but demo-first ordering and the broken wordmark wall weaken the first sales impression.                     |
| Speed                |        8 | Local controls work promptly; map readiness outliers and incomplete signature navigation prevent a stronger speed claim.                                  |
| Accessibility        |        8 | Project controls are operable, but compare overlays map sources and the supplied harness confirms a sheet-handle obstruction.                             |
| **Mean**             | **8.25** | Stage 2 gate requires ≥9.0 and every score ≥8.                                                                                                            |

## Three delights

1. “You have not silently dropped my currencies or year.” The original request is fully retained and the screen admits those requirements are not verified filters.

2. “I can distinguish an actual reference from an invented residence.” Original source currency, reference/demo badges and source links reduce ambiguity.

3. “There is one visual language across Egypt and Dubai.” The map and editorial presentation support a credible cross-market direction.

## Three problems

1. **P1 — comparison must frame the selected places.** Fit both selected geographic endpoints after selection, retaining safe overlay padding. The current North Coast camera leaves Dubai off-screen and makes the comparison line impossible to understand. Evidence: `karim-02-compare.png`.

2. **P2 — suppress inappropriate cross-country minute estimates.** The stated 40 km/h straight-line formula is not hidden, but 3,960 minutes invites an irrelevant travel interpretation. Show distance plus an explicit cross-market comparison state; reserve illustrative local times for suitable distances. Evidence: same screenshot and JSON.

3. **P2 — protect map controls from comparison.** The floating comparison covers source disclosure; the supplied signature harness also failed because it covered the mobile sheet handle. Reflow or dock comparison with reserved space before rerunning the signature journey.

## Verdict

“The cross-market idea is strong, but map comparison does not yet do its central job.”

**Does not pass:** mean 8.25; minimum 7. Preserve this v1 evidence and re-review fresh repaired captures. No score has been raised to satisfy the gate.
