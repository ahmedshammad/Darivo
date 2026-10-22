# Elena Rossi — Stage 3 third review

**Simulated contributor review, not a client interview, independent audit or native-language endorsement.** I contributed the Concierge UI, Brief, charts and map integration. I inspected production `28cf808`/build v7 images across EN/AR, both themes and desktop/tablet/phone, current signature checkpoints, financial supplements and settled recovery/map captures. Six signature recordings are retained, but I did not continuously play them or run another browser. Earlier failed reviews remain unchanged.

> “I can now move from a neighbourhood name to a recognisable place. I still want the first phone answer to teach me a little more before I scroll.”

## Journey inspected

1. **Orient — clear and relevant:** [English desktop](../media/v6/elena-en-dark-1440.png) pairs three named places with actual Dubai geography. [Arabic tablet](../media/v6/elena-ar-light-1024.png) preserves the same hierarchy and explicit approximation note.
2. **Explore — repaired:** [Arabic signature destination](../media/v6/elena-ar-map.png) and [settled English phone](../media/v6/settled/elena-en-390.png) show the Palm's coastline and streets. This directly resolves the flat destination in v2; readiness is now supported by visible pixels.
3. **Edit — stable:** [Arabic requirements](../media/v6/sheikha-ar-requirements.png) keeps the header, panel and composer in the viewport while exposing the evidence checkbox. The [refined reference](../media/v6/sheikha-refined-en-dark-1440.png) still says beachfront is unverified after the user's explicit edit.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                                                             |
| -------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | The restored geographic backdrop makes the editorial conversation feel connected to a place, not an empty map instrument.                                                                            |
| Originality          |     9 | The bilingual conversation, stable Brief and shared map retain a distinctive identity without becoming a conventional listing grid.                                                                  |
| AI-first             |   8.5 | Three named anchors and direct map actions answer the orientation request. Family and school suitability remain open checks, so teaching utility is still bounded.                                   |
| Map experience       |     9 | Both languages now reach recognisable Palm geography on phones. Repeated Demo school labels still compete with place names in the overview.                                                          |
| Visual craft         |     9 | Request compression, stable reading frame and legible generated chart labels are coherent. The first phone preview remains taller than its immediate teaching value.                                 |
| Motion quality       |   8.5 | Checkpoints show purposeful sheet/camera changes and stable recovery framing. They do not establish current continuous device cadence.                                                               |
| Arabic & RTL         |   8.5 | Arabic tablet, phone recovery and chart are visually deliberate; the chart's numeric geometry no longer clips or overlaps. Native editorial/acoustic validation remains absent.                      |
| Trust & evidence     |   9.5 | Fictional schools, approximate geography, missing schedules and unverified beachfront are distinguished consistently; the system does not silently relax evidence requirements.                      |
| Discretion & privacy |     9 | Guest reading remains useful without contact. Explicit proposal review and sign-in boundaries are visible, supported by scoped regressions.                                                          |
| Developer appeal     |   8.5 | Source-preserving project presentation is credible, although Elena's first answer offers orientation rather than a fully qualified family recommendation. Later showcase features are outside scope. |
| Speed                |   8.5 | [Fresh Lighthouse](../validation/lighthouse-second-repair-v7.json): performance 98, LCP 2193.22 ms, TBT 78 ms, CLS 0. The strict two-second target remains unmet.                                    |
| Accessibility        |     9 | Sixty matrix states are clean for axe/errors/overflow; twenty-two focused production regressions include ancestor-scroll, chart-label and fallback checks. Full AT is not certified.                 |

**Mean 8.8333; minimum 8.5.** The overall mean gate applies to the board aggregate, not each persona separately. This review does not close the stage's performance or validation requirements.

## Three delights

1. The Palm action now teaches through its recognisable shape, not merely a marker and readiness status.
2. Recovery feels like an explicit decision: the condition remains visible, and unknown evidence stays unknown after reranking.
3. The [calculation supplement](../media/v6/supplement/en-calculation.png) puts assumptions beside the result rather than asking me to discover them inside evidence details.

## Three problems

1. **Bring named teaching above the phone fold.** [Arabic phone](../media/v6/elena-ar-light-390.png) reaches the numbered diagram, but its place names and relative-location explanation are still below the initial reading window. Reduce preview height or introduce a compact named orientation first.
2. **Reduce repetitive map labels.** Repeated “Demo POI · school · Demo” strings compete with meaningful neighbourhood labels in the desktop overview. Preserve the qualification while presenting fewer repeated words.
3. **Meet the loading target and validate outside this lab.** LCP is still 193 ms above the specified limit. Current screenshots and automated checks cannot establish physical-phone responsiveness, native speech quality or assistive-technology comfort.

Current evidence includes 291 unit/integration tests and 444 authorized execution cases/632 turns with thirteen zero safety counters, plus 33 wider Atlas browser passes. A demo-sign-in case requires development/hosted execution rather than production. Current CI has passed unit/eval checks but is still running browser tests. Real-provider, native Arabic/voice, M1/physical phone, field INP and full AT remain unproven; no pending result is credited.

**Verdict: The earlier correctness blockers are repaired; refine phone teaching and complete the outstanding loading and validation requirements before full sign-off.**
