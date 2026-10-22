# Software fallback v1 — functional pass, performance failure

The first capability policy correctly selected the disclosed geographic fallback in real SwiftShader Chrome, and bilingual interaction tests passed. However, checking the context only after constructing MapLibre was too late to protect the main thread.

Lighthouse used the same mobile audit/throttling settings as the ordinary script, with only the graphics backend explicitly selected through `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`. This is a software-backend diagnostic on the M3 host, not a substitute for unchanged hosted CI or a physical phone.

| Page    | Performance |         LCP |         TBT | Other categories |
| ------- | ----------: | ----------: | ----------: | ---------------- |
| Home    |          52 | 5,917.75 ms | 1,226.16 ms | 100/100/100      |
| Explore |          41 | 8,537.32 ms |    3,821 ms | 100/100/100      |

The LCP elements remain the server-rendered headings. Their observed first paint moved to1.15/1.59 seconds, and the reports retain long MapLibre tasks of1,332/3,791 simulated milliseconds. The first policy is not accepted as a performance repair.

Next: perform actual renderer classification asynchronously in an OffscreenCanvas worker before loading/constructing the map. Keep unknown or unavailable capability information on the normal path, retain native caveat handling, and preserve the explicit 2D limitations and interactions. No audit-setting changes or content hiding are proposed.
