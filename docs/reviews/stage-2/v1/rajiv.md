# Stage 2 v1 — Rajiv Mehta

Simulated persona review, 22 October 2026. I am applying Rajiv's investment lens, not impersonating an actual investor or claiming a user interview. Stage 2 covers Arrival and the Living Map; production investment analysis and advisor operations are not being certified here. Review used the completed 24-state capture matrix and direct localhost:3000 interactions. No implementation changes were made during review.

> I would open this in a meeting. I would not yet repeat its comparison numbers to my investment team. One journey gives me two travel times for the same pair of projects.

## Flow inspected

1. **Arrival → Explore: strong.** The globe and restrained composer feel like a private research instrument. See [desktop Arrival](../media/v1/arrival-en-dark-1440-viewport.png) and [Sand Explore](../media/v1/explore-en-light-1440.png).
2. **Compare ORLA with Palace Villas Ostra: blocked on trust.** The live map line says 23.5 km / approximately 23 minutes; the panel says 23.5 km / approximately 35 minutes. Its assumption is 40 km/h, while map source copy uses 60 km/h. [Exact comparison moment](../media/v1/review-rajiv-comparison-conflict.png).
3. **Inspect reference evidence: promising, uneven.** Original AED currency, price basis, shell-and-core distinction, indicative wording and approximate coordinates are useful. The live source list repeated two URLs twice, once with “Basis not supplied” and once “Agent listing”; the screenshot records the upper evidence panel, with the duplicated rows observed in its accessibility tree. [Evidence panel](../media/v1/review-rajiv-source-panel.png).
4. **Mobile comparison and recovery: incomplete.** The formal signature run could not click the sheet handle because the comparison panel intercepted it. Raw videos are failed-flow evidence, not successful walkthroughs; parent log `/tmp/darivo-stage2-capture-v1-flows.log` records the interception. [Comparison checkpoint](../media/v1/signature-en-comparison.png).

## Part H scorecard

| Criterion            | Score | Evidence                                                                                                                                                                                                                       |
| -------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| First-5-seconds wow  |     9 | Centered globe, editorial type and one clear composer in `arrival-en-dark-1440-viewport.png`.                                                                                                                                  |
| Originality          |     9 | Globe-to-local geography and price columns avoid the usual listing-grid entry; `explore-en-light-1440.png`.                                                                                                                    |
| AI-first             |     8 | Mixed-market request moves the map and retains original words, while admitting unsupported filters; `review-advisor-mixed-brief.png`. Matching rationale remains generic.                                                      |
| Map experience       |   7.5 | Actual geography and price symbols are useful, but conflicting comparison labels and sparse dark-map context interrupt understanding; `review-rajiv-comparison-conflict.png`.                                                  |
| Visual craft         |   8.5 | Strong hierarchy in Sand and Noir; comparison overlaps the open source panel in `review-rajiv-comparison-conflict.png`.                                                                                                        |
| Motion quality       |     8 | Live selection moved to the Palm and settled; `review-rajiv-source-panel.png` records the destination. No claim of certified 60 fps.                                                                                           |
| Arabic & RTL         |     8 | Intentional Arabic heading and right-side layout in `explore-ar-dark-1024.png`; English reference basis remains embedded. Native Gulf-reader certification pending.                                                            |
| Trust & evidence     |     7 | Same distance has inconsistent time assumptions; source records need deduplication. Published reference versus availability distinctions are otherwise commendable.                                                            |
| Discretion & privacy |     9 | Evidence flow says no enquiry is sent automatically; no forced contact capture or urgency. This is interface observation, not a privacy/security certification.                                                                |
| Developer appeal     |   8.5 | ORLA receives an elegant project-level treatment with its price basis; `review-rajiv-source-panel.png`. No invented live inventory.                                                                                            |
| Speed                |     7 | Provisional: `manifest.json` records 14,948 ms map readiness for Sand tablet Arrival, which fell back, and 15,519 ms tile readiness for Sand mobile Arrival. These are development map timings, not LCP or production budgets. |
| Accessibility        |     8 | Matrix reports zero axe violations/overflow; selected evidence heading receives focus. Mobile sheet interception prevents calling the whole journey successful. Native screen reader and physical phone untested.              |

Mean **8.125/10**, minimum **7**. This review does not pass the Part H gate.

## Top three delights

1. The source's native currency and price basis are beside the figure, rather than hidden in a disclaimer.
2. Columns are explicitly price symbols, not fabricated building heights; reference locations are marked approximate.
3. Real and Demo projects are visibly distinguished. “Price on request” and absent dates are admitted rather than filled in.

## Top three problems and repairs

1. **P1 — Unify comparison mathematics and scope.** Use one speed assumption everywhere. For cross-country/very long pairs, show straight-line distance without a pseudo-driving time. Fit all compared endpoints into view. Evidence: comparison moment above.
2. **P1 — Keep comparison and evidence usable together.** Source text is covered on desktop; mobile comparison blocks the sheet handle. Stack or mutually dismiss panels and preserve an accessible close path. Evidence: comparison moment and failed signature checkpoint.
3. **P2 — Make evidence records editorially consistent.** Deduplicate URL/date records, retain the supplied source basis, and distinguish a missing field from a separate unknown source. Supplemental live evidence inspection; upper panel captured above.

**Verdict:** A compelling investment discovery surface; repair contradictory numbers and obstructed evidence before another board review. Production performance, Apple M1/physical-phone behavior, investment suitability and native-reader quality remain unverified.
