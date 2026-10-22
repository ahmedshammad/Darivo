# Transport decision — retain the standard Next server

22 October 2026. **Do not replace `next start` solely to close the remaining LCP gap.** Precompressed Brotli assets are a legitimate deployment optimization, but the available evidence does not establish that they would meet the strict two-second target. No server, dependency, source, audit setting or visible content was changed during this assessment.

## Measured current HTML

The saved production v16 response `/tmp/darivo-home-v16.html` is 129,531 raw bytes. Built-in Node 22.22.3 zlib produced these body sizes:

| Encoding          | Body bytes | One local encode sample |
| ----------------- | ---------: | ----------------------: |
| gzip              |     26,434 |  Not timed in this pass |
| Brotli quality 4  |     20,223 |                  7.2 ms |
| Brotli quality 6  |     18,503 |                  1.7 ms |
| Brotli quality 9  |     18,285 |                 18.0 ms |
| Brotli quality 11 |     16,639 |                177.6 ms |

These are single synchronous M3 samples, affected by warm-up and order, not server-throughput or streaming benchmarks. Response headers and HTTP framing are excluded. Dynamic quality 11 costs much more CPU for a small further saving; it is not justified by these results.

The earlier [transfer model](trace-v2/transfer-model.json) measured the two unchanged core chunks at 54,693 /54,611 Brotli quality 11 bytes versus 64,062 /67,188 gzip bytes. Offline precompression would avoid their roughly 204 /230 ms encoding cost on requests.

## Why this is not a demonstrated sub-two-second fix

The exact retained trace model predicts **2030.506 ms** for quality 11 static core delivery with a total document between 18 and24 KB. Current quality 6 HTML alone is 18.5 KB, before overhead. The modeled 1880.506 ms case requires a total document around 14 KB, which this response does not reach. Current CPU/timing variation can also change the result. The model keeps the original graph, protocol, server timing, CPU and paint cutoff; it excludes serving-layer compression/decompression and does not prove a measured outcome for the current build.

Current [local production audits](v11/README.md) remain around 2.19 seconds. The strict LCP < 2.0-second target stays open.

## Serving options and tradeoffs

The installed Next 16.4.2 `compress` guide documents gzip for `next start` and recommends disabling it only when an external server already provides compression. The installed custom-server guide recommends custom servers only when the integrated router cannot meet the application's requirements; custom server files do not pass through the Next compiler, and custom servers cannot be combined with standalone output. Our router does meet the application's requirements.

Local inspection found Node/zlib, but no nginx, Caddy or Homebrew executable on PATH, and no public compression/proxy dependency. Next's internal compiled modules are not an appropriate application dependency. A hand-built Node compression wrapper would introduce negotiation, response-stream, cancellation, cache and deployment responsibilities for a marginal, unproven score gain.

If a production hosting layer is selected later, prefer its supported Brotli/static delivery in front of the standard Next server. Offline quality 11 files for immutable hashed JS/CSS plus moderate dynamic compression can be evaluated there. Keep gzip/identity fallbacks. Do not buffer all dynamic HTML merely to compress it, weaken source disclosures, or alter audit settings.

Before shipping such transport, validate encoding negotiation (including exclusions), decoded-content equality, HEAD/conditional/range semantics, representation-correct cache headers, no double compression, streaming first-content timing and cancellation/backpressure. Preserve CSP, cookies, private/no-store responses, forwarded origin/host behavior and authentication checks. Repeat existing functional tests and unchanged hardware/software Lighthouse measurements. These are requirements for a future transport change, not work performed in this assessment.

## Primary local guidance consulted

- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/compress.md`
- `node_modules/next/dist/docs/01-app/02-guides/custom-server.md`

**Decision:** retain `next start`, record the potential deployment optimization, and stop transport work here. No claimed performance pass.
