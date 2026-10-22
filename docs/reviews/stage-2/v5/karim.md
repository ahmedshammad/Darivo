# Karim Hassan · Stage 2 fifth review

This is a **simulated self-audit**, not an interview or independent external approval. The reviewer implemented Arrival, preferences and the latest opaque evidence-sheet/popup-yield polish. Scores cover Stage 2 Arrival and Living Map; later concierge, payment-plan, project-showcase and private-office workflows are not counted as missing Stage 2 functionality. Earlier reviews and failed captures remain unchanged.

## Evidence and limits

- **M — fresh production v7:** [24-state matrix](../media/v7/manifest.json), [eight fallback states](../media/v7/fallback-manifest.json), EN/AR signature screenshots and completed videos in [media/v7](../media/v7/). Both manifests report zero axe violations, page errors and document overflow. Inspected images include Arabic light tablet Arrival, English dark desktop Arrival, Arabic light mobile Explore, English light tablet Explore, English light 375px Home fallback, Arabic evidence/local comparison, English cross-market comparison and layers. Videos are retained, not claimed as independently watched frame by frame.
- **Polish evidence:** `signature-ar-evidence.png` shows an opaque reading surface and no redundant project popup behind Map tools. `signature-en-comparison-map.png` separates the distance label from Saudi Arabia. [Eight development surface checks](../media/v7-polish/README.md) and [focused label checks](../media/readability-v7/README.md) are supporting development evidence, distinct from M. The parent reports four focused production regressions passing for the polish.
- **D — retained manual interaction:** [v6 manual probe](../media/v6/manual/README.md), eight EN/AR 375/390 disclosure cases plus four actual SwiftShader Home captures. Full source text was visually readable; comparison controls yielded and returned, and 25 hit-test samples per panel were clear. The complete tested text fitted without scrolling. Real software-renderer strings and bilingual device-specific explanations were recorded; this was not a mocked capability.
- **C — retained comparison checks:** [Direct clearance/fallback-click probe](../media/v5/comparison-clearance/README.md), eight geometry cases and eight actual endpoint clicks. The then-failed source panel remains documented; D closed it. Current production signatures retain the repaired framing. The pre-polish targeted suite also passed genuine 44px WebGL target clicks 20px from the glyph centers and real SwiftShader interactions. This review does not represent those retained checks as newly rerun manual tests.
- **N — retained preferences:** [Numeral/wordmark probe](../media/arrival-v2/checks.json), EN/AR × Latin/Arabic-Indic at 390px, not a new full preference test.
- **P — performance remains bounded:** [Local hardware v8](../performance/v8/README.md): Home 98/LCP 2,179.483ms/TBT 133.5ms; Explore 96/LCP 2,327.811ms/TBT 172ms. [Actual software v2](../performance/software-v2/README.md): Home 90/LCP 3,331.27ms/TBT 73ms; Explore 94/LCP 2,936.508ms/TBT 77ms. [Hosted baseline](../performance/hosted-green/README.md): Home 91/LCP 2,242.786ms; Explore 93/LCP 2,374.246ms; Search 94/LCP 2,849.886ms; Arabic detail 92/LCP 3,017ms. All exceed the separate two-second LCP target. TBT is not INP. These precede the latest visual polish; none is labelled a fresh polish performance run.
- **R — fresh bounded motion sample:** [Current production cadence](../media/performance-v7/performance.json), Home/Explore at 1440/390 on Apple M3 Metal, four three-second probes. Moving medians 16.5–16.9ms, p95 18.2–19.8ms, no moving interval >33ms and no errors. Each full Explore RAF window contains one interval >33ms. This supports the sampled motion, not sustained 60fps on M1/physical phones or field INP.

[Baseline hosted CI 39811918397](https://github.com/ahmedshammad/Darivo/actions/runs/39811918397) is green at `d9b2faa`: 61 unit tests, 36 mock evaluations with zero off-market leakage, 38 browser cases passed and 3 GPU-only cases skipped on positively identified software rendering; local hardware completed 41/41. Build, lint, typecheck, formatting and existing Lighthouse floors passed. **Polish CI 39813759238 at `93103bc` is pending at review time.** Baseline green does not imply green for that newer commit.

Native Gulf language review, full assistive-technology testing, M1/physical-phone behavior and field INP remain unproven. Data matches supplied references, not independently current market truth. Zero axe findings are not WCAG certification. No application edits or commits were made for this review; no new browser session was opened.

“The cross-market line now explains the distance without colliding with the country name, and the evidence is easier to read. That is useful polish, not evidence that the speed budget is met.”

## Observed flow

1. June–Orla comparison — both markets remain framed; distance annotation now clears the Saudi Arabia label.
2. Evidence and brief — opaque reading surfaces improve separation from the map.
3. Source and endpoint interaction — retained C/D establish accessible targets and readable limitations; no new manual run claimed.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                             |
| -------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | M: Desktop Arrival makes the two-market journey inviting and immediately geographic.                                                                                 |
| Originality          |     9 | M: Place-based comparison remains distinct from a conventional listing grid.                                                                                         |
| AI-first             |     9 | M/C: Both markets and the request remain visible; earlier targeted input evidence retains year and currencies without pretending payment-plan reasoning is complete. |
| Map experience       |     9 | C/M/D: Cross-market endpoints are reachable, local-pair controls repaired, and full limitations visible when requested.                                              |
| Visual craft         |     9 | M: Opaque reading panels separate the brief and source text from geography; the cross-market distance is legible above the connection.                               |
| Motion quality       |     9 | R: Current M3 moving samples support purposeful camera movement; the full-window outliers and hardware/sample limits remain explicit.                                |
| Arabic & RTL         |     9 | M/D/N: Arabic comparison/source flows and numeral preferences have specific evidence rather than mirror-only styling.                                                |
| Trust & evidence     |   9.5 | M/D: 2,746.7 km is labelled distance only, not a driving route; original source values and assumptions remain explicit.                                              |
| Discretion & privacy |     9 | M: The request stays in the journey without implying it was sent to an advisor.                                                                                      |
| Developer appeal     |     9 | M: Source-backed project references provide useful context without inventing saleable stock or partnerships.                                                         |
| Speed                |     8 | P: Hardware and software meet the score floor but both miss the actual LCP budget; software Home takes 3.33 s.                                                       |
| Accessibility        |     9 | C/D: Actual fallback and enlarged WebGL targets have pointer evidence; source disclosure works by keyboard and restores controls.                                    |

**Individual mean 8.9583; minimum 8.** The score gate applies to the **aggregate review board**, not to this persona alone. This report supplies scores without declaring the aggregate result. The separate LCP target remains unmet.

## Three delights

1. “The distance has a clear place.” 2,746.7km sits apart from the country label in the current frame.

2. “I can read the financial context.” The evidence surface keeps original amounts and qualifications clear.

3. “The comparison survived the polish.” Both markets remain visible and distance-only wording is retained.

## Three problems / limits

1. **Unmet performance target (P).** Hosted Home/Explore LCP 2.24/2.37s and the retained local results remain above 2.0s. A green baseline CI does not remove this requirement.

2. **Reduced-detail limit (D).** Software fallback preserves geographic comparison, but local street/3D detail is unavailable. The current disclosure is honest, not a substitute for that detail.

3. **Later decision-workflow limit.** Retained currency intent and source values do not verify current FX, payment schedules or suitability. Those later-stage features need separate evidence; they are not scored as missing Stage 2 functionality.

## Verdict

“I accept the inspected comparison/readability repairs, with the speed budget and later financial decision limits still open.”

No prior failure is erased, and no blanket production or Stage 2 completion claim follows from these simulated scores.
