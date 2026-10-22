# Stage 3 v1 — Rajiv Mehta

**Simulated investor persona self-review, not a real client's endorsement or financial advice.** I contributed the grounding/tools implementation. I inspected the current production matrix, timed signature stills and supplementary investor captures. This is a Stage 3 review of asking, comparing and understanding evidence; future office workflows are outside scope.

Show me the arithmetic, its assumptions and the delivery uncertainty. Darivo retains useful evidence, but the visible answer to a calculation request is another property card. I should not have to discover a collapsed evidence section to learn the result of the calculation I just requested.

## Inspected journey

1. **Compare markets — useful facts, crowded reading.** [Karim at 08 seconds](../media/v2/review-frames/karim-en-08s.png) shows native EGP/AED, qualified price bases and reported completion. The duplicate “Original price” row runs the amount into its qualification.
2. **Inspect unit data — real component, clearly Demo.** The [price/area chart](../media/v2/supplement/en-chart.png) has an accompanying numerical table. I can read the underlying values instead of estimating everything from plotted dots.
3. **Ask for a plan/calculation — honest unknown, buried answer.** The [timeline request](../media/v2/supplement/en-timeline.png) correctly says the selected ready unit lacks a complete stored schedule. The [calculation request](../media/v2/supplement/en-calculation.png) visibly repeats the unit and its price; the computed scenario fact is behind “Evidence & sources.” This is an answer-presentation defect, not evidence that the tool failed.
4. **Inspect developer/context — bounded information.** [Arabic SODIC](../media/v2/supplement/ar-developer.png) preserves published wording and admits an unknown source date. It supplies a published profile, not independently verified delivery history. The [guest proposal](../media/v2/supplement/ar-proposal.png) is not proof of a signed-in confirmed action.

## Scorecard

| Criterion            | Score | Evidence                                                                                                         |
| -------------------- | ----: | ---------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     8 | Confident presentation makes me willing to investigate; phone results initially show little substance.           |
| Originality          |   8.5 | Two-market conversation, geography and live numerical components feel cohesive.                                  |
| AI-first             |   6.5 | A direct calculation request does not put the requested answer in the visible response.                          |
| Map experience       |     7 | Cross-market endpoints are legible, but Palm Jebel Ali is admitted for a Palm Jumeirah requirement.              |
| Visual craft         |   7.5 | Strong hierarchy at page scale; duplicate/run-together price qualifications undermine analytical scanning.       |
| Motion quality       |     8 | Timed frames support intentional camera movement, not a continuous performance certification.                    |
| Arabic & RTL         |     8 | Money and Arabic composition remain readable; developer prose explicitly retains untranslated source wording.    |
| Trust & evidence     |   7.5 | Native prices, qualifications and unknowns are honest; geographic relevance is still wrong in a required script. |
| Discretion & privacy |     9 | Guest state and tested authorization/confirmation boundaries avoid an aggressive lead-capture experience.        |
| Developer appeal     |     8 | Sources and measured availability language respect projects; wrong geographic qualification weakens fit.         |
| Speed                |     6 | Current mobile Lighthouse 74, LCP 3.253s and TBT 775.5ms miss the loading expectations.                          |
| Accessibility        |   6.5 | All 16 expanded-phone states obscure the zoom-out target, despite no horizontal overflow.                        |

**Mean: 7.542; minimum: 6.** This review fails the stage gate.

## Three delights

1. The comparison preserves native currencies and labels the static Demo FX conversion, rather than silently replacing the underlying price.
2. Completion evidence retains “targeted” and “expected” wording; the timeline honestly refuses to invent installments for a unit without a stored plan.
3. The chart's data table and visible Demo provenance make the numerical component inspectable. Supplied tests separately verify exact authorized off-plan unit schedules; the captured unknown state does not claim that successful timeline journey.

## Three problems

1. **The requested calculation is hidden.** Lead the [calculation response](../media/v2/supplement/en-calculation.png) with the scenario result and explicit assumptions. Keep original evidence accessible underneath. In comparison, remove redundant price repetition and separate the amount from its qualification.
2. **Requested island membership is incorrect.** [Sheikha's result](../media/v2/sheikha-en-light-1440.png) includes Palm Jebel Ali. Source inspection confirms broad `palm` matching. Test returned project communities, not merely recognized place IDs.
3. **Phone reading and controls compete.** [Karim phone](../media/v2/karim-ar-dark-390.png) opens on introduction/prompt rather than useful figures. The [48-state manifest](../media/v2/manifest.json) also records 16 serious target-size violations because the sheet leaves only 44×5.5px of zoom-out exposed.

The [execution report](../validation/execution-passing-v3.json) checks 388 cases/548 turns with all 13 counters zero, but covers seeded facts and bounded scenarios, not current external market truth. The [Lighthouse report](/tmp/darivo-stage3-concierge-lighthouse-v1.json) is laboratory evidence; TBT is not field INP. I reviewed stills and sampled recording frames, not continuous video, native Gulf speech, physical-phone/M1 performance or full assistive technology. Real-provider evaluation and production signed-in confirmation remain unproven.

**Verdict:** The evidence foundation is useful; put the numerical answer in front of me and fix geographic relevance before asking me to rely on the curation.
