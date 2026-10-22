# Elena Rossi · Stage 2 sixth review

This is a **simulated self-audit**, not a client interview or independent external approval. The reviewer contributed Arrival, preferences, visual repairs and the CSS extraction. Scores cover Stage 2 Arrival and Living Map; later transaction, concierge and private-office functionality is outside this score. Earlier failed rounds remain preserved.

## Evidence and limits

- **M — current production:** [24-state matrix](../media/v8/manifest.json) and [eight fallback states](../media/v8/fallback-manifest.json): zero reported page errors, axe violations or document overflow. I opened twelve actual images across EN/AR, dark/light, 375/390/1024/1440, including the named signature checkpoints below. [English](../media/v8/signature-en.webm) and [Arabic](../media/v8/signature-ar.webm) recordings are retained; I inspected checkpoint stills, not every video frame. No new browser interaction is claimed.
- **F — first content:** [paired trace](../performance/trace-v2/README.md) changes simulated LCP from 2657.540 to 2180.506 ms, removing the route-wide placeholder and making the real headline the sole candidate. This is a specific 477.034 ms paired improvement, not the same measurement as every Lighthouse run. Four no-JavaScript heading/composer cases and four navigation/not-found cases are reported passing by the parent; I did not rerun them.
- **P — payload and current audit:** [CSS experiment](../performance/v10/README.md) and [provider experiment](../performance/v11/README.md) reduce local Home gzip document bytes from 38,555 to 26,434 (31.4%); eight sampled computed-style cases remain unchanged. v11 Lighthouse is Home 98/LCP 2187.722 ms/TBT 99.5 ms and Explore 96/LCP 2189.386 ms/TBT 182.5 ms. Thus scoping saves bytes without a demonstrated further LCP gain. These v16 reports precede the v17 boundary-landmark correction represented in current captures. The two-second target remains unmet. [Earlier real software-renderer measurements](../performance/software-v2/README.md) remain historical evidence, not a fresh software audit of this build. TBT is not field INP.
- **R — fresh cadence:** [performance-v8](../media/performance-v8/performance.json) now contains four completed M3 Metal probes (Home/Explore, 1440/390). Moving medians 16.5–16.7 ms, p95 17.7–19.6 ms, zero moving intervals above 33 ms, zero errors. Three full RAF windows each contain one interval above 33 ms. These bounded three-second samples are not physical-phone, M1 or sustained-load certification.
- **I — retained interaction evidence:** [source-panel/real software probes](../media/v6/manual/README.md), [comparison endpoint interactions](../media/v5/comparison-clearance/README.md) and [numeral preference probes](../media/arrival-v2/checks.json) remain supporting earlier evidence. Current stills confirm presentation, not a fresh rerun of those pointer/keyboard/preference tests.

Current-source full demo regression and hosted CI are **pending at review time**; the prior `93103bc` CI is reported green and does not validate these new changes. Native Gulf editorial review, full assistive-technology testing, physical phones/M1 and field INP remain unproven. Source references match supplied data, not independently current market truth. Zero axe findings are not WCAG certification.

“The map gives me a place to begin, and the school layer explains its limits. I need it to teach geography on ordinary devices as well as it does in these polished captures.”

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                                     |
| -------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | M/F: The actual globe invitation is visually strong; the first-content evidence establishes that the real words arrive without the generic route placeholder.                |
| Originality          |     9 | M: Stories, conversation and lifestyle layers offer a distinctive way to learn a place.                                                                                      |
| AI-first             |     9 | M: `signature-en-layers.png` follows a retained geographic brief, while Demo guidance avoids implying verified school recommendations.                                       |
| Map experience       |   8.5 | M/I: `explore-en-light-1024.png` teaches the Palm/coast shape, but `fallback-arrival-ar-light-375.png` offers too little local detail for equivalent newcomer orientation.   |
| Visual craft         |     9 | M: Light tablet Explore gives the list and map distinct space; Arabic mobile evidence retains a solid reading surface.                                                       |
| Motion quality       |     9 | R: Current M3 moving samples are controlled; three full-window outliers and missing physical-device testing remain disclosed.                                                |
| Arabic & RTL         |     9 | M/I: Arabic mobile Explore and evidence have deliberate direction/type; earlier digit checks remain supporting rather than freshly rerun.                                    |
| Trust & evidence     |   9.5 | M: `signature-en-layers.png` labels lifestyle points fictional and reach an approximate 40 km/h radius, excluding routing, traffic and accessibility data.                   |
| Discretion & privacy |     9 | M: A user can explore geography without being forced into an enquiry; saved/sharing behavior is not inferred from screenshots.                                               |
| Developer appeal     |     9 | M: Full-page Arrival supplies editorial collections and qualified developer names as orientation, without fabricated endorsements.                                           |
| Speed                |     8 | F/P: First-content delivery and payload improve, but both latest LCP values remain near 2.19 s; field INP and ordinary-device results remain unknown.                        |
| Accessibility        |     9 | M/I: Current zero-axe results and retained source/target checks are encouraging, with reported landmark coverage; full screen-reader and physical-phone testing remain open. |

**Individual mean 8.9167; minimum 8.** The gate is applied to the aggregate board, not each persona. Scores stay unchanged from v5: the startup repair earns explicit credit, but unchanged current LCP and remaining validation limits do not justify moving a score solely for payload savings.

## Three delights

1. “The layer explains its limits where I choose it.” The schools toggle and approximate reach note share the visible tools panel.

2. “The map stays available when I collapse the reading panel.” The comparison-map checkpoints expose geography and the retained brief together.

3. “The heading is real first content.” The no-JavaScript/trace evidence is a meaningful improvement for orientation, not merely a smaller technical bundle.

## Three problems / limits

1. **Ordinary-device uncertainty:** the latest speed audit misses 2.0 s, and current physical-phone/M1/field responsiveness has not been measured.

2. **Fallback teaching limit:** the regional 2D map cannot explain local roads or island shapes like the light tablet WebGL capture. Keep its notice and test newcomer understanding directly.

3. **School interpretation:** fictional school points and a 40 km/h circle do not establish admissions, curriculum or real school travel. Preserve the explicit wording and validate comprehension; no later-stage feature is deducted here.

## Verdict

“The startup is more honest and the map remains a strong introduction; the reduced-detail teaching tradeoff and device/speed limits still deserve conservative scores.”

No blanket Stage 2 approval or production-completion claim follows. No application edits, builds, browser sessions or commits were made for this review.
