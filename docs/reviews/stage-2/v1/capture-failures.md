# Stage 2 v1 capture failures

The 24-state screenshot matrix completed with zero axe findings, uncaught page errors or horizontal overflow. One normal Home load (English, light, 1024px) reached the geographic fallback after the external basemap readiness timeout. The manifest preserves that result.

The first signature attempt stopped while awaiting a project card inside the collapsed mobile sheet. The harness was corrected to expand the sheet before selecting a card. The second attempt then found a product defect: after adding two comparisons and closing evidence, the floating comparison heading intercepted clicks on the sheet-collapse handle. Playwright timed out after 30 seconds. This is a failed interaction, not a passing signature recording.

The original raw recordings (`page@bd2c15346ad6d101d027ce108e5c07c2.webm` and `page@cb5e3c21c083d7784d7329767eb2cd7a.webm`) remain in `../media/v1/`. They were interrupted and must not be presented as completed EN/AR flows or frame-rate evidence. The signature harness now closes its recording context in a `finally` block, retaining a named failed recording on future failures.

The repair regression explicitly collapses the sheet after comparison/evidence, then opens map tools. The v2 capture will use a new directory; this evidence is retained.
