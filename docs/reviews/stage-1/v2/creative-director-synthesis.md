# Stage 1 — repaired foundation review

The seven simulated reviews now average **9.065/10**, with minimum criterion **8.5**. The design review gate passes. Stage1 as a whole remains open until the production regression and hosted CI checks pass.

| Persona         |  Mean |
| --------------- | ----: |
| Sheikha         | 9.125 |
| Karim           | 9.083 |
| Elena           | 9.083 |
| Rajiv           | 9.083 |
| Head of Sales   | 9.000 |
| Private Advisor | 9.083 |
| Critic          | 9.000 |

The exact result is calculated over all84 criterion scores in [scorecard.json](scorecard.json). The initial8.839 round and its captures remain intact. No blanket-perfect review was used.

## Why the result changed

The composer/Brief contract now survives realistic long English and Arabic requirements without clipping. Command search receives focus, ArrowUp wraps correctly, and section selection transfers focus to the visible heading. Numeral preference covers authored areas, dates, years, FX and money. The mobile sheet visibly grows from573.91px to759.59px and still restores focus on Escape. Supporting financial/source text is larger and horizontal comparison has an explicit movement hint.

These repairs were verified by independent reviewer probes and four focused browser regressions, not simply inferred from the implementation. The refreshed [v3 matrix](../media/v3/manifest.json) contains12 configurations with zero axe violations, page errors or overflow, plus EN/AR signature recordings. All16 existing application browser cases also pass. Forty native-PG16 tests and36 mock evals establish the current data/security baseline.

## Remaining requirements

- Mobile comparisons need testing with four actual properties and clear row identity in Stage4. A two-column specimen does not prove that whole workflow.
- Unknown-date, stale and low-confidence references must remain legible in real stories and the freshness monitor. Reference import is not independent verification of current market truth.
- The later persistent Brief, actual Concierge tools and spatial renderer must earn their own functional and performance evidence. Component scores do not certify those unbuilt features.
- Native Gulf-Arabic editorial review, physical-phone measurements and assistive-technology validation are distinct from this simulated board.

The first Stage1 production Lighthouse regression returned Home88/Search86/Arabic detail94 for performance. The language switch no longer preloads the other locale, and the shared layout no longer preloads an unused Arabic display font on every Arabic page. The rebuilt production gate passes at Home94/Search91/Arabic detail94, with accessibility100, best practices96 and SEO100. All four guide tests pass on production; language switching also passes. A combined development sign-in test cannot complete on production because quick demo login is deliberately absent there; its failure is retained in local-checks.json. Hosted CI remains pending. Do not start Stage2 until hosted checks are green.
