# Hosted validation — evidence and comparison polish

[GitHub run 39813759238](https://github.com/ahmedshammad/Darivo/actions/runs/39813759238), commit `93103bcdec7e2accfdf3a367a194a767e473a5a7`, completed successfully. All configured steps passed: formatting, lint, types, unit tests, evals, browser tests, build and production Lighthouse. This run includes opaque evidence surfaces, separated distance labels and removal of the redundant selected popup. It predates the route-scoped loading and CSS work.

| Route     | Performance | LCP ms | TBT ms |
| --------- | ----------: | -----: | -----: |
| home      |          94 | 2330.6 |  231.5 |
| explore   |          93 | 2354.5 |  272.0 |
| search    |          94 | 2854.9 |  144.0 |
| detail-ar |          92 | 3014.7 |  148.0 |

The CI score floor passed. The two-second LCP budget remains unmet; no M1, physical-phone, field-INP or native-reader certification is implied.
