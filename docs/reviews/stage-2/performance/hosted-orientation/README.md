# Hosted validation — orientation and evidence reading

[Run39824920382](https://github.com/ahmedshammad/Darivo/actions/runs/39824920382) passed at commit c5033b81bb03adaff68b98c54683c57de297cbba. Formatting, lint, types,67unit tests,36mock evaluations,49browser tests, production build and configured Lighthouse checks passed. Seven GPU-dependent browser cases were skipped on the software-rendered runner; local hardware-browser coverage is retained separately. No real-provider key was configured.

| Route         | Performance | LCP ms | TBT ms |
| ------------- | ----------: | -----: | -----: |
| Home          |          97 | 2256.6 |    158 |
| Explore       |          96 | 2254.4 |    175 |
| Search        |          95 | 2798.1 |     81 |
| Arabic detail |          93 | 3014.7 |    101 |

The configured score gate passes. The strict LCP<2s goal remains unmet; these measurements do not certify field INP or physical-device rendering. The seventh scored review retains conservative speed scores. The second run for the same push,39824917165, also succeeded.
