# Scoped provider experiment

Production v16 keeps one preferences provider above all routes and moves full legacy translations and navigation into the legacy route group. Home and Explore use their existing authored bilingual copy. The layout user lookup is memoized only within the server render; current role and display preferences still come from the database. Error copy is independent of the full translation provider. Sign-out retains NextAuth behavior, with its client library loaded on click.

The Home response measured 129,531 raw / 26,434 gzip bytes, compared with v14 176,407 / 38,555 and CSS-only v15 147,177 / 32,671. The combined local compressed document reduction is 31.4%; these measurements exclude HTTP overhead and are not additive resource totals. All eight sampled computed-style/geometry comparisons remained identical to v14 (Home/Explore, EN/AR, 390/1440, dark, reduced motion).

| Page    | Performance |   LCP ms | TBT ms | Other categories |
| ------- | ----------: | -------: | -----: | ---------------- |
| Home    |          98 | 2187.722 |   99.5 | 100/100/100      |
| Explore |          96 | 2189.386 |  182.5 | 100/100/100      |

This preserves the earlier first-content improvement and reduces initial payload, but does not meet the strict two-second LCP target. No audit settings changed. Physical-phone/M1 performance, field INP, native Gulf editorial and full assistive-technology validation remain unproven. A subsequent review identified that standalone locale boundaries needed their own main landmark; production v17 adds those landmarks and an h1 for errors. That accessibility-only correction is not in these v16 raw reports.
