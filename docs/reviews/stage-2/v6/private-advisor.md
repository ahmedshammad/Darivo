# Stage 2 sixth scored review — Darivo Private Advisor

22 October 2026. **Simulated persona self-audit by the implementing agent, not independent human research.** This sixth round uses the completed current production **media/v8** captures. I inspected the stills cited below. EN/AR videos are retained, but I did not independently review their full playback or run a browser for this scoring round.

The [matrix manifest](../media/v8/manifest.json) records 24 WebGL states, and the [fallback manifest](../media/v8/fallback-manifest.json) records eight forced Home fallback states. Both have zero recorded page errors, axe violations or horizontal overflow. The parent reports **eight current production no-JavaScript, cross-route preference and not-found checks passing**. The eight sampled computed-style/geometry comparisons were identical after the CSS/provider changes. These are bounded checks, not proof that every state or assistive technology works.

The [prior hosted run for `93103bc`](../performance/hosted-polish/README.md) is green. It predates the loading/CSS/provider changes reviewed here. **The full current demo suite and current hosted CI are pending at authoring and receive no credit in these scores.** Existing successful sign-in handoff and actual-software-renderer tests remain prior evidence, not newly repeated results. Real-provider evaluations, physical M1/phone testing, field INP, native Gulf-reader review and complete native assistive-technology validation remain unperformed.

Scope remains Stage 2 spatial discovery, qualified estimates and reference context. These scores do not certify a complete investment-underwriting service, advisor console, available inventory or legal compliance.

> The real page now arrives without a generic waiting screen, and the client’s words and source context survive the move into evidence. I would use this as a discovery aid. Source confirmation and the judgement behind an investment recommendation still belong in the advisor conversation.

## Journey and repair assessment

- **Request → map.** [Current English comparison](../media/v8/signature-en-comparison.png) retains both North Coast and Dubai. [Arabic evidence](../media/v8/signature-ar-evidence.png) retains the Saadiyat/Palm request. The interface does not present every stated requirement as a verified personal filter.
- **Map → explanation.** [English cross-market map](../media/v8/signature-en-comparison-map.png) now separates the distance from Saudi Arabia. [Arabic local map](../media/v8/signature-ar-comparison-map.png) leaves both selected endpoints clear of the story/peek controls. The previous exact obstruction is not visible in this production capture.
- **Explanation → evidence.** The opaque [Arabic evidence surface](../media/v8/signature-ar-evidence.png) removes background label bleed, and the duplicate popup yields to the panel's project name. [ORLA reference context](../media/v8/explore-en-light-1440.png) remains distinct from this fictional Demo project. Original source/date/basis and current-term confirmation remain central.
- **Evidence → handoff.** Prior regression evidence supports contextual sign-in return without automatic consultant sending. Current cross-route preference checks help establish that the provider split preserved shared display state. The full current demo suite is pending, so I am not treating the earlier handoff pass as a newly verified current-build journey. The complete advisor console remains later scope.

## Performance evidence and limits

The [paired trace reconstruction](../performance/trace-v2/README.md) establishes a specific repair: the initial loading placeholder is gone, and the real headline is the sole LCP candidate. Simulated Home LCP changes from **2657.540 to 2180.506 ms**; in the latter diagnostic, observed FCP and LCP coincide at 56.532 ms. That local unthrottled observation is not the simulated mobile result.

The later [scoped-provider audit](../performance/v11/README.md) records Home/Explore scores **98/96**, LCP **2187.722/2189.386 ms** and TBT **99.5/182.5 ms**, with other categories 100. HTML gzip falls from 38,555 to 26,434 bytes, **31.4%**, while sampled layouts remain unchanged. These v16 reports precede the v17 standalone-boundary landmark correction. The improvements preserve visible content, but **both current audited routes still miss LCP < 2.0 seconds**. Neither low TBT nor a high Lighthouse score establishes field INP.

Fresh [bounded M3 render measurements](../media/performance-v8/performance.json) cover Home/Explore at 1440/390 widths over three-second probes. Each has 35 active-motion samples: medians 16.5–16.7 ms, p95 17.7–19.6 ms, and no active-motion interval over 33.34 ms. Full browser-RAF windows contain one interval over 33.34 ms in each Home case and mobile Explore; desktop Explore has none. No errors were recorded. This supports smooth motion in these windows, not universal 60 fps or physical-phone/M1 certification.

## Part H scorecard

| Criterion            | Score / 10 | Evidence                                                                                                                                                                                                                                                                                            |
| -------------------- | ---------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |        9.0 | [Desktop Arrival](../media/v8/arrival-en-dark-1440-viewport.png) gives a calm, memorable private-client introduction.                                                                                                                                                                               |
| Originality          |        9.0 | [Arabic tablet](../media/v8/arrival-ar-light-1024-viewport.png) and Sand Explore share a coherent spatial/editorial identity.                                                                                                                                                                       |
| AI-first             |        9.0 | Current signatures retain the client request, change geographic context and keep an onward handoff boundary. Scope remains declared Demo guidance.                                                                                                                                                  |
| Map experience       |        9.0 | Current EN/AR comparison frames show both places clear of controls; distance is separated from country text. Retained fallback probes establish useful geographic continuity.                                                                                                                       |
| Visual craft         |        9.0 | Current production captures retain the separated distance label, opaque evidence and suppressed duplicate popup. Eight sampled geometry/style comparisons remained identical after the payload work; this is not every-breakpoint certification.                                                    |
| Motion quality       |        9.0 | Fresh [M3 probes](../media/performance-v8/performance.json) show active-motion medians 16.5–16.7 ms and p95 17.7–19.6 ms, with no active-motion intervals over 33.34 ms. Three of four full RAF windows each have one over 33.34 ms. Bounded current-build evidence, not device-wide certification. |
| Arabic & RTL         |        8.5 | Arabic evidence, local comparison and [375px fallback](../media/v8/fallback-arrival-ar-dark-375.png) are deliberately composed. Native Gulf-language and native AT validation remain outstanding.                                                                                                   |
| Trust & evidence     |        9.0 | Source/date/basis, reference/Demo status, original currency and non-routing estimates remain explicit; the current panel makes those qualifications easier to read.                                                                                                                                 |
| Discretion & privacy |        9.5 | The documented handoff requires user agency and prevents automatic sending. Capability preflight conveys only a coarse reason; raw renderer values are not application telemetry.                                                                                                                   |
| Developer appeal     |        9.0 | The real-reference treatment is dignified and fact-qualified without manufacturing an available unit or affiliation.                                                                                                                                                                                |
| Speed                |        8.5 | The real first headline no longer waits behind a loading placeholder, and HTML gzip is 31.4% smaller. Current local scores 98/96 are good, but LCP 2187.722/2189.386 ms still misses 2.0 s. Current hosted CI and field INP remain unproven.                                                        |
| Accessibility        |        9.0 | Current clean matrix/fallback checks plus eight reported no-JavaScript, cross-route and not-found passes strengthen access evidence. Earlier pointer/keyboard/handoff checks are retained evidence; the current full suite is pending and native AT review remains open.                            |

**Mean: 8.958/10. Minimum: 8.5. Scores unchanged from the fifth round.** The new work improves first-content delivery and provides clearer measured evidence, but it does not yet close the remaining speed or independent-validation gaps. The gate is **board aggregate ≥9.0 with no criterion below 8**; it is not a separate requirement that each persona mean reach 9.0. This individual report neither calculates that board aggregate nor waives the strict performance target.

## Top three delights

1. The real opening content survives without JavaScript, while the shared preference state has passed the reported cross-route checks.
2. [Arabic evidence](../media/v8/signature-ar-evidence.png) gives the project context a clear reading surface without a duplicate popup behind the toolbar.
3. [The comparison explanation](../media/v8/signature-en-comparison.png) preserves the client's two-market request and distinguishes straight-line distance from a driving route.

## Top three remaining problems

1. **Evidence still takes sustained reading.** The opaque panel resolves interference, but an advisor must work through a long mobile page. [English evidence](../media/v8/signature-en-evidence.png) makes the Demo qualification clear; actual advisor reading effort has not been tested.
2. **First-view performance is improved but incomplete.** LCP remains about 2.19 seconds on both audited routes. The current full demo suite/hosted run is pending, and physical-device/field-interaction evidence is missing.
3. **Independent validation remains absent.** Native Gulf readers, native screen-reader users and working advisors have not validated the complete conversation. Prior successful handoff tests remain useful, but are not a new full-suite result for this build.

**One-line verdict:** This is a coherent private-client discovery aid with a better real first view; the unresolved speed, reading-effort and independent-validation limits keep my mean just below nine.
