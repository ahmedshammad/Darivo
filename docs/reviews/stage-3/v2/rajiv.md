# Stage 3 v2 — Rajiv Mehta

I can now see the arithmetic I asked for. That is a meaningful improvement. I still need the system to answer a named-project question without taking me through unrelated inventory, and the map must help me identify what I am comparing.

## Inspected journey

1. **Compare — clearer.** [Karim comparison](../media/v5/karim-en-map.png) separates original currencies, qualifications and delivery evidence without the former duplicate price row.
2. **Calculate — repaired.** [Scenario result](../media/v5/supplement/en-calculation.png) displays 2.21%, rent AED 100,000, costs AED 10,000 and vacancy 5%, explicitly as supplied assumptions.
3. **Inspect payment evidence — mixed.** [Exact demo-unit schedule](../media/v5/supplement/en-unit-timeline.png) works; [named reference request](../media/v5/supplement/ar-reference-timeline.png) instead starts with ORLA before eventually admitting the SouthMED schedule is unavailable.
4. **Review an action — bounded.** [Guest save review](../media/v5/supplement/en-proposal.png) names the unit and portfolio and requires private access; it proves no completed signed-in write.

## Scorecard

| Criterion            | Score | Evidence                                                                                                 |
| -------------------- | ----: | -------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |   8.5 | The first result now reaches a price rather than an oversized introduction.                              |
| Originality          |   8.5 | Native-currency analysis and conversational geography form a distinctive workflow.                       |
| AI-first             |   7.5 | Calculation succeeds visibly; the SouthMED request still produces irrelevant leading output.             |
| Map experience       |     7 | Comparison names live in the table while the map shows clusters; settled local geography fails.          |
| Visual craft         |   8.5 | Price qualifications read cleanly; chart label collisions and repeated schedule labels remain.           |
| Motion quality       |     8 | Sampled transitions are purposeful, but settled destinations are not consistently useful.                |
| Arabic & RTL         |   8.5 | Arabic money, sources and assumptions remain legible; native validation is not established.              |
| Trust & evidence     |     9 | Original price, static FX and scenario assumptions are explicit; no reference installments are invented. |
| Discretion & privacy |     9 | Action review and tested authorization boundaries remain appropriately conservative.                     |
| Developer appeal     |   8.5 | Qualified source-backed projects appear professionally, though precision of request handling needs work. |
| Speed                |     8 | 99 performance is encouraging; 2.182s LCP still misses the explicit target.                              |
| Accessibility        |   8.5 | Current matrix is clean and chart tables provide numerical access; full AT is unproven.                  |

**Mean: 8.292; minimum: 7. This review fails the stage gate.**

## Three delights

1. The calculation answer is now visible, with all supplied scenario inputs rather than an unexplained yield.
2. The exact-unit timeline uses the stored 20/40/40 schedule and native amounts; a different unit without a complete plan correctly remains unknown.
3. The comparison preserves “targeted” and “expected” completion language and labels conversion as static Demo FX.

## Three problems

1. **Named payment-plan targeting is still wrong.** Both languages' [supplement manifest](../media/v5/supplement/manifest.json) show three project-card groups before the unavailable-plan notice. The problem is relevance and hierarchy, not fabricated installment data.
2. **Spatial identity is weak.** [Comparison map](../media/v5/karim-en-map.png) displays 5/4/2/18 clusters rather than named comparison endpoints. [Settled local geography](../media/v5/settled/elena-en-1440.png) is flat despite ready tiles. I cannot confidently orient an unfamiliar location from these states.
3. **Analytical labels need precision.** [Arabic chart](../media/v5/supplement/ar-chart.png) stacks several indices at one x-position; the table rescues exact values. “Source unknown” should say source basis is unspecified, and the payment schedule should avoid repeating identical labels.

The [current Lighthouse report](/tmp/darivo-stage3-lighthouse-v5/concierge.json) records performance **99**, LCP **2.182s**, TBT **51ms**, CLS **0**, accessibility 100, best practices 96 and SEO 100. This materially improves v1's 74/3.253s/775.5ms, but **LCP <2s remains unmet**. TBT is not field INP, and loading performance does not prove camera cadence.

## Evidence limits

This is a **simulated contributor self-review, not an independent human endorsement**. I contributed the shared contract, grounding/tools and recovery logic. I inspected current production stills across 1440/1024/390, EN/AR and both themes, signature checkpoints, investor supplements and settled-map diagnostics. Six recordings exist; I did not continuously play them or perform a fresh browser/native-reader session. This scores Stage 3, without penalizing future office/showcase features.

The [matrix manifest](../media/v5/manifest.json) has 60 states with zero recorded page errors, overflow or axe violations; this is not full WCAG certification. Supplied validation reports 275 native tests, 412 execution cases with all 13 safety counters zero, eight reading and nine public-flow browser regressions. Earlier `496a3f7` CI passed; reviewed `210f413` CI was pending at this review. Real-provider, physical phone/M1, native Gulf speech/editorial review, full assistive technology and field INP remain unproven. Guest proposal captures do not certify production signed-in confirmation.

**Verdict:** The arithmetic and evidence are substantially more usable; fix named-project targeting and map identity before relying on this for a complete comparison session.
