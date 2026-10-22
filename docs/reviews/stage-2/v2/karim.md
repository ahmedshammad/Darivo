# Karim Hassan · Stage 2 second review

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

“On desktop, the two coasts are finally in one picture. On my phone, the button still leaves me in Egypt.”

## Observed recheck

1. On current production `/en/explore?theme=light`, entered: “North Coast summer home ready by 2028, compare with a Dubai investment. Budget in GBP, pay in EGP.”
2. Selected **June** (`june-sodic`) and **Orla, Dorchester Collection** (`orla-palm-jumeirah`), both real-reference project records. June displayed EGP22,400,000 and Orla AED57,300,000 with their original source/date qualifiers.
3. At 1440px, waited for tiles ready and camera stopped: the map zoomed to 3.256/pitch0 and displayed both endpoints and the connecting line. The panel reads **2,746.7km · Distance only · not a driving route**; no minute estimate is rendered.
4. Repeated at 390px. The comparison panel retained the correct distance-only wording and original brief. Pressed **Show connections on the map**.
5. The sheet collapsed, but camera stayed **[28.02,31.1], zoom9, pitch48**. The screenshot shows the Egyptian coast and a line leaving the viewport; Dubai is not framed. Both runs had zero page errors/overflow. This is a definite remaining behavior defect, not a missing capture or inferred risk.

## Scorecard

| Criterion            |      Score | Evidence                                                                                                                                                                         |
| -------------------- | ---------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |          9 | The fast, composed globe is an inviting cross-market entrance; the distinct slow startup from v1 is substantially improved.                                                      |
| Originality          |          9 | The place-led editorial model remains differentiated from a listings grid.                                                                                                       |
| AI-first             |          9 | The complete North Coast/Dubai/2028/GBP/EGP request survives; location-only matching is clearly distinguished from unverified financial/timeline requirements.                   |
| Map experience       |        7.5 | Desktop fits June and Orla, but the same mobile selection/action leaves center [28.02,31.1], zoom9/pitch48 on North Coast. Dubai is offscreen.                                   |
| Visual craft         |          9 | Comparison is integrated into the conversation sheet and the sources are no longer covered by the old floating card.                                                             |
| Motion quality       |          9 | Near-60Hz measured M3 samples support camera quality; smooth movement does not cure the wrong mobile framing destination.                                                        |
| Arabic & RTL         |          9 | Inspected Arabic evidence and numeral preference states are improved; proper source names remain original where appropriate.                                                     |
| Trust & evidence     |        9.5 | June stays 22.4M EGP and Orla 57.3M AED. Their cross-market result is 2,746.7km, explicitly distance-only with no driving minutes.                                               |
| Discretion & privacy |          9 | No enquiry is sent merely by comparing; handoff is explicitly reviewable before sending.                                                                                         |
| Developer appeal     |          9 | Real project references now have cleaner presentation and evidence; intact developer names preserve their identity.                                                              |
| Speed                |          8 | Lighthouse97/90 is a substantial recovery, but both measured LCP values still miss the stated budget; INP and physical phones are not certified.                                 |
| Accessibility        |          9 | The map action and comparison heading are accessible controls; the action executes but its mobile camera outcome is incorrect. Zero axe does not detect that functional failure. |
| **Mean**             | **8.8333** | Gate: average ≥9.0 and no criterion <8.                                                                                                                                          |

## Three delights

1. “The original money remains honest.” The two source amounts keep EGP and AED; the brief keeps my GBP intent without pretending conversion has occurred.

2. “The desktop map now answers the spatial question.” Both selected coasts and their connection are visible.

3. “The absurd cross-country driving time is gone.” The result is explicitly distance-only, with a clear caveat.

## Three problems / limits

1. **P1 — mobile fit still fails.** The map action collapses the sheet but leaves North Coast zoom9 active. Fit selected bounds after the sheet transition, accounting for the final viewport padding, and verify that both geographic endpoints are actually visible. Evidence: `../media/v3/karim-cross-market/390-map.png` and `checks.json`.

2. **Unmet speed budget.** Explore LCP 2.93s and Home 2.34s remain above 2.0s. Preserve the current performance run rather than substituting the better earlier Explore sample.

3. **My financial decision still needs a later workflow.** This stage deliberately compares geography and original amounts, not FX-adjusted returns or payment plans. Keep that limitation explicit; it is not a demand to implement Stage 4 in this repair round.

## Verdict

“Desktop comparison is repaired, but the phone still fails the core cross-market action. I would not sign off this stage.”

**Does not pass the Stage 2 score gate:** mean 8.8333; minimum 7.5. The new mobile comparison blocker is preserved, not erased by the successful desktop repair. These are bounded simulated scores, not a claim of universal production readiness. Re-review the repaired behavior with new evidence; preserve both failed rounds.
