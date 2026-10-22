# Karim Hassan · Stage 2 sixth review

This is a **simulated self-audit**, not a client interview or independent external approval. The reviewer contributed Arrival, preferences, visual repairs and the CSS extraction. Scores cover Stage 2 Arrival and Living Map; later transaction, concierge and private-office functionality is outside this score. Earlier failed rounds remain preserved.

## Evidence and limits

- **M — current production:** [24-state matrix](../media/v8/manifest.json) and [eight fallback states](../media/v8/fallback-manifest.json): zero reported page errors, axe violations or document overflow. I opened twelve actual images across EN/AR, dark/light, 375/390/1024/1440, including the named signature checkpoints below. [English](../media/v8/signature-en.webm) and [Arabic](../media/v8/signature-ar.webm) recordings are retained; I inspected checkpoint stills, not every video frame. No new browser interaction is claimed.
- **F — first content:** [paired trace](../performance/trace-v2/README.md) changes simulated LCP from 2657.540 to 2180.506 ms, removing the route-wide placeholder and making the real headline the sole candidate. This is a specific 477.034 ms paired improvement, not the same measurement as every Lighthouse run. Four no-JavaScript heading/composer cases and four navigation/not-found cases are reported passing by the parent; I did not rerun them.
- **P — payload and current audit:** [CSS experiment](../performance/v10/README.md) and [provider experiment](../performance/v11/README.md) reduce local Home gzip document bytes from 38,555 to 26,434 (31.4%); eight sampled computed-style cases remain unchanged. v11 Lighthouse is Home 98/LCP 2187.722 ms/TBT 99.5 ms and Explore 96/LCP 2189.386 ms/TBT 182.5 ms. Thus scoping saves bytes without a demonstrated further LCP gain. These v16 reports precede the v17 boundary-landmark correction represented in current captures. The two-second target remains unmet. [Earlier real software-renderer measurements](../performance/software-v2/README.md) remain historical evidence, not a fresh software audit of this build. TBT is not field INP.
- **R — fresh cadence:** [performance-v8](../media/performance-v8/performance.json) now contains four completed M3 Metal probes (Home/Explore, 1440/390). Moving medians 16.5–16.7 ms, p95 17.7–19.6 ms, zero moving intervals above 33 ms, zero errors. Three full RAF windows each contain one interval above 33 ms. These bounded three-second samples are not physical-phone, M1 or sustained-load certification.
- **I — retained interaction evidence:** [source-panel/real software probes](../media/v6/manual/README.md), [comparison endpoint interactions](../media/v5/comparison-clearance/README.md) and [numeral preference probes](../media/arrival-v2/checks.json) remain supporting earlier evidence. Current stills confirm presentation, not a fresh rerun of those pointer/keyboard/preference tests.

Current-source full demo regression and hosted CI are **pending at review time**; the prior `93103bc` CI is reported green and does not validate these new changes. Native Gulf editorial review, full assistive-technology testing, physical phones/M1 and field INP remain unproven. Source references match supplied data, not independently current market truth. Zero axe findings are not WCAG certification.

“I can compare the North Coast with Dubai and see what the number actually means. A smaller download is welcome, but I will judge speed by the result, not the implementation.”

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                        |
| -------------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | M/F: English dark desktop Arrival preserves the geographic invitation, now backed by first-content/no-JavaScript evidence.                                      |
| Originality          |     9 | M: `signature-en-comparison-map.png` makes the two-market journey spatial rather than a conventional listing comparison.                                        |
| AI-first             |     9 | M: `signature-en-comparison.png` retains the exact North Coast/Dubai request; no completed financial or payment-plan reasoning is claimed.                      |
| Map experience       |     9 | M/I: June and Orla remain framed in the collapsed comparison map, with the distance annotation clear of Saudi Arabia; target checks are retained evidence.      |
| Visual craft         |     9 | M: The comparison reading card and map checkpoint both keep the distance legible and separate from geography.                                                   |
| Motion quality       |     9 | R: Current M3 movement is supported by measured intervals, with device/sample limitations stated.                                                               |
| Arabic & RTL         |     9 | M/I: Arabic local comparison and source evidence remain coherent, with earlier numeral preference evidence; native-reader assessment is pending.                |
| Trust & evidence     |   9.5 | M: `signature-en-comparison.png` states 2,746.7 km, distance only, not a driving route; `explore-en-light-1024.png` shows original AED, listing basis and date. |
| Discretion & privacy |     9 | M: The retained request is visible without suggesting that it has been sent to an advisor.                                                                      |
| Developer appeal     |     9 | M: ORLA source context and the full Arrival developer wall distinguish references from saleable inventory and partnerships.                                     |
| Speed                |     8 | F/P: Real first-content improvement is documented; current 2.19 s Lighthouse and unmeasured current software/field performance still prevent budget compliance. |
| Accessibility        |     9 | M/I: Still-visible source controls and retained endpoint/keyboard checks support use; no new manual interaction or full AT pass is claimed.                     |

**Individual mean 8.9583; minimum 8.** The gate is applied to the aggregate board, not each persona. Scores stay unchanged from v5: the startup repair earns explicit credit, but unchanged current LCP and remaining validation limits do not justify moving a score solely for payload savings.

## Three delights

1. “The comparison keeps its meaning.” The comparison card names June and Orla and expressly rejects a cross-border driving-time interpretation.

2. “I can see the basis of the price.” ORLA’s tablet card shows 57,300,000 AED, the four-bedroom starting basis, agent-listing date and availability caveat.

3. “The actual page arrives first.” F removes the late route-dependent heading; P reduces the document without changing the inspected layout.

## Three problems / limits

1. **Measured speed:** Home and Explore remain above the explicit two-second budget. Current-source hosted performance and regression are not yet available.

2. **Fallback geography:** retained software checks support comparison, but coarse regional geometry is weaker for understanding a specific address.

3. **Decision boundary:** original source amounts and illustrative distances are useful orientation, not current FX, payment schedules or investment suitability. Later-stage decisions still need separate evidence; this is not a Stage 2 missing-feature penalty.

## Verdict

“The comparison remains useful and the startup repair is credible; neither replaces the unmet speed budget or verifies a financial decision.”

No blanket Stage 2 approval or production-completion claim follows. No application edits, builds, browser sessions or commits were made for this review.
