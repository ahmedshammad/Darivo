# Stage 2 v7 — The Critic

**Simulated persona self-review.** I contributed Explore, orientation placement and its tests; this is not independent human research. This seventh review inspects production `c5033b8` through `media/v9`, supplemented by the supplied orientation and reading probes. Scope is Stage 2 discovery, not a complete advisory service. Prior reviews remain unchanged.

The improvements are visible: initial geography now has useful names, and the phone evidence view spends less height repeating its introduction. I found no new blocker in the inspected states. Native-label repetition and the short-height reading compromise remain visible; the loading budget remains open.

## Inspected journey

1. **Arrival — strong.** [Light desktop](../media/v9/arrival-en-light-1440-viewport.png) and [Arabic phone](../media/v9/arrival-ar-light-390-viewport.png) retain the calm globe, two-market hierarchy and conversational entry.
2. **Initial map — more informative.** [English desktop](../media/v9/explore-en-light-1440.png) names Palm Jumeirah, Jumeirah Bay, Downtown and Dubai Hills. [Arabic phone](../media/v9/explore-ar-dark-390.png) gives the exposed map a readable Palm label. This is a user-facing improvement, not merely a passing geometry test.
3. **Compare — still clear.** [English cross-market](../media/v9/signature-en-comparison-map.png) and [Arabic nearby comparison](../media/v9/signature-ar-comparison-map.png) retain visible endpoints and legible connections. Supplementary orientation names yield during comparison.
4. **Read and edit — better at rest.** [Arabic evidence](../media/v9/signature-ar-evidence.png) now reaches developer, completion and missing-date information within the phone frame. [Multiline editing](../media/evidence-reading-v4/ar-light-375-editing.png) preserves the same brief. [Short viewport with notes open](../media/evidence-reading-v4/ar-light-390-short-sources.png) remains constrained.
5. **Fallback and completion — bounded.** [375px fallback](../media/v9/fallback-arrival-en-dark-375.png) discloses regional geography and unavailable street detail. [EN](../media/v9/signature-en.webm)/[AR](../media/v9/signature-ar.webm) recordings are complete; I inspected checkpoints, not continuous playback. The [24-state](../media/v9/manifest.json) and [eight-fallback](../media/v9/fallback-manifest.json) manifests record zero errors, axe violations and overflow.

## Scorecard

| Criterion            | Score | Evidence                                                                                                      |
| -------------------- | ----: | ------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | Fresh desktop and Arabic-phone Arrival preserve a memorable, restrained opening.                              |
| Originality          |     9 | Geographic conversation remains the organizing idea, rather than a listing grid.                              |
| AI-first             |     9 | Signature geography responds while the visible brief and demo-guidance boundary remain explicit.              |
| Map experience       |     9 | Initial area names improve orientation; comparison stays clear, but duplicate native names limit refinement.  |
| Visual craft         |   9.5 | Compact evidence removes repeated heading space and exposes more facts without losing the editable brief.     |
| Motion quality       |     9 | Fresh bounded M3 cadence supports smooth movement; labels yield during motion/comparison in supplied tests.   |
| Arabic & RTL         |     9 | Inspected names, editing and evidence retain connected Arabic and coherent RTL hierarchy.                     |
| Trust & evidence     |     9 | Orla's qualification/date/basis and the selected Demo project's original currency remain legible.             |
| Discretion & privacy |     9 | Private entry and qualified availability language remain intact; no new security certification is inferred.   |
| Developer appeal     |     9 | The reference presentation remains dignified and distinct from fictional inventory.                           |
| Speed                |     8 | Prior hosted Home/Explore LCP2.233/2.219s exceeds two seconds; current-source CI is pending.                  |
| Accessibility        |     9 | Six production reading/orientation tests and clean captures support access; complete AT validation is absent. |

**Mean: 8.958; minimum: 8.** Visual craft rises by 0.5 for visible reading-space improvement. Other scores remain unchanged. This contributes to the board aggregate; it does not waive the strict timing target.

## Three delights

1. Initial Dubai names now connect the columns to recognizable places.
2. The resting Arabic evidence frame reaches meaningful facts earlier.
3. Comparison remains readable after adding orientation information elsewhere.

## Three problems

1. **Duplicate names:** [Palm](../media/orientation-v1/en-dark-390-palm.png) repeats “Nakhlat Jumeira”; [Arabic Saadiyat](../media/orientation-v1/ar-dark-1440-saadiyat.png) repeats its native name. Useful orientation is not yet a fully edited naming hierarchy.
2. **Short-height reading:** notes open leave approximately 96–98px for evidence in the [reading probe](../media/evidence-reading-v4/README.md). Reachability improves; comfortable simultaneous reading does not.
3. **Performance/validation:** [prior hosted scope](../performance/hosted-scope/README.md) is green but predates these repairs. Strict LCP, physical phone/M1, field INP, native Gulf and full AT validation remain open.

Fresh [four three-second M3 probes](../media/performance-v9/performance.json) show moving medians16.4–16.7ms, p9517.3–19.8ms, no moving intervals over33.34ms/errors; full RAF has one Home-desktop outlier. Parent reports67 native tests/36 mock evals passing, local55/56 with a cold-auth wait failure, then15 focused plus staff passing. That is not a clean full rerun. CI39824920382/39824917165 remain pending; no credit is assigned to their eventual outcome.

**Verdict:** The map teaches more and the phone reads better; I support the direction while retaining the naming, constrained-reading and speed qualifications.
