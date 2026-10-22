# Stage 2 — fifth scored review

**Failed: board 8.958/10, minimum 8.** All seven simulated reviews assess fresh production media/v7. The three named visual defects are resolved: country names and comparison distances are separate, evidence panels are opaque, and expanded mobile evidence replaces the redundant map popup. Four targeted production regressions and the complete capture matrix pass. Earlier failures and scores remain preserved.

The current build also has fresh bounded M3 cadence evidence: moving-frame medians 16.5–16.9ms, p95 18.2–19.8ms, no moving interval over 33.34ms. Each Explore full-window RAF series has one slower interval. These short probes do not certify M1, physical phones, sustained rendering or field INP.

Baseline hosted CI at d9b2faa is green, including 61 unit tests, 36 evaluations, 38 browser passes and three GPU-specific skips; all 41 browser cases pass on the local GPU. Hosted Lighthouse is Home 91 / Explore 93 / Search 94 / Arabic detail 92. The subsequent polish run at 93103bc remains pending at authoring. The score floor does not satisfy the separate two-second LCP or later Home/Project 95 target.

The remaining work is measurable startup performance and broader geographic teaching/reading refinement. Trace the simulated LCP critical path before choosing the next optimization. A plain-page software probe did not support a guaranteed post-paint double-RAF strategy, so no speculative scheduling change was shipped. Do not raise scores simply because the gate is close.

Stage 2 remains open; later stages have not started. Native Gulf-reader and full assistive-technology validation remain explicitly unproven.
