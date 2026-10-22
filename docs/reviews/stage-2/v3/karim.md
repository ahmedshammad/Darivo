# Karim Hassan · Stage 2 third review

This is a **simulated self-audit**, not a client interview or independent external approval: the reviewer implemented Arrival and earlier preferences. Scores cover Stage 2 Arrival and Living Map, not later concierge, payment-plan or private-office workflows. No native Gulf reader, physical phone, M1, screen-reader or field-INP certification is claimed. Earlier failed rounds remain unchanged.

Evidence keys used below:

- **M:** [Current v4 matrix](../media/v4/manifest.json), [fallback matrix](../media/v4/fallback-manifest.json) and EN/AR signature checkpoints in [media/v4](../media/v4/). The parent capture records 24 configurations plus eight Home fallback states, with no recorded axe violations, page errors or document overflow. Representative screenshots were visually inspected; the retained signature videos are not claimed as independently reviewed frame by frame.
- **F:** [Fresh EN/AR 390px fallback probe](../media/v4/fallback-compare/checks.json). After manual pan/zoom, June and Orla both refit. Actual unforced clicks on both 44×44 targets open the correct evidence heading with focus. Enter opens/closes the compact limitations disclosure. No cross-border driving minutes, errors or overflow. This supersedes the older notice-occlusion result only for this tested pair.
- **L:** [Current Arabic local-pair screenshot](../media/v4/fallback-compare/ar-local-compare-map.png) and [projected points/hit-test evidence](../media/v4/fallback-compare/ar-local-compare.json). With «فيلا على البحر في السعديات أو النخلة», the first two selected cards are Palm Jumeirah and Emirates Hills demo projects. Their centers are (115.65,175) and (274.35,432). The story-control hitbox covers the first; View comparison covers the second. `elementsFromPoint` confirms both interception paths. The screenshot was opened and inspected. Viewport containment alone passed while actual map access failed.
- **N:** Parent-requested retained [numeral and developer-wordmark checks](../media/arrival-v2/checks.json): EN/AR × Latin/Arabic-Indic, prompt and collection years, counters and intact words at 390px. This is earlier targeted evidence, not a fresh full preference test.
- **P:** [Retained production performance v6](../performance/v6/README.md): Home 98 / LCP 2,183.43ms; Explore 96 / LCP 2,329.53ms; CLS0 for both. The strict LCP <2.0 s target remains unmet. The later [font-preload experiment](../performance/v7/README.md) was reverted; the older 1.807 s Home result was not reproduced. [M3 motion samples](../performance/v4/README.md) show moving-frame medians 16.5–16.7ms and p95 17.5–19.7ms in four three-second samples, not sustained physical-device 60 fps or INP.

Source records match supplied reference material; they are not independently verified current market truth. Zero axe findings do not certify WCAG. No UI code was changed during review, and the browser was closed and released. In-flight repairs receive no credit in this round.

“I can finally reach June and Orla from the same small map, even offline. I still need comparisons to work reliably whichever pair I choose.”

## Observed flow

1. Cross-market brief after manual pan/zoom — retained and refitted correctly.
2. June and Orla evidence — both actual pointer targets work in EN/AR; headings receive focus.
3. Limitations and comparison wording — keyboard disclosure works; distance only, no cross-border minute estimate.
4. Arabic local-pair control overlap — failed, so the passing cross-market pair cannot establish general comparison reliability.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                        |
| -------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | M: Cinematic Arrival still makes the two-market journey inviting.                                                               |
| Originality          |     9 | M/F: The atlas organizes Egypt and the UAE spatially rather than as a generic listing grid.                                     |
| AI-first             |     9 | F: Both markets, 2028 and GBP/EGP wording remain in the recorded request; no claim of implemented payment-plan reasoning.       |
| Map experience       |   8.5 | F: June/Orla both accept actual pointer clicks after manual pan/zoom. L exposes a separate reproducible local-pair obstruction. |
| Visual craft         |     9 | M: Source cards, comparison sheet and responsive Arrival retain the repaired visual hierarchy.                                  |
| Motion quality       |     9 | P: Measured M3 camera cadence supports purposeful motion in the sampled cases.                                                  |
| Arabic & RTL         |     9 | F/N: The cross-market flow and limitation disclosure work in Arabic; numeral settings have targeted retained evidence.          |
| Trust & evidence     |   9.5 | F/M: Original source values and distance-only wording are explicit; 2,746.7 km is not sold as a driving route.                  |
| Discretion & privacy |     9 | M: My brief is retained without an automatic enquiry or public sharing action.                                                  |
| Developer appeal     |     9 | M: Source-backed projects and intact developer names provide credible context without invented inventory.                       |
| Speed                |   8.5 | P: Improved scores and LCP deserve credit, but current Home/Explore remain above the stated budget.                             |
| Accessibility        |     9 | F: Four actual endpoint clicks across EN/AR open focused evidence; keyboard disclosure works. L remains a map-access defect.    |

**Mean 8.9583; minimum 8.5. Does not pass** the average ≥9.0 / no score<8 gate.

## Three delights

1. “Both markets are finally in reach.” June and Orla work through actual pointer interaction at 390px.

2. “You kept my brief.” Year and currency intentions remain visible in the recorded English and Arabic requests.

3. “The qualification is useful.” Long-distance comparison avoids an invented driving-time claim.

## Three problems / limits

1. **Comparison is not reliable for every pair (L).** Both endpoints of the local Arabic pair are under controls. Apply safe-area framing and test control intersections.

2. **Speed target remains unmet (P).** Improved Lighthouse scores do not establish LCP <2.0 s or field INP.

3. **Scope limit.** Retaining GBP/EGP intent is not proof of payment-plan or FX decision quality; those later-stage workflows need their own evidence, rather than a claim of current completion.

## Verdict

“Hold: my cross-market repair passes, but the comparison system still has a confirmed local failure.”

The current local-pair failure is preserved alongside the passing fallback probe. Re-review only after fresh repaired captures; do not substitute an in-flight fix for this evidence.
