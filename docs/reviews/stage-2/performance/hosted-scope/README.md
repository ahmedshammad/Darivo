# Hosted validation — first content and provider scope

[GitHub run 39820219793](https://github.com/ahmedshammad/Darivo/actions/runs/39820219793), commit `e5a30522beb4cd836d6d103ddfa5c2798645e4d7`, completed successfully. Formatting, lint, types, unit tests, mock evaluations, browser tests, production build and configured Lighthouse checks passed. This run predates mobile evidence compaction and neighborhood orientation labels.

| Route         | Performance | LCP ms | TBT ms |
| ------------- | ----------: | -----: | -----: |
| Home          |          98 | 2233.1 |    108 |
| Explore       |          98 | 2219.2 |    100 |
| Search        |         100 | 1846.5 |   30.5 |
| Arabic detail |          94 | 3014.1 |     72 |

The configured CI floor passes. The strict two-second LCP budget remains open. These synthetic desktop-runner results do not certify field INP, physical-phone/M1 rendering, native Gulf wording or full assistive-technology behavior.
