# Karim Hassan · Stage 3 fourth review

This is a **simulated contributor review**, not an independent client endorsement. I contributed parser/evaluation work, named-project targeting, presentation copy and the currency test/capture harness assessed here. That involvement limits independence. The review covers Stage 3 comparison and conversational follow-ups, not later transaction or partner services.

## Evidence and journey

Final source **0b304f7**, build v12, supplements the unchanged-component [v7 matrix](../media/v7/manifest.json) from 219204a/build v11: 60 clean states, six recordings and 18 supplements. The [completed currency evidence](../media/v7-currency-final/karim-currencies/manifest.json) adds 28 EN/AR checkpoints at 1440/390, with zero recorded errors or failures. The earlier failed standalone capture is preserved separately. I inspected representative actual images and signature checkpoints; I did not replay every video frame or operate a browser for this review.

_Simulated perspective: “Changing the currency I read in no longer leaves me guessing whether the original price or payment preference changed. A missing SouthMED schedule also stays missing after I inspect a different unit.”_

The [English GBP card](../media/v7-currency-final/karim-currencies/en-1440-gbp-prices.png) preserves SouthMED's EGP91.2m beside an indicative £1,411,911, dated static Demo FX and an optional calculation disclosure. The [Arabic USD phone card](../media/v7-currency-final/karim-currencies/ar-390-usd-prices.png) preserves that same native amount. The real streamed manifest retains EGP payment, Egypt's by-2028 deadline and the UAE objective throughout USD→GBP. The [GBP Brief screenshot](../media/v7-currency-final/karim-currencies/ar-390-gbp-brief.png) shows the checked display currency; its viewport alone does not show the payment selector, which is supported by the recorded Brief and focused assertions.

The [exact unit timeline](../media/v7-currency-final/karim-currencies/en-1440-exact-unit-timeline.png) preserves AED42.98m and 20/40/40 milestones. The [Arabic follow-up](../media/v7-currency-final/karim-currencies/ar-390-southmed-after-unit.png) then returns SouthMED's specific unknown schedule, without unrelated new cards or invented instalments. The retained Egypt deadline assumption remains explicit.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                  |
| -------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | Calm editorial type and two-market geography make the workspace immediately understandable.                               |
| Originality          |     9 | Conversation-driven comparison, geographic context and source-aware numerical components remain distinctive.              |
| AI-first             |     9 | The initial comparison and later named-subject lookup retain context; display and payment preferences remain separate.    |
| Map experience       |     9 | Named endpoints support cross-market orientation; reduced label clutter preserves the geographic reading path.            |
| Visual craft         |     9 | Optional FX/original-wording disclosures reduce narrow-column density while keeping amounts and basis visible.            |
| Motion quality       |     9 | Purposeful map/sheet transitions now have measured local cadence support; physical-device performance is still unproven.  |
| Arabic & RTL         |     9 | Arabic milestones lead the schedule; exact original wording remains accessible without repeated English in the main path. |
| Trust & evidence     |     9 | Actual currency checkpoints preserve native values, explicit FX provenance, scoped deadlines and unknown schedules.       |
| Discretion & privacy |     9 | Guest-storage disclosure and explicit confirmation boundaries remain clear, supported by scoped safety checks.            |
| Developer appeal     |     9 | Project identity survives comparisons and follow-ups, with restrained evidence-led presentation.                          |
| Speed                |   8.5 | Lighthouse99 and TBT61.5ms are strong lab results; LCP2183.545ms still exceeds the explicit 2s budget.                    |
| Accessibility        |     9 | Clean automated states and focused currency/control journeys support usability, without claiming full AT certification.   |

**Mean 8.9583; minimum 8.5. The aggregate board determines the stage gate.**

## Three delights

1. The complete USD→GBP display journey retains EGP payment and original EGP/AED values, closing the previous client-specific evidence gap.
2. Exact FX calculation and original schedule wording are available on demand; the main Arabic reading path is quieter.
3. SouthMED remains the subject after a different unit's timeline, with an honest missing-schedule answer and unchanged market objectives.

## Three problems

1. **Timeline identity:** the visible full timeline begins with the generic “Payment plan” heading. Include the exact fictional unit identity beside it so the schedule remains self-identifying after scrolling away from the request.
2. **Repeated assumption:** the Egypt end-2028 reminder appears even alongside the separate UAE unit schedule and the named SouthMED unknown. Its honesty is useful, but repeating it competes with the immediate answer; a persistent scoped Brief indication could reduce repetition.
3. **Remaining speed/proof limits:** strict LCP is still above2s. Physical-phone/M1 cadence, field INP, native human language and complete screen-reader journeys remain unproven.

[Final Lighthouse](../validation/lighthouse-presentation-v12.json) is 99/100/96/100, CLS0. [Motion-v1](../media/motion-v1/README.md) measures the unchanged motion implementation on source157bd02: 12 M3 windows, 418 moving intervals, medians16.5–16.9ms, one33.5ms and none above50ms. Phone-width emulation is not physical-phone evidence. Final mobile qualification has [64 clean checks](../media/v7-poi-final/manifest.json). Validation reports 303 tests, 444 execution cases/632 turns with all13 counters zero, two complete currency journeys and six final-source browser passes. Preceding source219204a CI39858147671 succeeded (72 browser passes/10 GPU skips and build); current0b304f7 CI39859530719 remains pending. Its hosted audits are separate from the final local result. Real-provider behavior and current external market truth remain uncertified.

**Verdict:** The currency and evidence-reading repairs close substantial workflow gaps; retain the experience while making timelines self-identifying and meeting the remaining speed budget.
