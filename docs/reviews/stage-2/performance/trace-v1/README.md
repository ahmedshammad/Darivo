# Exact Lantern reconstruction — Home production v13

22 October 2026. Read-only reconstruction of the completed normal production Home audit. No audit settings, visible content, application source or browser backend were changed. This trace is a separate diagnostic run; it does not replace earlier retained median measurements.

Inputs retained in `/tmp`:

- `/tmp/darivo-lcp-trace-home.json` — Lighthouse 13.5 report, fetch time `2026-10-22T16:29:00.491Z`.
- `/tmp/darivo-lcp-trace-home-0.trace.json` — raw Chrome trace.
- `/tmp/darivo-lcp-trace-home-0.devtoolslog.json` — raw network/initiator log.

The reproduction script `reconstruct.mjs` invokes the installed Lighthouse `LanternLargestContentfulPaint.request` using the report's original `configSettings`, trace, devtools log, navigation context and normal computed cache. It uses the default devtools-log graph path, not the optional trace-engine environment override. The script currently points to this workspace's installed Lighthouse and accepts the artifact prefix as its first argument.

## Exact result

| Value                       | Milliseconds |
| --------------------------- | -----------: |
| Report simulated LCP        |     2657.540 |
| Reconstructed simulated LCP |     2657.540 |
| Optimistic LCP estimate     |     2657.540 |
| Pessimistic LCP estimate    |     2657.540 |
| Reconstructed FCP           |      776.135 |
| Observed FCP                |       50.685 |
| Observed final LCP          |      358.072 |

Installed Lantern computes LCP as the mean of optimistic and pessimistic graph end times, clamped to FCP. `home-graph.json` preserves both graphs' node timings, dependencies, network sizes and CPU child-event summaries. Nested CPU child events overlap; their durations must not be summed as exclusive CPU attribution.

## Critical dependency chain

| Node                                    | Simulated interval ms | Transfer bytes / CPU cost                                                                  |
| --------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------ |
| Main document `/en`                     | 0–759.135             | 41,648 transferred; 178,362 decoded bytes                                                  |
| Framework chunks `3c783e23…` and `954…` | 759.135–2118.270      | 64,731 and 67,864 transferred bytes, in parallel                                           |
| Framework evaluation task               | 2118.270–2189.270     | 71 ms simulated CPU; observed EvaluateScript child 17.113 ms                               |
| Runtime-discovered route/layout chunks  | 2189.270–2657.540     | Includes page chunk 7,999 B, `3601…` 5,737 B; these start later in the connection schedule |

The last graph nodes are route scripts, not fonts or MapLibre initialization. Display font finishes at simulated1518.270 ms; UI font at1668.270 ms. Removing a font request alone does not remove the terminal route dependency.

The trace identifies the first LCP candidate at50.685 ms as **`DIV.page.empty`**, the visible locale-wide `loading.tsx` placeholder. The final **`EM` headline** candidate arrives at358.072 ms. Route chunks are actually requested by the React/Webpack runtime (`initiator.type=script`) after the framework evaluates; the two initial framework bundles are parser-discovered. This is direct evidence of the streaming/loading boundary and later route content, not evidence that the headline itself needs MapLibre.

## Defensible experiment

Remove the locale-wide automatic loading boundary from Home/Explore while retaining loading states on existing legacy child routes. This should let the actual server-rendered headline and route resources participate in the initial response, rather than first painting the generic loading placeholder. Preserve the map's own readiness/fallback UI, authentication behavior, content and audit settings. Rebuild and capture a fresh trace to verify the candidate and dependency changes; this diagnosis does not promise a particular result. The tradeoff is waiting for route server work before the real page instead of immediately streaming the generic placeholder.

## Graph-only sensitivity checks — not measured improvements

`font-counterfactual.json` removes the external English display font node and adds the proposed compressed inline payload to the main document. With unchanged recorded CPU costs and all other settings, +23,093 document bytes yields LCP2807.540 ms (+150 ms); +46,500 yields2957.540 ms (+300 ms). This does not model extra HTML parsing, compression interactions or a changed observed LCP candidate. The font-inlining proposal is therefore unsupported by this trace's critical graph.

`route-discovery-counterfactual.json` reparents script-initiated network nodes directly to the document to assess discovery delay alone. It yields2502.770 ms, with the recorded paint cutoff/CPU costs unchanged. This is **not** a prediction of removing the loading boundary: a real server-rendering change can alter the visible LCP candidate, graph membership and response wait. It only confirms that runtime discovery contributes measurable latency even before those larger changes.

## Source implementation consulted

- `node_modules/lighthouse/core/computed/metrics/lantern-largest-contentful-paint.js`
- `node_modules/lighthouse/core/computed/metrics/lantern-metric.js`
- `node_modules/lighthouse/core/computed/page-dependency-graph.js`
- Installed `@paulirish/trace_engine` 0.0.65: `lantern/metrics/{LargestContentfulPaint,FirstContentfulPaint,Metric}.js`.

No browser, build or application edit was performed during reconstruction. Parent owns the proposed controlled implementation and fresh measurements.
