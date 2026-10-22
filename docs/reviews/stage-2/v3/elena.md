# Elena Rossi · Stage 2 third review

This is a **simulated self-audit**, not a client interview or independent external approval: the reviewer implemented Arrival and earlier preferences. Scores cover Stage 2 Arrival and Living Map, not later concierge, payment-plan or private-office workflows. No native Gulf reader, physical phone, M1, screen-reader or field-INP certification is claimed. Earlier failed rounds remain unchanged.

Evidence keys used below:

- **M:** [Current v4 matrix](../media/v4/manifest.json), [fallback matrix](../media/v4/fallback-manifest.json) and EN/AR signature checkpoints in [media/v4](../media/v4/). The parent capture records 24 configurations plus eight Home fallback states, with no recorded axe violations, page errors or document overflow. Representative screenshots were visually inspected; the retained signature videos are not claimed as independently reviewed frame by frame.
- **F:** [Fresh EN/AR 390px fallback probe](../media/v4/fallback-compare/checks.json). After manual pan/zoom, June and Orla both refit. Actual unforced clicks on both 44×44 targets open the correct evidence heading with focus. Enter opens/closes the compact limitations disclosure. No cross-border driving minutes, errors or overflow. This supersedes the older notice-occlusion result only for this tested pair.
- **L:** [Current Arabic local-pair screenshot](../media/v4/fallback-compare/ar-local-compare-map.png) and [projected points/hit-test evidence](../media/v4/fallback-compare/ar-local-compare.json). With «فيلا على البحر في السعديات أو النخلة», the first two selected cards are Palm Jumeirah and Emirates Hills demo projects. Their centers are (115.65,175) and (274.35,432). The story-control hitbox covers the first; View comparison covers the second. `elementsFromPoint` confirms both interception paths. The screenshot was opened and inspected. Viewport containment alone passed while actual map access failed.
- **N:** Parent-requested retained [numeral and developer-wordmark checks](../media/arrival-v2/checks.json): EN/AR × Latin/Arabic-Indic, prompt and collection years, counters and intact words at 390px. This is earlier targeted evidence, not a fresh full preference test.
- **P:** [Retained production performance v6](../performance/v6/README.md): Home 98 / LCP 2,183.43ms; Explore 96 / LCP 2,329.53ms; CLS0 for both. The strict LCP <2.0 s target remains unmet. The later [font-preload experiment](../performance/v7/README.md) was reverted; the older 1.807 s Home result was not reproduced. [M3 motion samples](../performance/v4/README.md) show moving-frame medians 16.5–16.7ms and p95 17.5–19.7ms in four three-second samples, not sustained physical-device 60 fps or INP.

Source records match supplied reference material; they are not independently verified current market truth. Zero axe findings do not certify WCAG. No UI code was changed during review, and the browser was closed and released. In-flight repairs receive no credit in this round.

“The map is becoming a useful introduction to place. A teaching tool cannot put its own controls over the places I am supposed to inspect.”

## Observed flow

1. Arrival and map/layer checkpoints — useful geographic orientation, with qualified demonstration content.
2. Offline comparison and disclosure — passed actual pointer and keyboard checks; evidence stays reachable.
3. Local comparison — failed: top stories and bottom comparison control intercept the endpoint centers.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                    |
| -------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | M: The globe and spacious prompt establish a confident starting point.                                                                      |
| Originality          |     9 | M: Stories, geographic layers and conversational entry create a distinctive introduction to neighbourhoods.                                 |
| AI-first             |     9 | M: Intent moves the map and preserves requirements; this is not represented as verified school-admissions advice.                           |
| Map experience       |     8 | M/F: Geography and fallback teach relationships, but L puts two comparison targets beneath controls and weakens spatial understanding.      |
| Visual craft         |     9 | M: Source/helper separation and the repaired comparison sheet retain a clear visual hierarchy.                                              |
| Motion quality       |     9 | P: Reduced-motion behavior and sampled M3 cadence support restrained movement; field devices remain untested.                               |
| Arabic & RTL         |     9 | M/F/N: Arabic receives equivalent composition and tested fallback interaction, with explicit language-validation limits.                    |
| Trust & evidence     |   9.5 | M/F: Demo POIs, source basis, approximate geography and straight-line distances are qualified.                                              |
| Discretion & privacy |     9 | M: Exploration does not force an enquiry or imply that my relocation brief was sent.                                                        |
| Developer appeal     |     9 | M: Developer names and supplied project references support orientation without invented claims.                                             |
| Speed                |   8.5 | P: Home/Explore scores are strong, but LCP remains above the required two seconds.                                                          |
| Accessibility        |     9 | F/M: Keyboard limitations and focused evidence work; automated captures are clean. L is a real pointer-access failure despite those checks. |

**Mean 8.9167; minimum 8. Does not pass** the average ≥9.0 / no score<8 gate.

## Three delights

1. “The place comes before the sales pitch.” The map offers geographic context immediately.

2. “Offline still means useful.” Both cross-market endpoints and their evidence remain reachable.

3. “The limitations help me learn.” Demo school/lifestyle content and distance assumptions are qualified.

## Three problems / limits

1. **Teaching targets under controls (L).** Both local markers need clear visual and pointer space. Recheck the real top and bottom overlays at mobile widths.

2. **Unmet speed budget (P).** Home 2.18 s/Explore 2.33 s are improvements, not proof of the required LCP target or physical-phone performance.

3. **Knowledge-validation limit.** Demo school proximity cannot establish British curriculum, admissions or family suitability. Keep that distinction explicit when later concierge work is built.

## Verdict

“Hold: the map needs an unobstructed teaching area before this stage is ready.”

The current local-pair failure is preserved alongside the passing fallback probe. Re-review only after fresh repaired captures; do not substitute an in-flight fix for this evidence.
