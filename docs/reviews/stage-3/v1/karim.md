# Karim Hassan · Stage 3 first review

This is a **simulated self-audit**, not an interview with Karim or an independent endorsement. I implemented portions of the bilingual parser and execution evaluations. Those contributions are disclosed because technical familiarity can bias a review. Scores address Stage 3's comparison, evidence and conversational tasks; later dossiers, completed transactions and developer portals are outside this review.

## Evidence and journey

I inspected English/Arabic production captures in both themes at 390/1024/1440 widths, and sampled frames from both Karim recordings. The completed [v2 manifest](../media/v2/manifest.json) contains 48 states with no page errors or overflow. It also contains **16 serious mobile target-size findings**, all involving zoom-out partly hidden by the sheet. No browser interaction was performed for this review; v1 failed-preflight screenshots are excluded.

1. **Describe both purposes — works structurally.** [English desktop response](../media/v2/karim-en-light-1440.png) retains the North Coast/2028/Dubai request and draws the two-market connection.
2. **Read the comparison — useful after scrolling.** At about 8 seconds in [the English recording](../media/v2/karim-en.webm), the [comparison frame](../media/v2/review-frames/karim-en-08s.png) exposes SouthMED and ORLA together: EGP 91,200,000 and AED 57,300,000, different completion evidence and explicit qualifications.
3. **Inspect the map and Brief on mobile — available, not immediately visible.** [Arabic response](../media/v2/karim-ar-light-390.png) initially shows no comparison facts. The [six-second recording frame](../media/v2/review-frames/karim-ar-06s.png) shows an editable Brief; [eight seconds](../media/v2/review-frames/karim-ar-08s.png) shows both endpoints after collapsing the sheet. The line states kilometres, not invented driving minutes.

The [validation checkpoint](../validation/README.md) reports 251 native tests, 91 parser cases and 388 authorized execution cases/548 turns with zero safety counters. This supports source and currency handling, not independently current market truth. The real provider was skipped. The full browser run had one legacy failure followed by a repaired focused pass; current hosted CI is not credited. This capture does not demonstrate my complete USD/GBP-display/EGP-payment or payment-plan follow-up journey, so I do not claim to have visually validated those controls. The production Lighthouse supplement below now measures LCP and lab blocking time; field INP, physical devices, native Arabic and full AT remain unproven.

_Simulated perspective: keeping each market's original currency is useful to me. I want the actual comparison first, with conversion detail available when I need it, rather than repeated price paragraphs before I can decide what to investigate._

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                               |
| -------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| First-5-seconds wow  |   8.5 | Restrained entry and two-shore geography are appealing; mobile spends its first answer screen on introductory text.                                    |
| Originality          |     9 | The visible cross-market connection gives the conversational workspace a distinctive identity.                                                         |
| AI-first             |   8.5 | One request creates both market results and a comparison; finding the useful comparison still requires scrolling.                                      |
| Map experience       |     9 | Both endpoints and a distance connection are visible after the mobile map action; desktop spatial context is strong.                                   |
| Visual craft         |   8.5 | Consistent typography and themes; comparison repeats Price/Original price and compresses their qualifications.                                         |
| Motion quality       |     8 | Sampled transitions preserve the task and reveal the map; no fresh continuous cadence measurement is established.                                      |
| Arabic & RTL         |   8.5 | Mirrored hierarchy is coherent; long Latin currency/rate strings and source names create dense mixed-direction lines.                                  |
| Trust & evidence     |     9 | Native EGP/AED, dated static-Demo FX and reported completion qualifications survive comparison. No live-offer implication.                             |
| Discretion & privacy |     9 | Guest persistence is disclosed; execution and separate native tests support scoped access and confirmation boundaries.                                 |
| Developer appeal     |   8.5 | Both named projects retain identity and evidence, but dense repeated price copy weakens their presentation.                                            |
| Speed                |     7 | Current production mobile Lighthouse: performance 74, LCP 3252.7ms and TBT 775.5ms. LCP materially exceeds the strict 2s budget; TBT is not field INP. |
| Accessibility        |     7 | The expanded mobile sheet obscures zoom-out in all 16 mobile states; full AT testing remains open.                                                     |

**Mean 8.3750; minimum 7. This review does not pass the stage gate.**

## Three delights

1. The first request actually produces an Egypt/UAE comparison, rather than requiring a second comparison command.
2. Original prices stay attached to their markets; conversion is explicitly indicative, static and dated.
3. The comparison distinguishes targeted 2028 first deliveries from an expected 2027 completion and retains the need for confirmation.

## Three problems

1. **Answer priority:** mobile gives the repeated heading, echoed request and generic preface the entire initial reading pane. Put the generated comparison or its concise summary ahead of that repetition.
2. **Comparison density:** the recording shows both “Price” and “Original price,” including near-concatenated amount/qualification text and an eight-decimal FX rate. Use one readable original-price row with clearly separated basis, and reveal calculation detail on demand.
3. **Control clearance:** the partially hidden zoom-out control fails the production target-size check. Ensure sheet state and map controls share a consistent usable region.

**Verdict:** The cross-market reasoning is useful and the currency evidence credible, but mobile answer hierarchy, comparison readability and control clearance need another iteration.

## Production performance supplement

The current [mobile production Lighthouse report](/tmp/darivo-stage3-concierge-lighthouse-v1.json) for `/en/concierge` records **performance 74, LCP 3252.7ms, TBT 775.5ms and CLS 0**; accessibility is 100, best practices 96 and SEO 100. Speed therefore falls from 8 to **7** for the measured LCP miss and substantial lab main-thread blocking, not to influence the board average. The original unmeasured-speed basis is superseded.

Lighthouse's accessibility score covers its audited state and does not erase the 16 expanded-mobile target-size failures in the matrix; Accessibility remains 7. This is a local production lab result, not physical-phone/M1, field-INP or native-Arabic certification. No other score changes.
