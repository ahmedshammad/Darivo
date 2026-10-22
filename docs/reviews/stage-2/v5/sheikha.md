# Sheikha Al-Mansoori · Stage 2 fifth review

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

“The Arabic evidence now has room to breathe. I can see the place, read its qualifications and understand the simpler map; the remaining limits should stay explicit.”

## Observed flow

1. Arabic Arrival — composed and legible in the fresh tablet capture.
2. Local comparison — endpoints remain clear of controls in the production signature.
3. Selected evidence — improved: opaque sheet and no redundant popup behind the toolbar.
4. Source disclosure and software explanation — retained D verifies readable limits and control restoration; not a new manual run.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                |
| -------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |   9.5 | M: Arabic light tablet Arrival has deliberate display type, generous space and a legible globe.                                                         |
| Originality          |     9 | M: The two-shore atlas and conversational opening retain a distinctive identity.                                                                        |
| AI-first             |     9 | M: The Arabic brief remains visible while geography responds, without claiming verified personal suitability.                                           |
| Map experience       |     9 | C/M/D: The previous local-pair obstruction is repaired; endpoint interaction and readable source disclosure now have separate evidence.                 |
| Visual craft         |     9 | M: The evidence sheet is now opaque and the redundant mobile popup yields; the former Map tools collision is absent in the fresh Arabic evidence frame. |
| Motion quality       |     9 | R: Current M3 samples support restrained movement; full Explore windows each contain one interval over 33ms, with no physical-device guarantee.         |
| Arabic & RTL         |     9 | M/N/D: Arabic evidence, numeral preferences and the software explanation are coherent; native Gulf validation remains open.                             |
| Trust & evidence     |   9.5 | D/M: All source-panel lines are readable; original currency, Demo basis and geographic limits remain explicit.                                          |
| Discretion & privacy |     9 | M: Public/private framing and no-automatic-enquiry language remain appropriate for a discreet visit.                                                    |
| Developer appeal     |     9 | M/N: Intact developer names and sourced project context avoid implying invented partnerships.                                                           |
| Speed                |     8 | P: Both hardware and actual software LCP exceed two seconds; software Home reaches 3.33 s despite much lower blocking.                                  |
| Accessibility        |     9 | C/D: Genuine 44px endpoint interactions and keyboard disclosure work. Automated checks and these focused probes do not establish full AT compliance.    |

**Individual mean 9.0000; minimum 8.** The score gate applies to the **aggregate review board**, not to this persona alone. This report supplies scores without declaring the aggregate result. The separate LCP target remains unmet.

## Three delights

1. “The reading surface is calm.” Arabic price, name and source qualification no longer compete with map lettering.

2. “One project name is enough.” The secondary popup yields while the full evidence is open.

3. “The limits stay candid.” Original currency, Demo status and the simpler-device explanation are retained.

## Three problems / limits

1. **Unmet speed budget (P).** Local hardware, actual software and hosted baseline all exceed 2.0s LCP. Keep this acceptance gap separate from a passing CI score floor.

2. **Reduced-detail tradeoff (D/M).** Regional 2D is usable and clearly explained, but lacks the local street/island detail of WebGL; it is not equivalent geographic evidence.

3. **Human-validation limit.** Native Gulf idiom and full assistive-technology behavior still require direct review. These simulated judgments cannot supply that certification.

## Verdict

“The inspected visual and interaction repairs are convincing; retain the performance and human-validation limits when the board decides.”

No prior failure is erased, and no blanket production or Stage 2 completion claim follows from these simulated scores.
