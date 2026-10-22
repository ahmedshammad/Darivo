# Stage 2 v5 — The Critic

**Simulated persona self-review.** This agent contributed Explore, its hit targets and reading-surface polish. This is not an independent human endorsement or native-reader study. Fifth scored iteration, reviewing production commit `93103bc` through `media/v7`. Previous scores and failed evidence remain immutable. The scope is Stage 2's discovery/map experience, not later agent or office features.

The final polish addresses the specific craft issues from my previous review. Distance and country labels now have separate space; evidence has a proper reading surface; the duplicate phone popup yields to the full name in the sheet. I found no new blocking interaction defect in the inspected evidence. The loading promise still needs work.

## Inspected sequence

1. **Arrival — strong.** [Arabic light phone](../media/v7/arrival-ar-light-390-viewport.png) retains the globe, generous Arabic heading and conversational entry. [Forced-fallback Home](../media/v7/fallback-arrival-en-dark-375.png) clearly identifies the regional 2D limitation.
2. **Explore — clearer reading.** [English light desktop](../media/v7/explore-en-light-1440.png) and [Arabic dark tablet](../media/v7/explore-ar-dark-1024.png) keep reference amounts and qualifications on solid surfaces, while geography remains visible outside the rail.
3. **Comparison — repaired.** [English cross-market](../media/v7/signature-en-comparison-map.png) places 2,746.7km separately from Saudi Arabia. [Nearby Arabic comparison](../media/v7/signature-ar-comparison-map.png) keeps both selected endpoints clear of controls. Previous actual20px offset-click coverage established the 22px-radius WebGL targets; the current polish has four supplied passing production regressions.
4. **Evidence — repaired.** [Arabic](../media/v7/signature-ar-evidence.png) and [English](../media/v7/signature-en-evidence.png) show the complete project name and Demo qualification without underlying map text. The redundant mobile popup is absent; the map selection remains visible outside the panel.
5. **Complete signature — bounded proof.** The [EN](../media/v7/signature-en.webm) and [AR](../media/v7/signature-ar.webm) recordings are complete. I inspected checkpoint stills and completion evidence, not independent continuous video playback. The [24-state matrix](../media/v7/manifest.json) and [eight fallback states](../media/v7/fallback-manifest.json) report no axe violations, page errors or overflow.

The [green hosted baseline](../performance/hosted-green/README.md) is `d9b2faa`:61 unit tests,36 mock evaluations with zero leaks,38 browser passes and3 GPU-specific skips; all41 browser cases passed locally on M3 WebGL. That baseline predates the current polish. Hosted run39813759238 for `93103bc` was still running at review time and is not called green.

## Scorecard

Fresh [current-build cadence](../media/performance-v7/performance.json) covers four three-second Home/Explore probes at1440/390 on M3 Metal: sampled moving-render medians16.5–16.9ms, p9518.2–19.8ms, no sampled moving interval above33ms. Each full Explore RAF window includes one interval above33ms. This supports the sampled motion score, not uninterrupted60fps or physical-device certification.

| Criterion            | Score | Evidence                                                                                                                                                          |
| -------------------- | ----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | Current arrival maintains a compelling geographic and typographic opening.                                                                                        |
| Originality          |     9 | Conversation, globe and place relationships remain distinct from conventional listings.                                                                           |
| AI-first             |     9 | Stage 2's clearly bounded spatial guidance changes the map and retains other requirements without inventing agent verification.                                   |
| Map experience       |     9 | Nearby/cross-market endpoints remain usable; current distance placement repairs the prior country-label collision.                                                |
| Visual craft         |     9 | Opaque reading surfaces and popup yielding resolve the previous round's concrete craft reservations.                                                              |
| Motion quality       |     9 | Purposeful camera behaviour, reduced-motion paths and supplied sampled M3 cadence support the experience; sustained physical-device performance is not certified. |
| Arabic & RTL         |     9 | Current Arabic phone/tablet hierarchy and source qualification are coherent. Native Gulf-reader validation remains unestablished.                                 |
| Trust & evidence     |     9 | Original amounts, basis/date and explicit Demo status remain readable; approximate/non-routing qualifications are retained.                                       |
| Discretion & privacy |     9 | The existing tested handoff preserves a visible editable draft without implicit enquiry or false urgency.                                                         |
| Developer appeal     |     9 | Accurate reference treatment and restrained presentation support a serious private-office demonstration.                                                          |
| Speed                |     8 | Green baseline Home/Explore LCP2.243/2.374s remains above two seconds. High Lighthouse scores do not satisfy that budget.                                         |
| Accessibility        |     9 | Real target selection, keyboard recovery and current automated checks support the repaired flow; complete AT validation remains absent.                           |

**Persona average: 8.92/10. Minimum: 8.** This contributes to the **board-wide** average≥9/minimum≥8 gate; an individual mean below9 is not independently the board decision. The measured loading-budget miss remains open regardless of that aggregate.

## Three delights

1. The cross-market distance can finally be read without deciphering a country label underneath it.
2. English and Arabic evidence now read like deliberate editorial panels, with no geographic lettering bleeding through.
3. Small visible markers retain their elegance while the tested invisible hit area makes selection easier.

## Three remaining problems / limits

1. **Loading budgets remain unmet.** The green baseline meets the existing90 score floor; it does not establish sub-two-second LCP or the later95 Home/Project target. Current-polish CI was pending. Earlier hardware/software timing failures remain valid evidence.
2. **Initial geographic teaching remains restrained.** The [dark tablet map](../media/v7/explore-ar-dark-1024.png) gives a newcomer few named areas before interaction. A careful naming hierarchy would improve orientation without adding more panels.
3. **The phone reading window is still dense.** In [Arabic evidence](../media/v7/signature-ar-evidence.png), composer, methods and navigation consume much of the expanded sheet. It is usable, but future responses should not add permanent controls that further reduce the evidence window.

**Verdict:** “The specified interaction and craft repairs now hold in fresh evidence. I support the Stage 2 craft direction while retaining an explicit speed dissent and the remaining validation limits.”

Limits: simulated self-review, no live browser this round, no physical M1/phone, field INP, native-reader panel or complete screen-reader certification. Local captures, hosted baseline tests and pending polish CI are distinct evidence sets.
