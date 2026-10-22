# Stage 3 validation checkpoint

Stage 3 is in progress. These checks validate the implemented Concierge, not the full Darivo v2 goal or a passing design review.

## Current code checks

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
