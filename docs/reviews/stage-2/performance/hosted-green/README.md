# Hosted green validation — worker and interaction repair

[GitHub run39811918397](https://github.com/ahmedshammad/Darivo/actions/runs/39811918397), commitd9b2faab8d44866c4d46e2e5e92ee88d64011439. All unchanged CI stages passed: install/migration/seed, formatting, lint, typecheck,61unit tests,36mock evaluations with zero off-market leakage, browser regressions, production build and Lighthouse. Real-provider evaluations remain skipped without a key.

Hosted browser results:38passed,3GPU-specific cases skipped after the application positively identified software rendering. Those three cases pass locally on actual M3 WebGL (full local suite41/41). The general map interaction tests run against whichever actual supported mode is present; unexpected fallback still fails. The dedicated real-SwiftShader interaction case also passed.

| Route         | Performance |   LCP ms | TBT ms | Other categories |
| ------------- | ----------: | -------: | -----: | ---------------- |
| Home          |          91 | 2242.786 |    325 | 100/100/100      |
| Explore       |          93 | 2374.246 |    259 | 100/100/100      |
| Search        |          94 | 2849.886 |    140 | 100/100/100      |
| Arabic detail |          92 |     3017 |    154 | 100/100/100      |

This meets the unchanged existing CI floor of90. It does not meet the later Stage6 Home/Project95score target or the separate two-second LCP requirement. Earlier hosted performance failures remain preserved. Subsequent label/popup/opaque-panel polish was not part of this commit and requires its own validation.
