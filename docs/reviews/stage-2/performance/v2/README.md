# Stage 2 production performance — v2 baseline

This production build passed compilation and the preceding full regression (49 unit tests, 36 mock evals, 25 browser cases). Its performance gate failed. These original reports are retained before optimization.

| Page          | Performance | Accessibility | Best practices | SEO |     LCP | Total blocking time |
| ------------- | ----------: | ------------: | -------------: | --: | ------: | ------------------: |
| Home          |          49 |           100 |             96 | 100 | 5228 ms |             3371 ms |
| Search        |          94 |           100 |             96 | 100 | 3088 ms |               21 ms |
| Explore       |          72 |           100 |             96 | 100 | 2330 ms |             1406 ms |
| Arabic detail |          94 |           100 |             96 | 100 | 3018 ms |               26 ms |

Lighthouse's mobile simulation measured these scores on a local production server. Home script attribution identifies about 4.80 seconds in the MapLibre chunk, including several long tasks. The repair targets detail that is invisible at the current geographic scale, not a delayed initialization timer or a reduced test threshold.

The independent [render-cadence recording](../../media/performance-v2/performance.json) used headless Chrome with the Apple M3 Metal renderer. Each viewport supplied 35 consecutive active-motion render intervals: median 16.5 ms; p95 17.7 ms at 1440px and 18.7 ms at 390px; no interval exceeded 33.34 ms. Browser RAF median was 16.7 ms. The 390px case is viewport emulation on this same laptop, not a physical phone. These samples do not certify sustained GPU presentation, M1 hardware or a mid-range phone. LCP and input responsiveness remain separate budgets.
