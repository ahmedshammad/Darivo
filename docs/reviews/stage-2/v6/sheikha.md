# Sheikha Al-Mansoori · Stage 2 sixth review

This is a **simulated self-audit**, not a client interview or independent external approval. The reviewer contributed Arrival, preferences, visual repairs and the CSS extraction. Scores cover Stage 2 Arrival and Living Map; later transaction, concierge and private-office functionality is outside this score. Earlier failed rounds remain preserved.

## Evidence and limits

- **M — current production:** [24-state matrix](../media/v8/manifest.json) and [eight fallback states](../media/v8/fallback-manifest.json): zero reported page errors, axe violations or document overflow. I opened twelve actual images across EN/AR, dark/light, 375/390/1024/1440, including the named signature checkpoints below. [English](../media/v8/signature-en.webm) and [Arabic](../media/v8/signature-ar.webm) recordings are retained; I inspected checkpoint stills, not every video frame. No new browser interaction is claimed.
- **F — first content:** [paired trace](../performance/trace-v2/README.md) changes simulated LCP from 2657.540 to 2180.506 ms, removing the route-wide placeholder and making the real headline the sole candidate. This is a specific 477.034 ms paired improvement, not the same measurement as every Lighthouse run. Four no-JavaScript heading/composer cases and four navigation/not-found cases are reported passing by the parent; I did not rerun them.
- **P — payload and current audit:** [CSS experiment](../performance/v10/README.md) and [provider experiment](../performance/v11/README.md) reduce local Home gzip document bytes from 38,555 to 26,434 (31.4%); eight sampled computed-style cases remain unchanged. v11 Lighthouse is Home 98/LCP 2187.722 ms/TBT 99.5 ms and Explore 96/LCP 2189.386 ms/TBT 182.5 ms. Thus scoping saves bytes without a demonstrated further LCP gain. These v16 reports precede the v17 boundary-landmark correction represented in current captures. The two-second target remains unmet. [Earlier real software-renderer measurements](../performance/software-v2/README.md) remain historical evidence, not a fresh software audit of this build. TBT is not field INP.
- **R — fresh cadence:** [performance-v8](../media/performance-v8/performance.json) now contains four completed M3 Metal probes (Home/Explore, 1440/390). Moving medians 16.5–16.7 ms, p95 17.7–19.6 ms, zero moving intervals above 33 ms, zero errors. Three full RAF windows each contain one interval above 33 ms. These bounded three-second samples are not physical-phone, M1 or sustained-load certification.
- **I — retained interaction evidence:** [source-panel/real software probes](../media/v6/manual/README.md), [comparison endpoint interactions](../media/v5/comparison-clearance/README.md) and [numeral preference probes](../media/arrival-v2/checks.json) remain supporting earlier evidence. Current stills confirm presentation, not a fresh rerun of those pointer/keyboard/preference tests.

Current-source full demo regression and hosted CI are **pending at review time**; the prior `93103bc` CI is reported green and does not validate these new changes. Native Gulf editorial review, full assistive-technology testing, physical phones/M1 and field INP remain unproven. Source references match supplied data, not independently current market truth. Zero axe findings are not WCAG certification.

“The Arabic arrival still feels considered, and its actual words now arrive without a generic waiting screen. I want the evidence and privacy limits to remain as clear as the invitation.”

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                             |
| -------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |   9.5 | M/F: `arrival-ar-light-1024-viewport.png` retains a generous globe, composed Arabic headline and clear entry; F establishes real server-rendered first content.      |
| Originality          |     9 | M: The editorial two-shore globe in `arrival-en-dark-1440-viewport.png` remains distinctive.                                                                         |
| AI-first             |     9 | M: `signature-ar-evidence.png` retains the Saadiyat/Palm brief above results and labels map guidance as Demo.                                                        |
| Map experience       |     9 | M/I: `signature-ar-comparison-map.png` shows both local endpoints clear of the collapsed sheet and source controls; earlier interaction evidence remains supporting. |
| Visual craft         |     9 | M: The opaque Arabic evidence panel separates the original amount and qualification from geography; mobile typography survives the scoping changes.                  |
| Motion quality       |     9 | R: Current bounded M3 moving samples remain close to 60 Hz, with disclosed full-window outliers.                                                                     |
| Arabic & RTL         |     9 | M/I: Arabic tablet/mobile composition and earlier numeral preferences are deliberate; no native-Gulf approval is implied.                                            |
| Trust & evidence     |   9.5 | M: Arabic evidence explicitly labels the selected property fictional and preserves 35,300,000 AED as an original amount; source controls remain visible.             |
| Discretion & privacy |     9 | M: `arrival-en-light-1440.png` includes a discreet private-office invitation and access qualification without forcing an enquiry.                                    |
| Developer appeal     |     9 | M: The full-page developer wall retains intact names and the no-partnership qualification.                                                                           |
| Speed                |     8 | F/P: Placeholder removal is a real improvement, but current Home/Explore LCP remain about 2.19 s; payload savings alone did not lower that audit result.             |
| Accessibility        |     9 | M/I: Current automated results and retained target/disclosure checks support access; reported landmark repairs help, while full AT remains unverified.               |

**Individual mean 9.0000; minimum 8.** The gate is applied to the aggregate board, not each persona. Scores stay unchanged from v5: the startup repair earns explicit credit, but unchanged current LCP and remaining validation limits do not justify moving a score solely for payload savings.

## Three delights

1. “The first thing I receive is the invitation.” F establishes real heading/composer delivery before hydration, with no route-wide waiting message.

2. “Arabic evidence has its own reading space.” At the evidence checkpoint, the source qualification and original currency sit on an opaque panel.

3. “The private-office tone remains restrained.” The full-page Arrival retains access boundaries without presenting a forced sales handoff.

## Three problems / limits

1. **Speed budget:** current unchanged Lighthouse still exceeds 2.0 s. The 31.4% document reduction is useful, but cannot be counted as a new LCP pass.

2. **Fallback composition/detail:** `fallback-arrival-ar-light-375.png` keeps its notice readable, but the notice occupies substantial globe space and regional geometry cannot teach local island/street detail.

3. **Validation gap:** native Gulf register, screen-reader flow and physical-phone behavior remain untested directly. Current full regression/hosted results are pending.

## Verdict

“Keep the first-content repair and the calmer implementation; retain the speed and human-validation limits before calling this complete.”

No blanket Stage 2 approval or production-completion claim follows. No application edits, builds, browser sessions or commits were made for this review.
