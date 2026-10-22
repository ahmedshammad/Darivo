# Elena Rossi — Stage 3 fourth review

**Simulated contributor review, not a client interview, independent audit or native-language endorsement.** I contributed the Concierge interface, Brief, source presentation and map integration. I inspected current EN/AR desktop, tablet and phone stills in both themes, signature checkpoints, financial supplements and final phone qualification captures. Main `media/v7` and currency evidence use `219204a`; the targeted qualification evidence and latest Lighthouse use final `0b304f7`/build v12. Six recordings are retained; I did not continuously replay them or run another browser. Previous reviews remain unchanged.

> “The phone now gives me three places to explore immediately. I understand what is known, but this is still an orientation conversation rather than a verified school-led recommendation.”

## Journey inspected

1. **Orient — clearer:** [English phone](../media/v7/elena-en-dark-390.png) puts Palm Jumeirah, Dubai Hills and Downtown Dubai above the diagram. In the [final Arabic phone](../media/v7-poi-final/elena-ar-light-390-webgl-expanded.png), all three names, the approximation label and the school-suitability caution fit before the composer. This resolves the earlier first-answer hierarchy problem.
2. **Explore — qualified:** The same final capture keeps the Demo/unverified amenities notice in the exposed map strip. [English collapsed fallback](../media/v7-poi-final/elena-en-light-375-fallback-collapsed.png) retains that qualification beside the geographic fallback and sources. Simpler school labels no longer lose their fictional status behind the sheet.
3. **Refine — deliberate:** [Arabic no-match](../media/v7/sheikha-ar-no-match.png) offers review without silently changing the request. The [refined phone card](../media/v7/sheikha-refined-ar-light-390.png) puts the unverified beachfront caveat beside the main facts. It does not turn a relaxed evidence condition into a verified feature.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                                                                              |
| -------------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | Recognisable geography, restrained display typography and the first named response form a coherent private-office introduction.                                                                                       |
| Originality          |     9 | Conversation, editable Brief and one shared map remain a distinctive working surface rather than a disguised listing grid.                                                                                            |
| AI-first             |     9 | Named teaching actions arrive earlier, follow-up currency intent remains editable, and no-match recovery leaves the decision with the user. Actual school suitability remains unverified.                             |
| Map experience       |     9 | Current desktop/tablet geography and final phone map/qualification captures support useful spatial orientation with less repetitive label clutter.                                                                    |
| Visual craft         |     9 | Names precede the large preview; caveats sit beside decisions; secondary arithmetic and original wording remain available without dominating the answer.                                                              |
| Motion quality       |     9 | [Motion evidence](../media/motion-v1/) records 418 moving intervals across twelve M3 windows: medians 16.5–16.9 ms, one 33.5 ms interval, none above 50 ms. This is bounded evidence, not a physical-phone guarantee. |
| Arabic & RTL         |     9 | The final Arabic phone hierarchy is readable; faithful source display terms and optional original wording reduce mixed-language density. Native Gulf editorial and speech validation remain open.                     |
| Trust & evidence     |   9.5 | Source uncertainty, approximate locations, fictional amenities and unverified features remain explicit after the reading simplification and final mobile repair.                                                      |
| Discretion & privacy |     9 | Useful guest reading, explicit proposal review and a visible private-access boundary avoid implying that contact or saving has already occurred.                                                                      |
| Developer appeal     |   8.5 | Project identity and provenance are treated carefully, but this family journey still supplies orientation rather than a commercially verified school/property fit.                                                    |
| Speed                |   8.5 | [Final Lighthouse](../validation/lighthouse-presentation-v12.json): performance 99, LCP 2183.545 ms, TBT 61.5 ms, CLS 0. The strict two-second LCP budget remains missed.                                             |
| Accessibility        |     9 | Sixty clean main states, sixty-four targeted phone states and focused reading/currency regressions support reachable controls and stable framing. Full assistive-technology certification is absent.                  |

**Mean 8.9583; minimum 8.5.** The mean threshold applies to the board aggregate, not each persona. This score does not waive the separate loading requirement.

## Three delights

1. I can choose a named neighbourhood in the first completed phone answer, before scrolling through a large illustration.
2. The clearer Arabic reading surface preserves the original evidence in optional details instead of discarding it.
3. Currency edits behave like preferences: [GBP display with EGP payment](../media/v7-currency-final/karim-currencies/en-1440-gbp-brief.png) remains explicit and independent.

## Three problems

1. **Deepen the first teaching comparison.** The initial phone view names three places and warns about schools, but their distinct family-life tradeoffs still require further exploration. Names alone do not resolve the relocation question.
2. **The phone split remains a tradeoff.** With reading expanded, only a narrow map strip remains visible. Comparing the named options spatially requires collapsing the sheet; simultaneous teaching and geographic comparison remain stronger on desktop.
3. **Close the measured loading and validation gaps.** LCP exceeds the budget by about 184 ms. Physical-phone responsiveness, native bilingual speech and screen-reader comfort remain unproven; a clean matrix cannot establish them.

Evidence includes 303 unit tests, 444 execution cases/632 turns with thirteen zero safety counters, 28 real-browser/SSE currency checkpoints and six final-source browser passes. Those journeys use MockProvider, not a validated real model. Current CI `39859530719` is pending. Preceding-source `219204a` CI `39858147671` succeeded: 72 browser passes with ten GPU-capability skips, build pass and hosted Concierge performance 94. That hosted result is distinct from the final local-build 99 result. M3 phone emulation is not physical-phone/M1/field-INP proof. No pending result is credited.

**Verdict: A substantially clearer and trustworthy demo journey; retain the open loading budget and real-user validation requirements before unrestricted release.**
