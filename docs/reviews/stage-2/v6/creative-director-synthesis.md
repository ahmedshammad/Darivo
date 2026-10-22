# Stage 2 — sixth scored review

**Failed: board 8.958/10, minimum 8.** All seven simulated reviews inspect fresh production `media/v8`. Earlier failed rounds remain intact. The board credits real first content, 31.4% smaller locally compressed Home HTML and preserved presentation, but finds no basis for raising scores merely because the implementation is leaner.

The complete capture matrix contains 24 layouts, eight forced-fallback states and bilingual signature recordings with zero reported console errors, axe violations or document overflow. Eight production no-JavaScript, navigation-style and missing-page landmark cases pass. The latest unchanged local Lighthouse reports remain Home98/Explore96 with LCP approximately2.19 seconds; the strict two-second target is still unmet. Fresh three-second M3 movement probes show moving medians16.5–16.7ms, p9517.7–19.6ms and no moving interval above33.34ms. Three full-window RAF series contain one slower interval each. These are not physical-phone/M1, sustained rendering or field-INP certification.

At review time, current full demo regression and hosted CI were pending; prior `93103bc` is green. Subsequent validation may be appended without rewriting these scores. Native Gulf editorial and full assistive-technology validation remain unproven.

The next fix list is concrete:

1. Improve initial local orientation with existing, explicitly approximate place names and collision-safe labels. Do not invent neighborhood boundaries or present coarse fallback geometry as street detail. Evaluate the retained orientation proposal visually before accepting it.
2. Inspect the mobile evidence pane's limited reading height; preserve the conversational entry while giving facts sufficient room and maintaining keyboard/Back behavior.
3. Keep the measured LCP budget open. The remaining framework-transfer path is documented. Font partitioning and aggressive evidence stripping were rejected; any transport alternative needs correct negotiation/streaming/security behavior and real measurement, not a changed audit setting.

Stage 2 stays open. Stage 3 has not started. No blanket production-readiness or external-validation claim is made.
