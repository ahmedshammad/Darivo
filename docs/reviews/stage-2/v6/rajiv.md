# Stage 2 sixth scored review — Rajiv Mehta

22 October 2026. **Simulated persona self-audit by the implementing agent, not independent human research.** This sixth round uses the completed current production **media/v8** captures. I inspected the stills cited below. EN/AR videos are retained, but I did not independently review their full playback or run a browser for this scoring round.

The [matrix manifest](../media/v8/manifest.json) records 24 WebGL states, and the [fallback manifest](../media/v8/fallback-manifest.json) records eight forced Home fallback states. Both have zero recorded page errors, axe violations or horizontal overflow. The parent reports **eight current production no-JavaScript, cross-route preference and not-found checks passing**. The eight sampled computed-style/geometry comparisons were identical after the CSS/provider changes. These are bounded checks, not proof that every state or assistive technology works.

The [prior hosted run for `93103bc`](../performance/hosted-polish/README.md) is green. It predates the loading/CSS/provider changes reviewed here. **The full current demo suite and current hosted CI are pending at authoring and receive no credit in these scores.** Existing successful sign-in handoff and actual-software-renderer tests remain prior evidence, not newly repeated results. Real-provider evaluations, physical M1/phone testing, field INP, native Gulf-reader review and complete native assistive-technology validation remain unperformed.

Scope remains Stage 2 spatial discovery, qualified estimates and reference context. These scores do not certify a complete investment-underwriting service, advisor console, available inventory or legal compliance.

> The first page now delivers the actual invitation, and the later map and evidence remain as composed as before. I would use this to begin a cross-market conversation. I would still ask an advisor to confirm the quoted basis and current terms before treating any figure as decision-ready.

## Journey and repair assessment

1. **Read the amount in context.** [Sand Explore](../media/v8/explore-en-light-1440.png) shows ORLA at AED 57.3 million with “4-bedroom residences from,” agent-listing basis, June 2026 date and source domain. It explicitly requires availability/current-term confirmation; this is not a verified available unit or return forecast.
2. **Separate geography from financial inference.** [June↔ORLA comparison](../media/v8/signature-en-comparison.png) labels 2,746.7 km as distance only, not a driving route. [Its map](../media/v8/signature-en-comparison-map.png) now places the annotation above the line while Saudi Arabia remains readable below. Country context has not been removed to make the annotation look cleaner.
3. **Read evidence without visual interference.** [Arabic evidence](../media/v8/signature-ar-evidence.png) is opaque and shows a Demo qualification alongside the native AED amount. The redundant popup no longer sits behind the toolbar. The selected point remains visible. [Arabic local comparison](../media/v8/signature-ar-comparison-map.png) retains two reachable-looking endpoints and its qualified local estimate; pointer-test support comes from earlier recorded regressions, not a new current-build full-suite result or this still alone.

## Performance evidence and limits

The [paired trace reconstruction](../performance/trace-v2/README.md) establishes a specific repair: the initial loading placeholder is gone, and the real headline is the sole LCP candidate. Simulated Home LCP changes from **2657.540 to 2180.506 ms**; in the latter diagnostic, observed FCP and LCP coincide at 56.532 ms. That local unthrottled observation is not the simulated mobile result.

The later [scoped-provider audit](../performance/v11/README.md) records Home/Explore scores **98/96**, LCP **2187.722/2189.386 ms** and TBT **99.5/182.5 ms**, with other categories 100. HTML gzip falls from 38,555 to 26,434 bytes, **31.4%**, while sampled layouts remain unchanged. These v16 reports precede the v17 standalone-boundary landmark correction. The improvements preserve visible content, but **both current audited routes still miss LCP < 2.0 seconds**. Neither low TBT nor a high Lighthouse score establishes field INP.

Fresh [bounded M3 render measurements](../media/performance-v8/performance.json) cover Home/Explore at 1440/390 widths over three-second probes. Each has 35 active-motion samples: medians 16.5–16.7 ms, p95 17.7–19.6 ms, and no active-motion interval over 33.34 ms. Full browser-RAF windows contain one interval over 33.34 ms in each Home case and mobile Explore; desktop Explore has none. No errors were recorded. This supports smooth motion in these windows, not universal 60 fps or physical-phone/M1 certification.

## Part H scorecard

| Criterion            | Score / 10 | Evidence                                                                                                                                                                                                                                                                                            |
| -------------------- | ---------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |        9.5 | [Desktop Arrival](../media/v8/arrival-en-dark-1440-viewport.png) remains a memorable, composed geographic opening with a clear conversational action.                                                                                                                                               |
| Originality          |        9.5 | [Arabic tablet](../media/v8/arrival-ar-light-1024-viewport.png) and Sand Explore retain a distinctive editorial/spatial identity.                                                                                                                                                                   |
| AI-first             |        8.5 | Current EN comparison keeps both markets and drives geography. Explicit Demo guidance limits expectations; verified suitability and complete natural-language underwriting are not established.                                                                                                     |
| Map experience       |        9.0 | EN cross-market and AR local maps retain clear endpoints; the cross-market annotation now respects country context. Initial neighbourhood orientation remains sparse.                                                                                                                               |
| Visual craft         |        9.0 | Current production captures retain the separated distance label, opaque evidence and suppressed duplicate popup. Eight sampled geometry/style comparisons remained identical after the payload work; this is not every-breakpoint certification.                                                    |
| Motion quality       |        9.0 | Fresh [M3 probes](../media/performance-v8/performance.json) show active-motion medians 16.5–16.7 ms and p95 17.7–19.6 ms, with no active-motion intervals over 33.34 ms. Three of four full RAF windows each have one over 33.34 ms. Bounded current-build evidence, not device-wide certification. |
| Arabic & RTL         |        8.5 | Inspected Arabic tablet, evidence, local comparison and [375px fallback](../media/v8/fallback-arrival-ar-dark-375.png) show intentional direction/type. Native Gulf-reader validation remains absent.                                                                                               |
| Trust & evidence     |        9.0 | Source, basis, date and native currency remain together; reference/Demo and straight-line/non-routing distinctions are explicit in current comparison and evidence.                                                                                                                                 |
| Discretion & privacy |        9.5 | No automatic enquiry or urgency. Recorded contextual sign-in handoff preserves user control; capability classification exposes no raw renderer string. Not a legal/storage audit.                                                                                                                   |
| Developer appeal     |        9.0 | ORLA is presented with dignity and qualification, without fabricating inventory, affiliation or an available offer.                                                                                                                                                                                 |
| Speed                |        8.5 | The real first headline no longer waits behind a loading placeholder, and HTML gzip is 31.4% smaller. Current local scores 98/96 are good, but LCP 2187.722/2189.386 ms still misses 2.0 s. Current hosted CI and field INP remain unproven.                                                        |
| Accessibility        |        9.0 | Current clean matrix/fallback checks plus eight reported no-JavaScript, cross-route and not-found passes strengthen access evidence. Earlier pointer/keyboard/handoff checks are retained evidence; the current full suite is pending and native AT review remains open.                            |

**Mean: 9.000/10. Minimum: 8.5. Scores unchanged from the fifth round.** The new work improves first-content delivery and provides clearer measured evidence, but it does not yet close the remaining speed or independent-validation gaps. The gate is **board aggregate ≥9.0 with no criterion below 8**; it is not a separate requirement that each persona mean reach 9.0. This individual report neither calculates that board aggregate nor waives the strict performance target.

## Top three delights

1. The actual headline and composer are available without JavaScript; a generic loading message no longer substitutes for the invitation.
2. [ORLA’s reference card](../media/v8/explore-en-light-1440.png) keeps price, basis, reported date and source together, with current terms requiring confirmation.
3. [The cross-market map](../media/v8/signature-en-comparison-map.png) preserves both endpoints and a readable distance while keeping country geography legible.

## Top three remaining problems

1. **Strict speed remains open.** Current audited Home/Explore LCP is about 2.19 seconds, and the current full suite/hosted run is pending. The smaller document is an improvement, not a completed performance target.
2. **Orientation and input clarity can improve.** Initial Explore still offers sparse neighbourhood anchors; cluster meaning requires the reading-map explanation. The long sample in [mobile Arrival](../media/v8/arrival-en-dark-390-viewport.png) is constrained by its single-line field.
3. **Independent confidence is incomplete.** No physical M1/phone, native Gulf reader or complete native screen-reader journey has been validated. A self-audit cannot establish those outcomes.

**One-line verdict:** The current Stage 2 discovery experience remains a 9.0 for me, with better first-content delivery but the separate speed and independent-validation work still open.
