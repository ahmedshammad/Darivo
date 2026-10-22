# Software fallback v2 — worker preflight

The actual OffscreenCanvas renderer is now checked in a short-lived worker before importing or constructing MapLibre. Only a coarse capability crosses that boundary. Unknown, blocked, absent or timed-out capabilities retain the normal path; the post-constructor safeguard remains. There is no user-agent, headless, CI or audit branch.

Same Lighthouse mobile settings as the ordinary script; only the graphics backend was explicitly selected with SwiftShader flags. This diagnostic does not certify a physical phone or unchanged hosted CI.

| Page    | Performance |   LCP ms | TBT ms | Other categories |
| ------- | ----------: | -------: | -----: | ---------------- |
| Home    |          90 |  3331.27 |     73 | 100/100/100      |
| Explore |          94 | 2936.508 |     77 | 100/100/100      |

The prior failed software-v1 reports remain preserved. Worker preflight removes the large main-thread construction stall in this run, while the two-second LCP requirement remains unmet. Production interaction tests pass with real SwiftShader in EN and AR: disclosed 2D geography, typed camera changes, Explore handoff and evidence access. GPU-host tests separately pass actual offset clicks on the enlarged comparison targets.
