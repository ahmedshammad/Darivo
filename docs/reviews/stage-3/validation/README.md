# Stage 3 validation checkpoint

Stage 3 is in progress. These checks validate the implemented Concierge, not the full Darivo v2 goal or a passing design review.

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
