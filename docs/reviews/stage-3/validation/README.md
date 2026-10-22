# Stage 3 validation checkpoint

Stage 3 is in progress. These checks validate the implemented Concierge, not the full Darivo v2 goal or a passing design review.

## Current code checks

- Native PostgreSQL16 + pgvector: 251 unit/integration tests in 25 files pass. Includes scoped access, fresh evidence, constraint edits, exact schedules, consent, atomic confirmations, deletion and cancellation boundaries.
- Full ESLint and TypeScript checks pass at the server freeze. Subsequent presentation feedback changes require the final repository check.
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

The complete final browser suite, production build/matrix/recordings, seven persona scorecards, Creative Director synthesis and current-source hosted CI are still required. Browser speech uses a selected locale, not validated bilingual acoustic auto-detection. Native Gulf/Egyptian speech quality, human Arabic editorial review, full assistive-technology validation and target-device performance remain unproven. No new-release announcement is fabricated from static seed data.
