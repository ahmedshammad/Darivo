# Private Advisor — repaired Noir Atlas, capture v4

Simulated advisor review of Stage0. No real client was interviewed and no production handoff, secure thread or CRM is present in the prototype.

“I can recover what the client actually asked, which is the first condition of a useful handover.”

| Criterion            | Score |
| -------------------- | ----: |
| First-5-seconds wow  |     9 |
| Originality          |   9.5 |
| AI-first             |   9.5 |
| Map experience       |     9 |
| Visual craft         |     9 |
| Motion quality       |     9 |
| Arabic & RTL         |     9 |
| Trust & evidence     |     9 |
| Discretion & privacy |   9.5 |
| Developer appeal     |     9 |
| Speed                |   8.5 |
| Accessibility        |     9 |

## Three delights

1. [Karim's mobile Brief](../media/v4/advisor-en-expanded.png) now preserves both markets and purposes plus2028. This resolves the earlier reduction to a generic family-waterfront brief. “To clarify” is preferable to pretending a preference was supplied.
2. The original words remain inspectable in the reply. The selected market changes the map without erasing the other market; the concept openly identifies simulated interpretation. That creates a credible design for an advisor to question or correct later.
3. [Arabic mobile Map](../media/v4/c-map-ar-light-390.png) gives the Brief, market controls, geographic target and reply separate visible places. Expanding the reply is keyboard-operable and repositions the map target above the sheet. The source dialog returns focus after Escape.

## Three problems / carry-forward requirements

1. “Edit” currently returns to the composer. Stage3 must support individual Brief edits and visible reranking, including preserving multiple place alternatives and currency context.
2. [Desktop Map](../media/v4/c-map-en-dark-1440.png) communicates reasons and trade-offs, but a handoff still needs chronology, source freshness and client consent. These belong in the production advisor record, not in an assumed silent transfer.
3. Local text rendering is fast, but the map-readiness range reaches3.58s. A client on a slower network needs an intentional loading state and a usable2D/list alternative. The local render sample cannot certify the requested phone budget.

## Evidence and verdict

Reviewed selected v4 desktop/tablet/mobile matrix in both languages and themes; exercised EN/AR Karim flow at390 with reduced motion, keyboard sheet expansion and source-dialog dismissal. [Recorded observations](parent-interactions-v4.json) confirm context retention, no overflow and zero dialog axe violations. [Matrix quality](../media/v4/quality.json) reports zero Home/Map violations for all12 configurations. Human Gulf-Arabic and screen-reader validation remain distinct from this simulation.

**Verdict:** The chosen direction now carries useful context through the concept journey; build the actual consented handoff with the same precision.
