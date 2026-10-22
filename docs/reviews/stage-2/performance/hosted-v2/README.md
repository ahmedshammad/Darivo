# Hosted CI performance failure — run39806595479

[Hosted run](https://github.com/ahmedshammad/Darivo/actions/runs/39806595479), commit `bc95a75`. Formatting, lint, types,53 unit tests,36 mock evals, full browser regression and production build passed. Lighthouse failed with unchanged thresholds and settings.

| Page          | Performance |         LCP | Total blocking time | Other categories |
| ------------- | ----------: | ----------: | ------------------: | ---------------- |
| Home          |          67 | 2,210.28 ms |          4,530.5 ms | 100/100/100      |
| Search        |          95 | 2,649.05 ms |              132 ms | 100/100/100      |
| Explore       |          66 | 2,356.25 ms |            5,668 ms | 100/100/100      |
| Arabic detail |          93 | 2,868.44 ms |            155.5 ms | 100/100/100      |

The Linux Chrome155 reports attribute the dominant post-LCP long tasks to the MapLibre chunk, including551/483ms Home tasks and962/582ms Explore tasks. Local M3 hardware measurements do not explain away this failure. A software-rendering bottleneck is a hypothesis requiring an actual capability probe; the reports alone do not record the GL renderer or isolate shader compilation.

Investigate the browser's standard major-performance-caveat mechanism and graceful geographic fallback. Any repair must apply to all affected users, preserve the map's interactions and limitations, and avoid CI/user-agent/audit-specific behavior. Keep hardware and software paths separately evidenced.
