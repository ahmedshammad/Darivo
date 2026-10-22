# Stage 2 — inline CSS production measurement

Same Lighthouse script and settings as v4; current production build includes the absolute-padding comparison repair and Next's documented experimental `inlineCss` option.

| Page    | Performance |         LCP | Total blocking time | CLS |
| ------- | ----------: | ----------: | ------------------: | --: |
| Home    |          99 | 1,806.94 ms |              124 ms |   0 |
| Explore |          96 | 2,329.38 ms |              151 ms |   0 |

Accessibility is 100, best practices 96 and SEO 100 on both pages. [Home report](home.json) and [Explore report](explore.json) preserve full results. Home now meets the two-second LCP target in this run; Explore still does not. This is not a complete stage acceptance result or a physical-phone test.

The installed Next16 `inlineCss` guide describes the trade-off: render-blocking CSS requests are removed, but styles are duplicated in the initial HTML and RSC payload and cannot be cached independently. The option applies globally and remains experimental. No content was hidden, no rendering timer added and no audit setting changed. Home's transferred HTML rose from about22.6 KB to41.7 KB; Explore rose from22.4 KB to45.3 KB. Both pages have no remaining render-blocking stylesheet entries in this run.

Explore's measured LCP element is its server-rendered heading. Observed LCP is45.7 ms on loopback; the reported2.329 seconds is Lighthouse's mobile network/CPU simulation. Pre-LCP React work is still present; further map deferral would not address this headline's critical path. The separate v4 cadence evidence and its M3-only limitations remain unchanged.
