# Stage 2 startup diagnosis after v6

Source/report inspection only. No new browser run, audit-setting change, build, or UI change was made for this diagnosis. The two-second simulated mobile LCP target remains unmet. This finding does not change historical review scores or certify physical-device performance.

## Measured evidence

| v6 route | Simulated FCP | Simulated LCP | Observed FCP / LCP | HTML transfer / uncompressed |
| -------- | ------------: | ------------: | -----------------: | ---------------------------: |
| Home     |        788 ms |      2,183 ms |         60 / 60 ms |       41,657 / 178,362 bytes |
| Explore  |        933 ms |      2,330 ms |         74 / 74 ms |       43,885 / 197,239 bytes |

Raw reports inspected: `/tmp/darivo-stage2-lighthouse-v6/home.json` and `/tmp/darivo-stage2-lighthouse-v6/explore.json`. Lighthouse uses `simulate` with 150 ms RTT, 1,638.4 Kbps throughput and 4× CPU slowdown. Observed timings describe the local unthrottled capture; they do not replace the simulated acceptance metric.

The reported LCP elements are server-rendered text: Home's “in perspective.” emphasis and Explore's “A place for your life.” heading. Both are present in the initial paint. The reports list no render-blocking CSS requests and show observed server response around 10 ms. They do not support a claim that the headline waits for the map or for a late client data request.

Before observed first paint, both reports complete the same 136,836 bytes of framework-script responses and 47,568 bytes of font responses. Route-specific scripts and MapLibre load later. The installed Lighthouse 13.5.0 Lantern source builds LCP estimates from eligible network and CPU nodes completed before the observed LCP cutoff, including non-image resources. Thus the simulated network dependency cost can exceed the observed text-paint delay substantially. The JSON report does not expose the simulated node timings needed to assign an exact fraction of the remaining delay to a particular request.

The parent subsequently reported the v7 early HTTP Link font-preload experiment at Home 2,190.33 ms and Explore 2,329.484 ms, with headers verified. This did not materially improve the result. The experiment is being reverted; its failed measurements should remain in the evidence record. The earlier v5 Home result of 1,807 ms was not reproduced and cannot be presented as a stable pass.

## Source-level payload findings

- The completed preference-decoder change removes browser-side Zod while retaining strict server schemas. The prior Zod module measured 81,691 raw / 23,773 gzip bytes. The route DTO now omits unused statistics and developer lists while retaining the selected developer's bilingual caption. These are real payload reductions, but v6 does not establish that they achieved the LCP target.
- Root `NextIntlClientProvider` still serializes 359 translation entries. English is 15,585 raw / 6,021 gzip bytes; Arabic is 20,323 raw / 6,977 gzip bytes. Much of this belongs to legacy workflows. Conditional removal in the persistent locale layout is unsafe without a route/provider design that also handles subsequent client navigation into those workflows.
- Shared global CSS contributes 26,797 minified / 6,763 gzip bytes in the inspected build. Installed Next documentation explicitly notes that experimental inline CSS is duplicated in SSR markup and initial RSC. However, this stylesheet also supplies common resets and font declarations; removing it selectively is not a narrow, proven fix.

## Recommendation

Keep the current visible experience and retain the target miss. No additional small patch has a demonstrated causal basis for removing the remaining roughly 330 ms from Explore. Stage 6 hardening should capture the raw trace and DevTools log alongside Lighthouse results, identify the simulated critical nodes, and evaluate any provider/CSS restructuring with cross-route navigation and visual regression checks. Do not change audit settings, hide content, or treat a high Lighthouse score as satisfaction of the separate two-second requirement.
