# Stage 2 — production performance v4

The targeted production Lighthouse rerun passes the **performance score ≥90** threshold: Home **97**, Explore **90**. It does **not** meet the separate **LCP <2.0s** brief target. This is performance evidence, not a declaration that the Stage 2 design gate passes.

| Version                  | Page    | Performance |            LCP | Total blocking time |   CLS |
| ------------------------ | ------- | ----------: | -------------: | ------------------: | ----: |
| [v2](../v2/home.json)    | Home    |          49 |     5,228.22ms |          3,371.49ms |     0 |
| [v2](../v2/explore.json) | Explore |          72 |     2,330.22ms |          1,405.50ms |     0 |
| [v3](../v3/home.json)    | Home    |          71 |     2,336.00ms |          1,728.50ms |     0 |
| [v3](../v3/explore.json) | Explore |          92 |     2,333.32ms |               290ms |     0 |
| [v4](home.json)          | Home    |      **97** | **2,340.72ms** |           **126ms** | **0** |
| [v4](explore.json)       | Explore |      **90** | **2,934.83ms** |           **237ms** | **0** |

Both v4 pages scored accessibility **100**, best practices **96**, SEO **100**. Accessibility audit scores are not WCAG certification. Explore LCP regressed in this run despite lower blocking time; report that variation rather than selecting only the better v3 result.

The automatic opening globe now draws actual bundled Natural Earth land/coastline and the real project cluster index. Local street layers start at zoom 5; deck starts for local columns or requested overlays; DEM starts at zoom 11 in a pitched view. Explore paints its basemap before adding deck at the first idle rendering boundary. Redundant worker data updates and multisampling were removed. The second repair replaced world-only GPU circle/text cluster labels with 44px keyboard-accessible HTML MapLibre Marker buttons, retaining native cluster counts and globe occlusion. One fill outline replaces the redundant coastline line shader. Local Explore layers are unchanged by that second repair. No audit detection, long startup timer, dependency patch or manual shader prewarming was used. [Diagnostic evidence and cold/warm limitations](../globe-diagnostic/README.md) are retained alongside the failed runs.

## Map motion and first local transition

[Raw three-second measurements](../../media/performance-v4/performance.json) cover Home/Explore at two viewport widths, including Home's first regional-to-local transition. Actual MapLibre render-event intervals while the camera was moving are separated from the browser's full-window RAF measurements.

| Route / width  | Moving intervals |  Median / p95 | Moving intervals >33.34ms | Full RAF intervals / >33.34ms |
| -------------- | ---------------: | ------------: | ------------------------: | ----------------------------: |
| Home / 1440    |               35 | 16.7 / 19.7ms |                         0 |                       179 / 0 |
| Home / 390     |               35 | 16.6 / 19.4ms |                         0 |                       179 / 1 |
| Explore / 1440 |               35 | 16.5 / 17.5ms |                         0 |                       179 / 0 |
| Explore / 390  |               36 | 16.6 / 17.9ms |                         0 |                       179 / 0 |

RAF medians were 16.7ms, with p95 16.7–16.8ms. Raw MapLibre data also contains non-moving render gaps; a renderer may be idle between events, so those gaps are not equated to dropped display frames. The full RAF sequence remains available to avoid concealing transition stalls. No page errors were recorded in these four runs.

## Limits

Lighthouse used local production on port 3001, mobile 412×823/DPR1.75 emulation, simulated 4× CPU slowdown and mobile network settings. Cadence used headless Chrome on **Apple M3 Metal**, DPR1, with 1440/390 viewport widths. Neither is a physical-phone or Apple M1 result. The approximately three-second samples support near-60Hz motion in those recorded interactions, not a universal sustained-60fps guarantee. Startup LCP remains above two seconds; INP <200ms, physical-device behavior, native screen-reader quality and broader field performance are not established by these reports. New full-matrix screenshots and persona reviews remain separate acceptance evidence.
