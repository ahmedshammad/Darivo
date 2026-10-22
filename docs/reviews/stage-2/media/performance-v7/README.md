# Final Stage 2 build — bounded local cadence

Production v13 on local Apple M3 Metal, headless Chrome, DPR 1. Four three-second probes cover Home and Explore at 1440 and 390px. They trigger typed geographic intent and record actual map render events alongside requestAnimationFrame intervals.

Moving-frame medians range from 16.5 to 16.9ms; p95 ranges from 18.2 to 19.8ms. No moving interval exceeds 33.34ms. Each Explore full-window RAF sample contains one interval above that threshold; both Home windows contain none. All four probes report zero page errors. Raw intervals, graphics context and summaries remain in performance.json.

This supports near-60Hz movement in these bounded local samples. It does not establish M1 or physical-phone performance, sustained rendering, field INP, or the separate first-content LCP target.
