# Stage 2 — early font discovery experiment (reverted)

Normal HTTP Link font preloads were appended in the locale proxy so fonts could be discovered before inline CSS and framework scripts. Response inspection confirmed both preload and next-intl alternate-language links. Existing document preloads remained; no audit settings or displayed content changed.

| Page    | Performance |         LCP | Total blocking time | CLS |
| ------- | ----------: | ----------: | ------------------: | --: |
| Home    |          98 | 2,190.33 ms |              126 ms |   0 |
| Explore |          97 | 2,329.48 ms |            125.5 ms |   0 |

All other categories scored 100. Relative to v6, LCP did not materially improve. The header experiment was therefore removed rather than retaining unproven extra preload behavior. Reports remain as failed-hypothesis evidence. The two-second simulated LCP target remains open for performance hardening; the score floor passing does not establish that timing target or physical-device performance.
