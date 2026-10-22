# Stage 2 capture v2 — inspection before scored review

The production capture completed all 24 Home/Explore configurations, eight forced-WebGL-unavailable Home states at 375/390px, and both English/Arabic mobile signature recordings. The manifests report zero page errors, axe violations or horizontal overflow. These automated results do not establish visual correctness.

Manual inspection found three remaining defects to repair before the formal second review:

- `arrival-ar-light-1024-viewport.png`: the map-source disclosure intersects the helper beneath the composer. Raise the tablet composer while retaining the mobile override and visible attribution.
- `fallback-arrival-ar-dark-375.png`: overlapping text inside the fallback notice needs a stacking/layout diagnosis.
- `signature-ar-comparison.png` and `signature-ar-evidence.png`: the comparison is created above the current sheet scroll position, and evidence opens with its back action out of view. Reveal the comparison after the second selection and reset the sheet before focusing evidence.

The completed recordings remain useful interaction evidence, but these findings prevent treating v2 as the accepted final visual pass. A repaired capture will be kept separately. No persona scores have been assigned to this intermediate capture.

Production performance is recorded separately in `../../performance/v4/README.md`: Home 97 and Explore 90, with LCP still above the two-second brief target. The local M3 cadence report is in `../performance-v4/performance.json`; it does not certify M1 or physical-phone performance.
