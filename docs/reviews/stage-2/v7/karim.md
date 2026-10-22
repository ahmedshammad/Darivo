# Karim Hassan · Stage 2 seventh review

This is a **simulated self-audit**, not a client interview or independent approval. I contributed Arrival, preferences, CSS scoping and the evidence-sheet repairs. Scores cover Stage 2; later transaction/concierge features are outside scope. Previous failures remain intact.

## Evidence and limits

**M:** Fresh [24-layout matrix](../media/v9/manifest.json), [eight fallback states](../media/v9/fallback-manifest.json), and EN/AR signature checkpoints report zero errors, axe findings or overflow. I inspected Arrival, evidence, comparison and orientation images; videos were not watched frame by frame. **E:** I inspected eight [reading-repair images and geometry](../media/evidence-reading-v4/README.md). **O:** [Orientation evidence](../media/orientation-v1/README.md) distinguishes rendered labels from planned placements. No browser run.

**R:** Fresh [performance-v9](../media/performance-v9/performance.json) contains four three-second M3 Metal samples: moving medians 16.4–16.7 ms, p95 17.3–19.8 ms, zero moving intervals above 33ms/errors; the full desktop Home RAF window has one slower interval. **P:** [Earlier hosted scope audits](../performance/hosted-scope/README.md) scored Home 98/Explore 98, LCP 2233.1/2219.2 ms. They precede these reading/label changes; the strict 2s budget remains open.

Source `c5033b8` is pushed. Parent-reported checks: six production reading/orientation cases, 67 native-DB unit tests and 36 mock evaluations pass; the full local run was 55/56 after a cold authentication wait failure, followed by 15 focused passes and a staff-case pass. The full suite remains unconfirmed. CI [39824920382](https://github.com/ahmedshammad/Darivo/actions/runs/39824920382) and [39824917165](https://github.com/ahmedshammad/Darivo/actions/runs/39824917165) remain pending at review time. Physical phones/M1, field INP, native Gulf editorial and full AT validation are unproven. References are supplied evidence, not independently verified current market truth.

“I can compare two markets without a misleading driving time, then read the underlying amount and qualifications with less scrolling. The new labels help me place the projects.”

## Scorecard

| Criterion            | Score | Evidence                                                                                                                  |
| -------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | M: Arrival retains a strong geographic introduction; earlier real-first-content work remains supporting evidence.         |
| Originality          |     9 | M: Spatial comparison is more distinctive than a conventional listing grid.                                               |
| AI-first             |     9 | M: The North Coast/Dubai request remains visible through comparison without pretending financial reasoning is complete.   |
| Map experience       |     9 | M/O: Both markets remain framed; neighbourhood names aid local orientation, with duplication/omission limits.             |
| Visual craft         |   9.5 | M/E: Selected evidence provides more usable fact space without replacing the editable brief with an extra action.         |
| Motion quality       |     9 | R: Fresh M3 moving samples remain controlled; they do not certify ordinary-device or sustained performance.               |
| Arabic & RTL         |     9 | M/E: Arabic evidence and mixed AED/EGP editing retain coherent direction and original values; native review remains open. |
| Trust & evidence     |   9.5 | M: June–Orla is explicitly distance-only, not a driving route; source currency and qualifications stay visible.           |
| Discretion & privacy |     9 | M: The brief remains in the journey without an implied automatic advisor submission.                                      |
| Developer appeal     |     9 | O: Initial desktop labels help place ORLA among neighbourhoods, while reference and availability caveats remain.          |
| Speed                |     8 | P: Home/Explore LCP remains above 2s; current-source hosted results and field INP are unavailable.                        |
| Accessibility        |     9 | E: Pointer stability and keyboard access to notes/final action have focused checks; no blanket WCAG claim follows.        |

**Mean 9.0000; minimum 8.** Visual craft rises from 9 to 9.5 for actual reading-space gain and stable interaction, not technical cleanliness. Other scores remain unchanged. The aggregate board owns the gate; Stage 2 completion is not implied.

## Three delights

1. **The comparison keeps its meaning.** [Comparison card](../media/v9/signature-en-comparison.png) names June/Orla and qualifies 2,746.7 km; the [map checkpoint](../media/v9/signature-en-comparison-map.png) frames both endpoints.

2. **More facts, same brief.** E provides 493.25px English reading space at rest and 449.25px while editing, preserving the original amount and disclaimer.

3. **Local names help interpretation.** [Desktop initial orientation](../media/orientation-v1/en-dark-1440-initial.png) names Palm Jumeirah, Jumeirah Bay, Downtown and Dubai Hills around project columns.

## Three problems

1. **Unmet speed budget:** P is above 2s; technical cleanup and pending CI cannot substitute for a measured pass.

2. **Short-screen tradeoff:** open notes leave 97.5px for English evidence at 500px height. The controls work, but reading requires separate scrolling.

3. **Geographic/decision limits:** labels sometimes repeat; [mobile Saadiyat](../media/orientation-v1/en-light-390-saadiyat.png) relies on native naming. Original prices and straight-line distances do not validate FX, terms or suitability.

## Verdict

“The evidence is easier to read and the map easier to place; retain the explicit performance and financial-decision limits.”
