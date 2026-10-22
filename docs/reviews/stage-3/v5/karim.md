# Karim Hassan · Stage 3 fifth review

This is a **simulated contributor review**, not an independent client endorsement. I contributed parser/evaluation work, named-project targeting, presentation copy and the currency test/capture harness assessed here. That involvement limits independence. The review covers Stage 3 comparison and conversational follow-ups, not later transaction or partner services.

## Evidence and journey

This is a bounded re-review of **cd92e4e / build v13**. I newly inspected [Arabic phone](../media/v8-timeline-final/timeline-ar-light-390.png), [Arabic tablet](../media/v8-timeline-final/timeline-ar-dark-1024.png) and [English desktop](../media/v8-timeline-final/timeline-en-dark-1440.png) timeline images. The exact authorized bilingual unit name now appears immediately below the payment heading; the first milestones remain readable. The [12-state manifest](../media/v8-timeline-final/manifest.json) records two real UI turns per state, zero errors/axe/overflow and no failures. This repair resolves the unnamed-timeline finding. It reinforces the existing 9-level presentation/evidence assessment without warranting a half-point rise; all twelve scores remain unchanged. Other observations carry forward from the explicitly scoped prior inspection.

The retained base evidence from **0b304f7**, build v12, supplements the unchanged-component [v7 matrix](../media/v7/manifest.json) from 219204a/build v11: 60 clean states, six recordings and 18 supplements. The [completed currency evidence](../media/v7-currency-final/karim-currencies/manifest.json) adds 28 EN/AR checkpoints at 1440/390, with zero recorded errors or failures. The earlier failed standalone capture is preserved separately. I inspected representative actual images and signature checkpoints; I did not replay every video frame or operate a browser for this review.

_Simulated perspective: “Changing the currency I read in no longer leaves me guessing whether the original price or payment preference changed. A missing SouthMED schedule also stays missing after I inspect a different unit.”_

The [English GBP card](../media/v7-currency-final/karim-currencies/en-1440-gbp-prices.png) preserves SouthMED's EGP91.2m beside an indicative £1,411,911, dated static Demo FX and an optional calculation disclosure. The [Arabic USD phone card](../media/v7-currency-final/karim-currencies/ar-390-usd-prices.png) preserves that same native amount. The real streamed manifest retains EGP payment, Egypt's by-2028 deadline and the UAE objective throughout USD→GBP. The [GBP Brief screenshot](../media/v7-currency-final/karim-currencies/ar-390-gbp-brief.png) shows the checked display currency; its viewport alone does not show the payment selector, which is supported by the recorded Brief and focused assertions.

The [new named unit timeline](../media/v8-timeline-final/timeline-en-dark-1440.png) preserves AED42.98m and 20/40/40 milestones beneath “The Courtyard 001”; the [Arabic phone](../media/v8-timeline-final/timeline-ar-light-390.png) shows “دار الفناء 001”. The [Arabic follow-up](../media/v7-currency-final/karim-currencies/ar-390-southmed-after-unit.png) then returns SouthMED's specific unknown schedule, without unrelated new cards or invented instalments. The retained Egypt deadline assumption remains explicit.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                       |
| -------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | Calm editorial type and two-market geography make the workspace immediately understandable.                                                    |
| Originality          |     9 | Conversation-driven comparison, geographic context and source-aware numerical components remain distinctive.                                   |
| AI-first             |     9 | The initial comparison and later named-subject lookup retain context; display and payment preferences remain separate.                         |
| Map experience       |     9 | Named endpoints support cross-market orientation; reduced label clutter preserves the geographic reading path.                                 |
| Visual craft         |     9 | Optional FX/original-wording disclosures reduce narrow-column density while keeping amounts and basis visible.                                 |
| Motion quality       |     9 | Purposeful map/sheet transitions now have measured local cadence support; physical-device performance is still unproven.                       |
| Arabic & RTL         |     9 | Arabic milestones lead the schedule; exact original wording remains accessible without repeated English in the main path.                      |
| Trust & evidence     |     9 | Currency checkpoints preserve native values and explicit FX provenance; the new timeline also retains its freshly authorized subject identity. |
| Discretion & privacy |     9 | Guest-storage disclosure and explicit confirmation boundaries remain clear, supported by scoped safety checks.                                 |
| Developer appeal     |     9 | Project identity survives comparisons and follow-ups, with restrained evidence-led presentation.                                               |
| Speed                |   8.5 | Lighthouse99 and TBT61.5ms are strong lab results; LCP2183.545ms still exceeds the explicit 2s budget.                                         |
| Accessibility        |     9 | Clean automated states and focused currency/control journeys support usability, without claiming full AT certification.                        |

**Mean 8.9583; minimum 8.5. The aggregate board determines the stage gate.**

## Three delights

1. The complete USD→GBP display journey retains EGP payment and original EGP/AED values, closing the previous client-specific evidence gap.
2. Exact FX calculation and original schedule wording are available on demand; the main Arabic reading path is quieter.
3. The unit timeline now names its authorized subject, while the tested subsequent SouthMED lookup still gives an honest missing-schedule answer with unchanged objectives.

## Three problems

1. **Map label duplication:** the new [Arabic tablet view](../media/v8-timeline-final/timeline-ar-dark-1024.png) shows two nearby Palm Jumeirah labels. Geography remains understandable, but consolidating duplicate place labels would preserve the otherwise restrained presentation.
2. **Repeated assumption:** the Egypt end-2028 reminder appears even alongside the separate UAE unit schedule and the named SouthMED unknown. Its honesty is useful, but repeating it competes with the immediate answer; a persistent scoped Brief indication could reduce repetition.
3. **Remaining speed/proof limits:** strict LCP is still above2s. Physical-phone/M1 cadence, field INP, native human language and complete screen-reader journeys remain unproven.

[Retained Lighthouse v12](../validation/lighthouse-presentation-v12.json), not a new v13 measurement, records 99/100/96/100, LCP2183.545ms, TBT61.5ms and CLS0. [Motion-v1](../media/motion-v1/README.md) covers earlier source157bd02's unchanged motion implementation: 12 M3 windows/418 moving intervals, medians16.5–16.9ms, one33.5ms and none above50ms. Neither phone emulation nor these callbacks certify physical-device presentation or field INP.

Current validation reports **304 tests**, including forged/legacy/renamed/revoked timeline identity, both full currency browser journeys, and [444 execution cases/632 turns](../validation/execution-passing-v8.json) with all13 counters zero, including fresh authorized-name equality. CI39861066879 for cd92e4e is pending. Preceding0b304f7 CI39859530719 has passed browser checks and is building; source219204a's earlier run succeeded. Pending checks receive no credit. Native human Arabic, physical-phone/M1, full assistive-technology and real-provider validation remain open. Seeded source checks do not establish current external market truth.

**Verdict:** The named timeline resolves the specific identity finding; retain the workflow while reducing repeated context and meeting the remaining speed budget.
