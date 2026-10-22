# Sheikha Al-Mansoori · Stage 2 third review

This is a **simulated self-audit**, not a client interview or independent external approval: the reviewer implemented Arrival and earlier preferences. Scores cover Stage 2 Arrival and Living Map, not later concierge, payment-plan or private-office workflows. No native Gulf reader, physical phone, M1, screen-reader or field-INP certification is claimed. Earlier failed rounds remain unchanged.

Evidence keys used below:

- **M:** [Current v4 matrix](../media/v4/manifest.json), [fallback matrix](../media/v4/fallback-manifest.json) and EN/AR signature checkpoints in [media/v4](../media/v4/). The parent capture records 24 configurations plus eight Home fallback states, with no recorded axe violations, page errors or document overflow. Representative screenshots were visually inspected; the retained signature videos are not claimed as independently reviewed frame by frame.
- **F:** [Fresh EN/AR 390px fallback probe](../media/v4/fallback-compare/checks.json). After manual pan/zoom, June and Orla both refit. Actual unforced clicks on both 44×44 targets open the correct evidence heading with focus. Enter opens/closes the compact limitations disclosure. No cross-border driving minutes, errors or overflow. This supersedes the older notice-occlusion result only for this tested pair.
- **L:** [Current Arabic local-pair screenshot](../media/v4/fallback-compare/ar-local-compare-map.png) and [projected points/hit-test evidence](../media/v4/fallback-compare/ar-local-compare.json). With «فيلا على البحر في السعديات أو النخلة», the first two selected cards are Palm Jumeirah and Emirates Hills demo projects. Their centers are (115.65,175) and (274.35,432). The story-control hitbox covers the first; View comparison covers the second. `elementsFromPoint` confirms both interception paths. The screenshot was opened and inspected. Viewport containment alone passed while actual map access failed.
- **N:** Parent-requested retained [numeral and developer-wordmark checks](../media/arrival-v2/checks.json): EN/AR × Latin/Arabic-Indic, prompt and collection years, counters and intact words at 390px. This is earlier targeted evidence, not a fresh full preference test.
- **P:** [Retained production performance v6](../performance/v6/README.md): Home 98 / LCP 2,183.43ms; Explore 96 / LCP 2,329.53ms; CLS0 for both. The strict LCP <2.0 s target remains unmet. The later [font-preload experiment](../performance/v7/README.md) was reverted; the older 1.807 s Home result was not reproduced. [M3 motion samples](../performance/v4/README.md) show moving-frame medians 16.5–16.7ms and p95 17.5–19.7ms in four three-second samples, not sustained physical-device 60 fps or INP.

Source records match supplied reference material; they are not independently verified current market truth. Zero axe findings do not certify WCAG. No UI code was changed during review, and the browser was closed and released. In-flight repairs receive no credit in this round.

“The Arabic entrance feels composed and discreet. But the map must let me reach the places it asks me to compare.”

## Observed flow

1. Arabic Arrival and evidence — visually coherent; tablet helper/source spacing remains clear.
2. June–Orla fallback comparison — passed actual pointer and keyboard checks in EN/AR.
3. Arabic local comparison — failed: both endpoint centers are covered by interactive controls.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                |
| -------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |   9.5 | M: Arabic light tablet and mobile Arrival retain intentional display type, globe and clear helper/source separation.                                    |
| Originality          |     9 | M: The two-shore, conversational atlas remains recognizably Darivo.                                                                                     |
| AI-first             |     9 | L: My original Arabic request stays visible while it drives geography; this is bounded intent behavior, not full concierge reasoning.                   |
| Map experience       |   7.5 | L: Both local comparison centers are intercepted by controls. F passes, but does not repair my Arabic local journey.                                    |
| Visual craft         |     9 | M/N: Tablet spacing, intact developer names and consistent numeral preferences retain the repaired finish.                                              |
| Motion quality       |     9 | P: Restrained motion is supported by measured M3 cadence, within the stated sample limits.                                                              |
| Arabic & RTL         |     9 | M/N: Localized evidence, deliberate Arabic type and both numeral settings are coherent; native-reader validation remains open.                          |
| Trust & evidence     |   9.5 | M/F: Demo/reference basis, original values and limitations remain explicit; distant comparisons do not invent driving times.                            |
| Discretion & privacy |     9 | M: Public/private separation and no automatic enquiry language suit a discreet first visit.                                                             |
| Developer appeal     |     9 | M/N: Nine legible developer names and sourced project records avoid suggesting an invented partnership.                                                 |
| Speed                |   8.5 | P: Lighthouse98/96 and improved LCP, but both current-stage routes still exceed two seconds.                                                            |
| Accessibility        |     9 | F/M: Keyboard disclosure and focused evidence work; zero captured axe issues. The pointer obstruction is penalized under Map experience, not dismissed. |

**Mean 8.9167; minimum 7.5. Does not pass** the average ≥9.0 / no score<8 gate.

## Three delights

1. “The entrance speaks with restraint.” The Arabic mobile/tablet composition remains calm.

2. “The small details hold together.” Numeral preferences and intact developer names retain their repairs.

3. “You tell me what the map knows.” Source qualifications and fallback limits are discoverable.

## Three problems / limits

1. **Blocking local-map access (L).** Reserve both the top story-control zone and bottom comparison/source zone; retest actual hit targets, not only viewport coordinates.

2. **Unmet speed budget (P).** Home 2.18 s and Explore 2.33 s exceed the explicit 2.0 s LCP target; INP is unestablished.

3. **Human validation limit.** Native Gulf idiom and assistive-technology behavior need direct review before this experience represents a family office.

## Verdict

“Hold: the Arabic local comparison must be usable before the stage is approved.”

The current local-pair failure is preserved alongside the passing fallback probe. Re-review only after fresh repaired captures; do not substitute an in-flight fix for this evidence.
