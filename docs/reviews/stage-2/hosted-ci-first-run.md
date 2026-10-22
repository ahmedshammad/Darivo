# First hosted Stage 2 run — failure retained

[Run39801016055](https://github.com/ahmedshammad/Darivo/actions/runs/39801016055) tested commit `c9f5aab227f1d94f40dfd5bee775299741ca0469`. Database setup, formatting, lint, types, unit tests and evals passed. Browser results were25 passed /1 failed; build and Lighthouse were not reached.

The failed Arrival test successfully observed its typed-intent camera move, then pressed Enter. Its five-second URL assertion expired while the development server was compiling Explore for the first time. The retained trace shows an actual `/en/explore?...&_rsc=...` request beginning at trace time124086.792 ms, followed by `[Fast Refresh] rebuilding` at124832.801 ms. The request remained pending with no response when the assertion ended at129305.012 ms. This was not a WebGL initialization failure or a missing form submission.

The scoped navigation assertion now allows15 seconds for this development compilation. Production load budgets and Lighthouse settings remain unchanged. The next hosted run must prove this diagnosis; a local pass alone is insufficient. The original trace and error context are retained in the run's `browser-regression-evidence` artifact, with local diagnostic copies in `/tmp/darivo-stage2-ci-browser`.
