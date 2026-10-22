# Home critical path after loading-boundary repair

22 October 2026. Production v14, unchanged Lighthouse settings. Read-only reconstruction of `/tmp/darivo-lcp-trace-home-v2.json` and matching `-0.trace.json` / `-0.devtoolslog.json`, using the retained [reconstruction script](../trace-v1/reconstruct.mjs) with the new prefix. No browser, build or application edit was performed by this agent. A read-only local HTTP fetch saved the same build's HTML at `/tmp/darivo-home-v14.html` for byte attribution; it is not claimed to be the identical trace response.

## Exact before/after

| Measurement                         |             Before, trace-v1 |          After, trace-v2 |
| ----------------------------------- | ---------------------------: | -----------------------: |
| Report simulated LCP                |                  2657.540 ms |              2180.506 ms |
| Reconstructed LCP                   |                  2657.540 ms |              2180.506 ms |
| Optimistic / pessimistic            |       2657.540 / 2657.540 ms |   2180.506 / 2180.506 ms |
| Observed FCP                        |                    50.685 ms |                56.532 ms |
| Observed final LCP                  |                   358.072 ms |                56.532 ms |
| Optimistic / pessimistic node count |                      20 / 21 |                  11 / 11 |
| First candidate                     | `DIV.page.empty` placeholder |       `EM` real headline |
| Final candidate                     |           `EM` real headline | same sole `EM` candidate |

The repair removed the placeholder and late route-script dependency, reducing this paired diagnostic's simulated LCP by477.034 ms. The parent additionally reports four no-JavaScript heading/composer tests passing. This is a concrete improvement, **not a sub-two-second pass**. The separate v9 audit values Home2185.677 / Explore2188.601 ms are consistent but are not this raw trace's exact values.

## Remaining terminal chain

| Node                                       | Simulated interval            | Transfer / CPU                                              |
| ------------------------------------------ | ----------------------------- | ----------------------------------------------------------- |
| HTML document                              | 0–753.253 ms                  | 40,507 transferred bytes                                    |
| React/Next core chunks `3c783e23…`, `954…` | 753.253–2106.506 ms, parallel | 64,731 / 67,864 transferred bytes                           |
| Framework evaluation                       | 2106.506–2180.506 ms          | 74 ms simulated CPU; observed EvaluateScript child17.811 ms |

Display/UI fonts finish at1506.506 /1656.506 ms and are not terminal. MapLibre is absent from the LCP graph. The remaining framework task starts before the observed headline paint, so Lantern retains it. Its child timings overlap and must not be added as exclusive CPU time. Early document work includes ParseHTML4.319 ms, UpdateLayoutTree6.901 ms and Layout7.642 ms; reducing unnecessary HTML/styles can therefore help real first rendering as well as transfer size, but a new trace must establish the effect.

## Measured payloads and compression

One local synchronous sample per quality on M3; not a serving-throughput benchmark. The HTML read contains176,407 raw bytes. Recorded transfer sizes include overhead and a separate response, so model substitutions use savings relative to a locally recompressed gzip body instead of replacing the entire recorded transfer size.

| Resource         | gzip body | Brotli q6 body | Brotli q11 body | q11 encode time |
| ---------------- | --------: | -------------: | --------------: | --------------: |
| HTML             |  38,555 B |       27,369 B |        24,526 B |     about119 ms |
| Core `3c783e23…` |  64,062 B |       59,851 B |        54,693 B |     about204 ms |
| Core `954…`      |  67,188 B |       59,953 B |        54,611 B |     about230 ms |

Full quality/time samples are in `transfer-model.json`. High-quality static compression can be performed at build/deploy time, avoiding per-request encoding. Dynamic HTML q11 incurs material CPU/latency and is not recommended from this sample. A real Brotli server/proxy experiment would need correct Accept-Encoding negotiation, Vary/cache/security behavior, streaming/backpressure and load checks. It is a deployment optimization, not a Lighthouse setting change.

## HTML attribution and realistic scope reduction

- One visible inline style block is42,199 raw bytes including its tag; broad globals plus tokens account for26,797 raw CSS bytes, and Arrival adds roughly15.5 KB.
- Those styles are also serialized in Flight. The legacy messages object is15,585 raw bytes (~6,061 gzip independently); Atlas data is42,251 raw bytes (~7,069 gzip independently). These separately gzipped sizes are descriptive, not additive savings.
- Byte-only removal of both broad CSS copies, while reserving2.5–3.5 KB of their suffix as a rough shared-base allowance, yields HTML27.9–28.1 KB gzip: about10.5–10.7 KB saved. This is **not valid proposed CSS or executable Flight**, only a byte-budget sensitivity; a real extraction must retain every required reset/font/token/accessibility rule.
- Also removing the legacy messages payload in this byte model yields21.7–22.0 KB gzip, or16.1–16.3 KB Brotli q6 before response overhead. See `html-scope-bytes.json` and its script. Actual provider/route restructuring may differ. No visible Atlas content or project facts were removed in these models.

## What the unchanged graph model predicts

| Transfer-only sensitivity                       | Simulated LCP |
| ----------------------------------------------- | ------------: |
| Document alone saves4–20 KB                     |   2180.506 ms |
| Static core chunks use Brotli q6 or q9          |   2180.506 ms |
| Static core chunks use precompressed Brotli q11 |   2030.506 ms |
| q11 core chunks plus total document18–24 KB     |   2030.506 ms |
| q11 core chunks plus total document14 KB        |   1880.506 ms |

TCP round/congestion thresholds make the modeled improvements discrete. These values retain recorded CPU, server response timing, graph membership and paint cutoff. They exclude compression/decompression CPU and are **not measured improvements or promises**. A14 KB total-document target is below the realistic q6 CSS+messages model after response overhead; reaching it needs additional justified work rather than claiming compression alone solves the requirement.

## Smallest defensible next experiment

Scope legacy broad CSS to legacy routes; retain a carefully extracted minimal font/reset/token base for Atlas. This removes unnecessary bytes and style work while preserving real server-rendered content and existing map readiness UI. Check EN/AR themes, no-JavaScript content, focus/controls and legacy routes, then remeasure the trace under unchanged audit settings. The current graph-only byte model does **not** guarantee a score gain from this alone; the legitimate benefit also includes earlier HTML/style processing. Avoid removing fields needed for trust disclosures or delaying meaningful visible content to change a paint cutoff.

If framework transfer remains terminal after that experiment, the next concrete transport option is offline-precompressed static assets served through correctly configured Brotli negotiation, with separate dynamic-HTML compression tradeoffs. Keep the strict two-second target open until a real rebuilt/served measurement demonstrates it.
