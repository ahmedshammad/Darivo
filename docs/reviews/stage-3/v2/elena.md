# Elena Rossi — Stage 3 second review

**Simulated contributor self-audit, not a client interview or native-language endorsement.** I contributed the Concierge UI, Brief and map integration. I inspected production `210f413` evidence: twelve matrix images spanning both languages, themes and all three widths; signature checkpoint stills; settled map/requirements captures; and calculation, comparison, timeline and proposal supplements. The six recordings exist, but I did not continuously play them. This is an internal critique, not independent validation.

> “You now show me where to start. When I ask to see the Palm, however, the main map stops helping me understand Dubai.”

## Journey inspected

1. **Ask — substantially clearer:** [English desktop](../media/v5/elena-en-dark-1440.png) leads with neighbourhood orientation and a three-place preview. [Phone](../media/v5/elena-en-dark-390.png) exposes the relevant answer immediately instead of retaining a large introduction and repeated prompt.
2. **Locate — incomplete:** the preview names Palm Jumeirah, Dubai Hills and Downtown. After choosing the Palm, [settled English desktop](../media/v5/settled/elena-en-1440.png) and [Arabic desktop](../media/v5/settled/elena-ar-1440.png) show markers and labels on a flat background. The [diagnostic manifest](../media/v5/settled/manifest.json) reports tiles ready and camera stopped. Waiting did not establish usable local geography.
3. **Recover — explicit and useful:** [Sheikha's no-match](../media/v5/sheikha-ar-no-match.png) distinguishes missing evidence from absence. [Review requirements](../media/v5/sheikha-ar-requirements.png) exposes the evidence checkbox; the [refined result](../media/v5/sheikha-refined-ar-dark-390.png) keeps the feature unverified rather than silently upgrading it to a match.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                                                     |
| -------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |   8.5 | The invitation remains composed; completed responses now reveal useful material much earlier on a phone.                                                                                     |
| Originality          |     9 | The editorial conversation, editable Brief and geographic workspace remain distinctive and coherent.                                                                                         |
| AI-first             |   8.5 | The teaching response now leads with orientation and actionable places. Actual school suitability remains an acknowledged unknown.                                                           |
| Map experience       |   6.5 | Both settled Palm captures lack visible local geography despite readiness flags. The main teaching interaction therefore fails visually.                                                     |
| Visual craft         |   8.5 | Compact requests and a shorter composer recover reading space. Phone place names still sit below the initial preview fold.                                                                   |
| Motion quality       |     8 | Checkpoints show purposeful camera and sheet changes, but blank destination geography interrupts continuity. No current continuous cadence certification is inferred.                        |
| Arabic & RTL         |   8.5 | [Arabic desktop](../media/v5/elena-ar-light-1440.png) and phone use a deliberate hierarchy. Original source wording is identified; native language and speech review remain absent.          |
| Trust & evidence     |     9 | Fictional schools, approximate anchors and unknown admissions/family suitability are stated. The recovery flow preserves uncertainty.                                                        |
| Discretion & privacy |     9 | Guest reading and explicit proposal confirmation remain visible; [Arabic proposal](../media/v5/supplement/ar-proposal.png) requires private access before saving.                            |
| Developer appeal     |   8.5 | Reference presentation is restrained and qualification is readable. This assesses current Concierge, not later showcase features.                                                            |
| Speed                |   8.5 | [Current Lighthouse](/tmp/darivo-stage3-lighthouse-v5/concierge.json): 99 performance, LCP 2181.85 ms, TBT 51 ms, CLS 0. Much improved, but still above the strict two-second target.        |
| Accessibility        |   8.5 | All sixty matrix states report zero axe/errors/overflow; expanded mobile reading no longer exposes obstructed zoom controls. Recovery screenshot displacement and full AT remain unresolved. |

**Mean 8.4167; minimum 6.5.** The board aggregate is the mean gate; an individual persona does not need a mean of nine. The map score is a material sub-eight defect.

## Three delights

1. The first answer finally addresses my orientation request before presenting fictional homes.
2. The compact request remains expandable, while the persistent Brief lets me inspect assumptions.
3. No-match recovery asks me to make the consequential change. It does not quietly relax beachfront evidence.

## Three problems

1. **Restore visible local geography.** A labelled dot on charcoal cannot teach a newcomer the Palm's shape or relationship to the city. Verify destination pixels, not only readiness attributes.
2. **Make the first phone preview more informative.** Its numbered diagram consumes most available space before the place names and geographical explanation. A compact named orientation would improve learning without inventing school suitability.
3. **Verify recovery focus without losing the surrounding interface.** Requirements captures lose the header and leave black space below the app, although immediate diagnostics report outer scroll zero. The cause is unresolved; do not treat clean axe as proof this transition is comfortable.

[Validation](../validation/README.md) records 275 native tests and 412 execution cases with all thirteen safety counters zero, plus eight reading and nine public production regressions. These do not erase visible map failures. Prior-source CI `496a3f7` passed; current `210f413` CI remains pending. Real-provider evaluation, native Arabic/voice, full AT, physical phone/M1 and field INP are unproven.

**Verdict: Revise—the reading experience has improved materially, but the central local-map teaching action still fails visually.**
