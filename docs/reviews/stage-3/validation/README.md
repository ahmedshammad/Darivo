# Stage 3 validation checkpoint

Stage 3 is in progress. These checks validate the implemented Concierge, not the full Darivo v2 goal or a passing design review. The latest production repair is `28cf808`; formal v3 failed at 8.880952/min8 and focused third repairs are underway. Earlier sections below are preserved checkpoints.

## Initial integration checks (historical)

- Native PostgreSQL16 + pgvector: 251 unit/integration tests in 25 files pass. Includes scoped access, fresh evidence, constraint edits, exact schedules, consent, atomic confirmations, deletion and cancellation boundaries.
- Full ESLint, TypeScript and formatting checks pass after the final presentation feedback changes.
- The complete browser run passes66/67. The sole failure is a cold development comparison-route navigation timeout in a legacy workflow; the test also selected another collection because it used a global first-match locator. The repaired named-collection/PDF/two-residence comparison flow and ownership case both pass in a focused rerun. Every new Concierge case passes in the full run. The original failure remains recorded, and hosted CI will run the complete updated suite.
- Legacy mock consultant: 36/36 evaluations pass, off-market leakage zero.
- Deterministic Concierge parser: 91/91 cases, 113 distinct phrases; this runner alone does not prove authorization or grounding.
- Authorized execution: `execution-passing-v3.json` records 388 cases and 548 turns: 91 corpus cases across four actors, eight unit journeys and 16 access/revocation probes. All 13 counters are zero. It checks 1,796 cards, 16,195 facts and 546 actions against current seeded data. It does not execute confirmation writes; those have separate database tests.
- The optional real provider is skipped because no API key is configured. A mocked streamed SDK response verifies that unchecked prose is discarded and validated tool arguments are used; this is not a real-model evaluation.

## Preserved failures and repairs

`execution-failed-v1.json` retains the first expanded run. A British-curriculum Brief could lose its school-data caveat when no school tool ran; the engine now enforces that disclosure independently. The same run incorrectly expected a schedule for a ready unit and unit IDs in project-normalized map output. Positive tests now compare exact stored schedules or require an explicit unknown notice, and check authorized unit cards independently of map markers.

`execution-failed-v2.json` retains twelve map assertions that expected a single Palm anchor after the Dubai guide became a combined three-place preview. The corrected check recognizes only the exact canonical Palm/Dubai Hills/Downtown cohort and its Dubai camera; arbitrary camera mismatches still fail.

Browser work repaired a Stop-to-Send DOM reuse that caused a second POST, stale clear-history identity, lost sign-in context, repeated mini-maps, excessive empty-composer height and overlapping fallback POI labels. Initial failures remain in their temporary trace directories. Initial and repaired screenshots remain under `../media/`.

A later read-only audit found that edited constraint text retained its old filter meaning. Filtering and evidence explanations now normalize current text while keeping IDs stable; unknown strict requirements fail closed. Explicit refusal of external AI processing also persists as no-sharing and selects the local provider on later turns. Both have targeted regressions.

Disk exhaustion interrupted one browser trace teardown and an eval command. Removing only the regenerable production webpack cache restored space. The interrupted invocation is not counted as passing.

## Outstanding acceptance evidence

Production build and the first48-state matrix/six recordings are complete. Seven persona reviews and the Creative Director synthesis in `../v1/` fail at7.8869/min6;16 mobile axe target failures and Lighthouse74 remain actionable. Hosted39842555508 failed legacy Arabic detail performance88 after tests/browser/build passed. Repair validation, fresh captures, re-review and green current-source CI are still required. Browser speech uses a selected locale, not validated bilingual acoustic auto-detection. Native Gulf/Egyptian speech quality, human Arabic editorial review, full assistive-technology validation and target-device performance remain unproven. No new-release announcement is fabricated from static seed data.

## First repair verification

All271 unit/integration tests pass in27files. Legacy36 and parser97 cases/118phrases pass. `execution-passing-v4.json` records412 cases/576turns,1,684cards,15,239facts and590actions withall13 counterszero, including the new returned-record community checks. This longer run overlapped compilation and is not a response-time benchmark.

Production buildv3 succeeds. Two new scenario UI cases pass inEN/AR. Four mobile control cases stop at a remaining wordmark label-content-name mismatch: the nested brand text concatenates without whitespace while its explicit accessible name contains a space. The expanded controls are hidden correctly; the collapsed-control assertions remain unexecuted until this label is repaired. The complete original failure log remains `/tmp/darivo-stage3-reading-v3.log`. No full matrix pass is claimed.

The rebuilt wordmark repair passes all6 focused production cases: EN/AR, WebGL/fallback mobile reading and fully reachable collapsed controls, plus visible calculation values/inputs/qualifications. Both production builds succeed. The regional map change reduces the measured initial transfer from about3.7MiB to0.67MiB; Concierge performance99, LCP2181.2ms, TBT49ms. Legacy Arabic detail scores95. Both strict two-second LCP limits remain unmet; `lighthouse-repair-v1.json` records scope and timing. Fresh full captures and board scores remain pending.

## Recovery checkpoint — production build v5

The latest recovery validation passes **275 native PostgreSQL unit/integration tests in 28 files**, **36 legacy evaluations**, and **97 parser cases covering 118 distinct phrases**. The parser runner remains a semantic check, not proof of authorization or source grounding. Full lint and formatting checks pass. Logs: `/tmp/darivo-stage3-recovery-{tests,evals,lint,format}.log`.

[execution-passing-v5.json](execution-passing-v5.json) is extracted from that eval log. It records **412 authorized execution cases and 576 turns**, checking **1,684 cards, 15,239 facts and 590 actions**, with **all 13 counters zero** and no failures. The corpus spans guest, client, verified-client and developer-partner viewers, plus unit follow-ups and access/revocation probes. Returned-record community checks distinguish Palm Jumeirah from Jebel Ali. Total validation-run duration is 39.058 seconds; this is not response-time or browser-performance evidence. The real provider remains **skipped** because no key is configured; no portfolio, viewing or handoff confirmation is executed by this runner.

Recovery now describes a missing required feature only when a nonempty authorized cohort satisfies every other requirement within the same geographic, budget and deadline scope. Missing evidence is not described as proof that the feature is absent. The EN/AR Sheikha request retains Palm/Saadiyat and strict requirements, returns no nonmatching cards, and presents one conditional no-match notice. The recovery control opens the existing requirements editor without changing or submitting the Brief. No criteria are silently relaxed.

Production **build v5 passes**, followed by **eight focused production browser checks**: EN/AR reading and map-control reachability in WebGL/fallback, visible scenario results/inputs/qualifications, and recovery-editor behavior. Evidence logs are `/tmp/darivo-stage3-build-v5.log` and `/tmp/darivo-stage3-reading-v5.log`. This is a focused pass, not a new complete browser-suite or full capture-matrix pass.

The first failed board review, sixteen mobile axe failures, failed execution reports, accessible-name regression and hosted Arabic-detail performance failure remain preserved above and in their original artifacts. The earlier regional-map Lighthouse result (99, LCP 2181.2ms, TBT 49ms) precedes this recovery checkpoint and is not a fresh v5 measurement; its strict two-second LCP miss remains open. The source recovery is committed and pushed as `210f413`. Nine additional public Concierge/Atlas browser tests pass (`/tmp/darivo-stage3-public-ui-v5.log`); this is another focused run, not a full-suite claim. Capture v4 stopped after four clean states when the automation raced an automatically opened disclosure and clicked it closed. The harness now waits for the visible checkbox, and the full matrix is recording into `../media/v5/`; v4 is not complete. Fresh v5 production media, the second formal review and green current-source hosted CI remain pending. **Stage 3 is not accepted by this checkpoint.** Human language, real-provider, full assistive-technology, physical-device and field-INP limits are unchanged.

## Second-review repair verification — 28cf808

All291 unit/integration tests pass in28files; full ESLint, TypeScript and formatting checks pass. Parser105 cases/124phrases and444 authorized execution cases/632turns pass, with all13 counterszero (`execution-passing-v6.json`). No real-provider key is configured. Both production buildv6 andv7 succeed.

Production browserv6 passed20/21 cases and retained one actual Arabic chart-label overlap failure. Larger Arabic glyphs required more vertical separation; the assertion was not weakened. The corrected v7 run passes all22 public Concierge cases: reading/map controls, explicit recovery, outer-frame containment, visible scenario assumptions, chart geometry, stream/draft behavior, progressive map detail and failed-source geographic fallback. Original and corrected logs are `/tmp/darivo-stage3-browser-v6.log` and `/tmp/darivo-stage3-browser-v7.log`.

The wider Atlas production run passes33 cases. Its one demo-login flow fails because the production build intentionally disables demo-account buttons. That case must run under development/hosted CI; production auth restrictions are unchanged. This invocation is not claimed as a full-suite pass. Log: `/tmp/darivo-stage3-atlas-v7.log`. The earlier hosted runs at496a3f7 and210f413 passed the full pipeline; current28cf808 hosted verification is pending.

Media v6 is collecting the complete new matrix and six recordings with detailed-source readiness checks. Current source fixes failed detail requests by entering the geographic fallback, retains regional geography during detail loading, names regional comparison endpoints, confines reading movement to its panel, and keeps a named payment question on its explicit project. Formal review acceptance and fresh performance remain pending.

### Complete production evidence at 28cf808

Media v6 completes all 60 EN/AR, light/dark, desktop/tablet/mobile states with zero page errors, axe findings or horizontal overflow. All 60 report settled tiles. Six signature recordings, 18 supplementary numerical/evidence views, eight settled local-map checkpoints and four requirements-editor checkpoints are retained. Every settled-map checkpoint resolves detailed geography; the editor captures retain the header and viewport frame.

Fresh isolated Lighthouse scores **98 performance, 100 accessibility, 96 best practices and 100 SEO**, with **LCP 2193.2201ms, TBT 78ms and CLS 0**. The strict two-second LCP target remains unmet. See `lighthouse-second-repair-v7.json`; these lab results do not establish field INP or physical-device cadence. The third simulated review is using this complete evidence set. Current-source hosted CI has passed static checks, unit tests and evals; the remaining pipeline is still pending at this checkpoint.

### Hosted source 28cf808

Run39854379709 fails one of80 browser cases:69 pass and10 hardware-WebGL cases skip. The Arrival-to-Concierge EN draft handoff exceeds its5s URL assertion. The retained trace shows the correct destination request succeeds in2845ms, its development bundle then loads in1056ms, and destination mounting begins about5.2s after the click. The regression now waits explicitly up to20s for development navigation; draft/theme/no-POST assertions and production performance budgets are unchanged. Build and hosted Lighthouse were skipped after the failed browser step. Raw log and trace remain under `/tmp/darivo-stage3-ci-39854379709.log` and `/tmp/darivo-stage3-ci-evidence-39854379709/`. No full hosted pass is claimed.

## Third-review repair verification — 219204a

The retained source improves reading order, source-detail disclosures, early trade-off visibility, POI labels and localized expiration. Seven exact reference values gain faithful Arabic display text; eight tests verify their canonical values, original wording, sources, dates and provenance are unchanged. All **303 unit/integration tests in 30 files** pass. Legacy36, parser105 cases/124 phrases, and **444 execution cases/632 turns** pass; all13 safety counters remain zero (`execution-passing-v7.json`). Full lint, types and formatting pass. No real provider is configured.

The existing22 public Concierge browser cases pass against production buildv8. The two new currency journeys initially fail because exact label text includes option text, then because Chrome cannot reliably retrieve completed SSE bodies through CDP. Their harness now uses the computed accessible combobox name and transparently observes a clone of the real browser fetch response, returning the original promise immediately. No model or response is mocked. A final expectation now permits only the precise retained Egypt deadline clarification alongside the single SouthMED unknown-schedule notice; unrelated cards, schedules and notices still fail. **Both EN/AR currency journeys pass in full**, including USD→GBP display, retained EGP payment intent, original amounts, exact unit schedule and named-subject follow-ups. Logs v8–v11 and original failure traces remain under `/tmp/darivo-stage3-karim-*`.

`../media/motion-v1/` records twelve local M3 interaction windows in EN/AR desktop and phone emulation:418 moving MapLibre intervals, medians16.5–16.9ms, one33.5ms interval and none over50ms. Sheet-motion RAF medians are about16.7ms. This is not physical-phone/M1, display-presentation or field-INP evidence.

Production buildv8 Lighthouse scores99/LCP2179.931ms/TBT49ms/CLS0 (`lighthouse-presentation-v8.json`). HTTP font hints were tried after the remaining loading gap; the locale middleware replaced the first attempt, and a corrected attempt showed no meaningful gain. Both were reverted and retained in `font-preload-experiment.json`. Builds v9, v10 and final retained v11 pass. The strict two-second LCP target remains open. Source219204a is pushed; media v7 is recording, followed by supplementary and currency captures and formal v4 review. **Stage3 is not accepted.**

### Final third-repair source 0b304f7

Retained production build v12 passes. Six focused browser checks pass: EN/AR currency journeys and EN/AR mobile reading in WebGL/fallback. The POI qualifier remains above the expanded sheet and returns to the map source group when collapsed. The 28 currency screenshots and real SSE manifest pass without page errors. Main media v7 has 60 clean states plus six recordings and 18 supplemental views; the targeted final map-label evidence is separate.

Fresh isolated Lighthouse on this build scores 99 performance, 100 accessibility, 96 best practices and 100 SEO, with LCP 2183.545ms, TBT 61.5ms and CLS 0. The strict two-second budget remains unmet. See `lighthouse-presentation-v12.json`. The discarded font preload experiment remains documented; it is absent from retained source.

The standalone currency capture first failed because top-level await is unsupported in this CommonJS script path. After an async-main repair, tsx inserted a module-only `__name` helper into a browser-serialized callback; the observer interrupted the app fetch wrapper. Inline callbacks remove that dependency. The final standalone capture and normal Playwright journeys both pass against actual streamed responses. Failed manifests remain under media/v7 and media/v7-currency-retry. No app response, schedule or price was mocked to obtain passing evidence.
