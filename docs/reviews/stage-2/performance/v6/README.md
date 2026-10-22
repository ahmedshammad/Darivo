# Stage 2 — shared payload reduction

Production v7, unchanged Lighthouse settings, all four tracked pages. The client preferences decoder removes the shared Zod dependency from initial hydration; Explore receives only the data it renders. Inline CSS remains enabled.

| Page          | Performance |         LCP | Total blocking time |      CLS |
| ------------- | ----------: | ----------: | ------------------: | -------: |
| Home          |          98 | 2,183.43 ms |              108 ms |        0 |
| Search        |          96 | 2,805.17 ms |               23 ms |        0 |
| Explore       |          96 | 2,329.53 ms |            142.5 ms |        0 |
| Arabic detail |          95 | 2,859.08 ms |               27 ms | 0.000832 |

Accessibility, best practices and SEO are 100 on every page. Full JSON reports are retained alongside this note. These scores pass the automated score floor, but none establishes the strict two-second LCP target. In particular, v5's 1.807-second Home result was not reproduced. This is simulated mobile Lighthouse on an M3 host, not field INP or physical M1/phone validation.

Next investigation: font discovery occurs after a large inline stylesheet and framework script links. Test normal HTTP Link font preloads, preserving locale alternates and the existing document preloads. Do not alter audit settings or hide content.
