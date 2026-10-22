# Stage 2 — seventh scored review

**Board review passed:9.012/10, minimum8.** The seven reviews are simulated studio self-audits, not independent customer interviews. All84 criterion scores were parsed by `scripts/review-scorecard.mjs`; no score was altered to achieve the threshold. The six earlier failed reviews remain intact. Individual means below9 are allowed by the aggregate gate.

The visible improvements now justify a limited score increase. The initial Dubai map names recognizable places around the project columns; actual MapLibre feature inspection distinguishes rendered labels from planned envelopes. Selected mobile evidence gives facts more room while preserving the same brief and direct editing. Pointer testing caught and repaired focus-driven movement of the Sources control. Short-height inspection caught the root-height clipping and toolbar/handle overlap. These are demonstrable interaction and presentation changes, rather than implementation savings alone.

## Evidence inspected

The current production build is c5033b8. Fresh `media/v9` contains24 Home/Explore layouts,8 forced-fallback views and both signature recordings/checkpoints, with zero reported page errors, axe violations, overflow or document-direction failures. The parent inspected desktop English light Explore, Arabic dark tablet Explore, Arabic mobile evidence, English dark desktop Arrival, Arabic light mobile Arrival and the English comparison-map checkpoint. Reviewers identify their own still/image scope; no claim that every video frame was watched is made.

`media/evidence-reading-v4` confirms eight production cases with a stable96px editing composer and open Sources. At500px viewport height, the reading pane ends at500px and retains96–97.5px while notes are open; facts remain scrollable. The final handle receives pointer input. At normal height the initial evidence pane has491.75–493.25px of reading space. Earlier failure captures are preserved.

`media/orientation-v1` records32 states:42 planned and38 rendered supplemental feature instances. Mobile Saadiyat omits the added name where no safe placement exists. Some native map names repeat the supplement. These are six existing approximate anchors, not new neighborhood boundaries or verified property coordinates.

Fresh `media/performance-v9` probes use local M3 Metal: moving medians16.4–16.7ms, p9517.3–19.8ms, no moving interval above33.34ms and no page errors. The full Home desktop RAF series includes one slower interval. These three-second samples are not sustained-load, physical-phone or M1 certification. Prior hosted-scope audits remain Home98/Explore98 with LCP2233.1/2219.2ms; they predate this source revision and do not demonstrate the strict2s budget.

## Validation and release status

Native PostgreSQL passes67unit tests and36mock evaluations with zero off-market leakage. The initial PGlite unit attempt closed one connection after a database-trigger rejection; native PostgreSQL is the authoritative database test here. The full browser run passed55/56, failing a cold auth navigation wait. The focused recovery passed15 cases, and the three-role/six-screen accessibility case passed separately after explicit navigation waiting and a suitable total scan timeout. Six new reading/orientation cases pass against production. Formatting, lint, types and production build pass. Hosted runs39824920382 and39824917165 are pending at this review's publication; a successful outcome must be appended before calling current CI green.

## Retained work and decision

1. Keep the strict LCP target open for hardening. Current CI score floors do not substitute for LCP<2s, and TBT does not certify field INP.
2. Preserve native-label collision and safe omission; investigate duplicate Palm/Saadiyat names without removing useful native context. Do not force a label into controls.
3. Keep source-note scroll access and the short-height editing tradeoff explicit. Validate real virtual keyboards, full assistive-technology use and native Gulf wording when those resources are available.
4. Carry existing source freshness, fictional-data and approximate-travel disclosures into Concierge generative UI. No invented facts or synthetic units attached to real projects are permitted.

The scored review gate is satisfied. Stage2 closure awaits hosted validation; the overall Darivo goal remains active and Stages3–6 are still outstanding. This is not a production-readiness or complete-goal declaration.

## Hosted validation after scoring

[Current-source run39824920382](https://github.com/ahmedshammad/Darivo/actions/runs/39824920382) passed:67unit tests,36mock evals,49browser passes and7explicit GPU skips, production build and configured Lighthouse checks. Reports in `../performance/hosted-orientation/` show Home97/Explore96 and LCP2256.6/2254.4ms. Thus the strict2s gap persists; the post-score outcome does not inflate the board scores. The second same-push run39824917165 remains in progress at this append.

Stage2's scored review and validation gate are now closed. The recorded device, LCP and human-validation limitations remain open for hardening; they are not represented as fulfilled. Stage3 can proceed. The full Darivo goal remains active.

The second same-push run39824917165 subsequently passed as well.
