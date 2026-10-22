# Stage 2 v3 — The Critic

**Simulated persona self-review.** This agent contributed to Explore; this is not an independent human review, native-reader study or external endorsement. Third scored iteration, based on current `media/v4` production captures and the subsequent focused probe of that same interface. Earlier reviews and failed captures remain unchanged. Stage 3 reasoning and later office/showcase features are outside scope.

The cross-market repair is real. The general claim that phone comparison framing is repaired is not yet justified: a nearby Arabic pair puts one endpoint behind the comparison button and the other under a story-control hitbox. A beautiful line whose end cannot be reached is still a broken map interaction.

## Inspected sequence

1. **Arrival — strong.** [English light desktop](../media/v4/arrival-en-light-1440-viewport.png), [Arabic dark tablet](../media/v4/arrival-ar-dark-1024-viewport.png) and [English dark phone](../media/v4/arrival-en-dark-390-viewport.png) retain a convincing globe, type hierarchy and conversational entry. Tablet source/helper separation holds.
2. **Explore — readable.** [English light desktop](../media/v4/explore-en-light-1440.png), [Arabic dark desktop](../media/v4/explore-ar-dark-1440.png) and [Arabic light phone](../media/v4/explore-ar-light-390.png) show orderly rails/sheets and faithfully qualified references. The dark default map still offers few geographic labels for a newcomer.
3. **Comparison panel — repaired.** [Arabic comparison](../media/v4/signature-ar-comparison.png) reveals the pair and method together. [Arabic evidence](../media/v4/signature-ar-evidence.png) opens with its Back control visible. Supplied production tests cover reveal/focus and scroll reset.
4. **Cross-market map — repaired in these states.** The [English signature map](../media/v4/signature-en-comparison-map.png) shows Egypt and Dubai together. Fresh [EN fallback](../media/v4/fallback-compare/en-01-compact-map.png), [AR fallback](../media/v4/fallback-compare/ar-01-compact-map.png) and [checks](../media/v4/fallback-compare/checks.json) show the compact notice above June, with both 44px project controls reachable. The old North Coast-only camera and notice-covering-June failures are resolved here.
5. **Nearby Arabic map — failed.** The [focused screenshot](../media/v4/fallback-compare/ar-local-compare-map.png) and [hit-test data](../media/v4/fallback-compare/ar-local-compare.json) establish an occluded lower endpoint at `(274.35,432)` inside the comparison peek's `y413–457` rectangle. The upper endpoint at `(115.65,175)` sits under the story region's hitbox. These points are inside the viewport and above the sheet; those assertions alone do not establish usable framing.
6. **Evidence/recovery — sound within its limits.** [Arabic Orla evidence](../media/v4/fallback-compare/ar-03-orla-palm-jumeirah-evidence.png) retains native currency and specific price qualification. The full brief remains visible. The completed [EN](../media/v4/signature-en.webm) and [AR](../media/v4/signature-ar.webm) recordings are retained; this review inspected their checkpoint stills and completion evidence, not independent continuous video playback.

The [24-state manifest](../media/v4/manifest.json) and [eight-state Home fallback manifest](../media/v4/fallback-manifest.json) report zero axe violations, overflow and page errors. The focused defect demonstrates why those checks are insufficient on their own. Parent-reported validation is 53 unit tests and 36 mock evaluations with zero leaks; hosted validation was pending at review time. Neither is substituted for visual evidence.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                                                          |
| -------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | Current Home desktop/tablet/phone frames make the geographic proposition immediate.                                                                                                               |
| Originality          |     9 | Globe, conversation and spatial collection retain a distinct identity beyond a conventional portal.                                                                                               |
| AI-first             |     9 | Stage 2's explicitly labelled demo guidance drives spatial changes and preserves unverified requirements; future agent reasoning is not claimed.                                                  |
| Map experience       |     7 | Cross-market fitting works, but the current nearby Arabic pair has an endpoint hidden behind a control and another intercepted by a hitbox.                                                       |
| Visual craft         |     8 | Type and panel hierarchy are strong; selected endpoint/control overlap and cross-market distance text over country labelling prevent a polished map composition.                                  |
| Motion quality       |     9 | The supplied short M3 cadence evidence supports near-60Hz sampled movement, with reduced-motion/manual paths. The current stills prove destinations, not sustained device performance.            |
| Arabic & RTL         |     9 | Arabic layout, source qualifications and community explanations hold across the inspected widths. Native Gulf-reader validation remains unestablished.                                            |
| Trust & evidence     |     9 | References keep basis/date/amount qualifications; demos remain explicit and cross-border connections do not claim driving times.                                                                  |
| Discretion & privacy |     9 | No invented urgency or implicit enquiry; the supplied handoff regression preserves a visible draft without automatic submission.                                                                  |
| Developer appeal     |     9 | Accurate reference presentation and restrained identity are compelling, with live availability and later showcase functionality explicitly outside scope.                                         |
| Speed                |     8 | Retained performance v6 reports Home 98 / Explore96, but LCP2.183/2.330s misses the explicit two-second target. The v7 preload experiment did not improve it.                                     |
| Accessibility        |     8 | Keyboard/focus recovery and automated checks are strong; the current mapped endpoints are obscured/intercepted by controls, though the comparison/list offers recovery. No full AT certification. |

**Average: 8.58/10. Minimum: 7. Individual persona gate: FAIL.** This is a new score for newly verified evidence, not a silent revision of earlier reports.

## Three delights

1. The English cross-market map finally lets the eye travel from Egypt to Dubai without manually recovering a lost endpoint.
2. Comparison and evidence now start at the useful content, with focus and Back behaviour covered by targeted checks.
3. Arabic Orla evidence preserves the commercial qualifier instead of converting a source listing into a false universal starting price.

## Three problems

1. **Required repair: comparison must fit the usable map area.** Reserve space for story controls, peek, sources and navigation; verify endpoint circles and their targets against actual overlay geometry after collapse, resize and direction changes. Current Arabic nearby-pair evidence fails this requirement.
2. **Required performance work remains.** [Performance v6](../performance/v6/README.md), [failed v7 experiment](../performance/v7/README.md) and [critical-path analysis](../performance/critical-path-analysis.md) retain the unmet LCP target. High scores are not a timing pass.
3. **Map annotations need stronger separation.** The [cross-market signature](../media/v4/signature-en-comparison-map.png) places its distance over country labelling; the dark default map provides little naming hierarchy. Preserve geography while making the selected relationship easier to read.

**Verdict:** “I believe the cross-market repair. I do not accept a nearby comparison whose endpoint sits under its own control. Fix that, retain the speed dissent, and show the fresh result.”

Limits: no live browsing during shared capture. Screenshots, recorded checks and supplied test results were reviewed. Local Lighthouse uses simulated mobile settings; short headless M3 cadence is not physical M1/phone, field INP or sustained-frame certification. Native Arabic and complete screen-reader journeys remain unverified.
