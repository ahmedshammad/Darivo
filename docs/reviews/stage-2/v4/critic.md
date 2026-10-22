# Stage 2 v4 — The Critic

**Simulated persona self-review, not an independent human endorsement.** This agent contributed Explore and the comparison hit-target repair. Fourth scored iteration; current production evidence is `media/v6`. Prior reports and failed evidence remain unchanged. Stage 2 discovery, map interaction and source presentation are in scope; later agent/office features are not being certified.

The interaction repair is now convincing. The nearby Arabic endpoints are visible, comparison points have tested hit areas, and opening the sources gives the explanation its own readable space. I retain a craft reservation about map labels and a clear dissent on the unmet loading target.

## Inspected sequence

1. **Arrival — strong.** [English Sand desktop](../media/v6/arrival-en-light-1440-viewport.png) and [Arabic light phone](../media/v6/arrival-ar-light-390-viewport.png) preserve the globe, deliberate typography and one conversational entry.
2. **Explore — clear, with sparse geographic teaching.** [Arabic dark tablet](../media/v6/explore-ar-dark-1024.png) keeps the reference qualifier and source legible. The map's road network is clear, but few named areas help a newcomer orient at the initial zoom.
3. **Compare — repaired.** [Nearby Arabic map](../media/v6/signature-ar-comparison-map.png) places both endpoint circles between the story and comparison controls. [Cross-market English map](../media/v6/signature-en-comparison-map.png) frames both coasts. Supplied passing `e2e/atlas-targets.spec.ts` checks actual pointer clicks 20px from both marker centres in EN/AR, outside the visible glyph but inside the 22px-radius target. This is stronger evidence than the earlier clearance-only checks.
4. **Evidence — orderly.** [Arabic project evidence](../media/v6/signature-ar-evidence.png) opens with Back visible and clearly distinguishes the fictional Demo project and native-currency amount.
5. **Sources and fallback — repaired in tested states.** [Arabic software disclosure](../media/v6/manual/ar-375-software-02-disclosure-top.png) and [English forced-fallback disclosure](../media/v6/manual/en-390-forced-02-disclosure-top.png) show the full qualifications without competing controls. The [eight-case manual check](../media/v6/manual/README.md) records keyboard opening/closing, no sampled occlusion and restored comparison controls. [Software Home](../media/v6/manual/en-375-software-00-arrival.png) clearly explains the regional 2D mode.
6. **Completed journey — bounded proof.** [EN](../media/v6/signature-en.webm) and [AR](../media/v6/signature-ar.webm) recordings are complete. I inspected their checkpoint images and completion evidence, not independent continuous playback. Supplied targeted production tests pass, including hit selection, source disclosure and software fallback.

The [24-state matrix](../media/v6/manifest.json) has WebGL in every state; it and the [eight forced-fallback Home states](../media/v6/fallback-manifest.json) report zero axe violations, errors or overflow. Parent reports 61 unit tests and 36 mock evaluations with zero leaks. Hosted CI for `d9b2faa` was pending at review time. These are bounded checks, not a general accessibility or deployment certificate.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                                             |
| -------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| First-5-seconds wow  |     9 | Current desktop and Arabic phone arrivals give the geographic proposition a strong opening.                                                                                          |
| Originality          |     9 | Globe, conversation and place relationships remain distinct from a property portal.                                                                                                  |
| AI-first             |     9 | Stage 2 demo guidance visibly drives spatial state and retains unverified requirements; full agent reasoning is not falsely claimed.                                                 |
| Map experience       |     9 | Nearby and cross-market framing now work in the inspected states; enlarged targets have actual offset-click evidence.                                                                |
| Visual craft         |   8.5 | Type and panel composition are strong. Cross-market distance text still competes with country labelling; the default dark map has a weak area-name hierarchy.                        |
| Motion quality       |     9 | Purposeful camera transitions, reduced-motion alternatives and supplied short M3 cadence evidence support the demonstration; sustained physical-device performance remains unproven. |
| Arabic & RTL         |     9 | Arabic layout and commercial qualifications hold across inspected phone/tablet states. No native Gulf-reader panel is claimed.                                                       |
| Trust & evidence     |     9 | Basis, date, native amount and demo distinction remain clear; source disclosure now exposes the full approximate/non-routing explanation.                                            |
| Discretion & privacy |     9 | No false urgency or implicit enquiry; the existing tested handoff preserves an editable draft without automatic submission.                                                          |
| Developer appeal     |     9 | Accurate reference treatment and restrained presentation suit the proposed private office; live stock and future showcase are outside scope.                                         |
| Speed                |     8 | Hardware LCP2.179/2.328s and actual-software LCP3.331/2.937s remain above the required two seconds, despite good score-floor results.                                                |
| Accessibility        |     9 | Real WebGL offset selection, 44px fallback buttons, source keyboard recovery and automated checks repair the observed barriers. Full AT certification remains absent.                |

**Average: 8.88/10. Minimum: 8. Individual persona gate: FAIL (average below 9.0).** No rounding to a pass; the separate loading target remains unmet.

## Three delights

1. The nearby Arabic comparison finally shows both selected circles without its own controls hiding them.
2. Invisible interaction space improves touch selection while preserving the small, elegant visible markers.
3. The source explanation now yields a readable panel, including the reason for software fallback and the limits of its geography.

## Three problems / remaining limits

1. **Loading target unmet.** [Hardware v8](../performance/v8/README.md) reports98/96 performance and133.5/172ms TBT, but not sub-two-second LCP. [Actual software v2](../performance/software-v2/README.md) improves construction stalls while still missing LCP. Neither is physical-phone proof.
2. **Map label separation needs refinement.** In the [cross-market frame](../media/v6/signature-en-comparison-map.png), the distance competes with the Saudi Arabia label. Keep the selected relationship readable without suppressing useful geography.
3. **The selected map label can sit behind tools.** In [Arabic evidence](../media/v6/signature-ar-evidence.png), the small map popup sits behind the floating Map tools control. The full project name is readable in the evidence sheet, so this is not the earlier blocked-selection failure, but the secondary map label needs an anchor clear of the controls. Default dark-map area naming also remains sparse.

**Verdict:** “The interaction defects I identified are repaired in fresh evidence. I accept that progress; I still withhold a nine-average endorsement while loading and map-label craft remain below the brief.”

Limits: self-review and source/checkpoint inspection; no live browsing this round. Lighthouse is local simulated-mobile measurement. Software diagnostics deliberately select SwiftShader and do not stand in for unchanged hosted CI. M1, physical phones, field INP, native Arabic and complete screen-reader journeys remain unproven.
