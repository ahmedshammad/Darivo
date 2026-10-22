# Elena Rossi · Stage 2 fifth review

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

“The evidence panel is now clearly a place to read, and the distance label is easier to learn from. The regional fallback remains a weaker teacher of local neighbourhoods.”

## Observed flow

1. Arrival and layers — current captures retain useful orientation and explicit Demo/illustrative qualifications.
2. Evidence and comparison annotations — clearer reading surface and separated distance/country labels.
3. Software fallback — retained D remains functional and honest, but cannot teach the same local geography.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                          |
| -------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | M: The desktop globe and clear invitation establish a strong first impression.                                                                    |
| Originality          |     9 | M: Conversational entry, stories and lifestyle layers form a distinctive learning surface.                                                        |
| AI-first             |     9 | M: Requests drive geographic state; retained requirements are not represented as verified school recommendations.                                 |
| Map experience       |   8.5 | C/D/M: Map targets and sources are usable, but real software fallback offers too little local geography to teach equivalent neighbourhood detail. |
| Visual craft         |     9 | M: The solid conversation/evidence sheet prevents map lettering competing with the reading area; geography remains visible outside it.            |
| Motion quality       |     9 | R: Current M3 moving samples support restrained movement, with one full-window Explore outlier per viewport and no all-device guarantee.          |
| Arabic & RTL         |     9 | M/D/N: Arabic has deliberate composition, readable disclosures and targeted numeral evidence; human language validation remains necessary.        |
| Trust & evidence     |   9.5 | M/D: Fictional school/lifestyle POIs and illustrative 40 km/h reach are plainly qualified; no routing or suitability is implied.                  |
| Discretion & privacy |     9 | M: Exploration does not force an enquiry or imply that a relocation brief was shared.                                                             |
| Developer appeal     |     9 | M: Projects and developers support orientation through supplied references rather than invented recommendations.                                  |
| Speed                |     8 | P: Both map paths miss the two-second LCP target, and physical-phone/field responsiveness is not established.                                     |
| Accessibility        |     9 | C/D: Real 44px pointer targets, keyboard source control and unobstructed disclosure pass focused checks; full AT remains untested.                |

**Individual mean 8.9167; minimum 8.** The score gate applies to the **aggregate review board**, not to this persona alone. This report supplies scores without declaring the aggregate result. The separate LCP target remains unmet.

## Three delights

1. “Reading and looking have their own space.” The opaque panel removes map text from behind the evidence.

2. “The distance is easier to understand.” It no longer occupies the country label in the inspected cross-market view.

3. “The school layer still tells the truth.” Fictional POIs and approximate reach remain qualified.

## Three problems / limits

1. **Speed remains outside budget (P).** All retained Home/Explore LCP results exceed 2.0s; physical-phone responsiveness and field INP remain unmeasured.

2. **Teaching limit in regional 2D (D/M).** Coarse geography cannot explain local roads or island shape as WebGL does. The honest capability notice is necessary, but newcomer comprehension still needs testing.

3. **School-validation limit (M).** Demo points cannot establish curriculum, admissions or suitability. Preserve that boundary in later concierge work; this is not a missing Stage 2 feature penalty.

## Verdict

“The polish improves learning and reading; I still score the map conservatively for regional fallback and keep the speed target open.”

No prior failure is erased, and no blanket production or Stage 2 completion claim follows from these simulated scores.
