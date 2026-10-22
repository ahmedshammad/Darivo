# Rendering probe — orientation and reading revision

Production build of c5033b8, Chrome headless using Apple M3 Metal, device pixel ratio1. Each probe records a three-second window containing a camera movement. Source data and raw timestamps are in `performance.json`; `scripts/measure-atlas.mjs` reproduces the method.

| View        | Moving samples | Moving median ms | Moving p95 ms | Moving intervals >33.34ms | Full-window RAF intervals >33.34ms |
| ----------- | -------------: | ---------------: | ------------: | ------------------------: | ---------------------------------: |
| Home1440    |             35 |             16.6 |          19.4 |                         0 |                                  1 |
| Home390     |             35 |             16.4 |          19.8 |                         0 |                                  0 |
| Explore1440 |             36 |             16.7 |          17.9 |                         0 |                                  0 |
| Explore390  |             35 |             16.6 |          17.3 |                         0 |                                  0 |

No page errors were recorded. The sampled camera movement runs near60Hz; the full Home desktop window includes one slower frame. This is bounded local evidence, not a sustained-load, physical-phone, M1 or field-INP certification. It does not measure LCP or demonstrate the strict two-second loading budget.
