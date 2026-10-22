# Sheikha Al-Mansoori · Stage 2 v1

This is a **simulated persona review**, not a client interview, native Gulf Arabic sign-off, screen-reader certification or physical-device benchmark. This reviewer implemented Arrival and earlier preferences, so the review is not an independent external design audit; conclusions are tied to captured evidence. No production files were edited during review.

Scores judge **Stage 2 Arrival and Living Map**. Full conversational reasoning, financial comparison/payment plans, project stories and private-office workflows belong to later stages. Their absence is not scored as a Stage 2 implementation failure. Spatial comparison, sources, layers, stories and the mobile sheet are current-stage responsibilities.

The formal [manifest](../media/v1/manifest.json) contains **24 configurations**: EN/AR × dark/light × 390/1024/1440 × Home/Explore, with zero reported axe violations, page errors or document overflow. Directly opened screenshots include EN-dark Home/Explore at 1440, EN-light Explore at 1024, AR-light Home at 1024 and Explore at 390, AR-dark Home at 390, and the complete AR-light mobile Home. Zero overflow does not establish that floating controls do not cover one another.

Independent Chrome flows with reduced motion were exercised at 390×844 (Sheikha/Elena) and 1440×1000 (Karim). [client-interactions.json](client-interactions.json) records original briefs, actual displayed cards, camera state, source context, compare text, layer states and keyboard return focus. Both signature videos were sampled at explicit moments, documented in [video-observations.json](video-observations.json). The supplied signature harness subsequently failed: comparison overlays the sheet handle. The raw files remain failed-run evidence. The mobile Home recording `page@bd2c15346ad6d101d027ce108e5c07c2.webm` is 7.48 s: 1.00 s shows map preparation and 6.48 s shows the typed two-market camera state. `page@cb5e3c21c083d7784d7329767eb2cd7a.webm` is 18.12 s and 17.12 s still shows “Preparing your collection…”. These samples demonstrate state changes, not successful end-to-end navigation or 60 fps.

Manifest map readiness ranges from 706 to 14,948 ms in the local development run; this is **not LCP**, and it does not establish production performance. No physical phone, native Gulf reader, production INP/LCP or screen-reader session was certified. Source records match the supplied dataset; current market truth was not independently verified. No private listing leak was observed, but this was not the full Stage 4 security audit.

“The entrance feels private and composed. Once I open the detail, the Arabic and the crowded controls stop feeling equally considered.”

## Observed flow

1. Opened the Arabic light Atlas on mobile and entered a beachfront Saadiyat-or-Palm request with an explicit privacy condition.
2. Submitted: the original sentence remained visible and the map settled on Palm. Nine cards included Saadiyat references as well as nearby Dubai/Abu Dhabi demo places.
3. Opened the first demo card: original AED value and demo disclosure were explicit, but completion displayed `ready` under «الإنجاز».
4. Pressed Escape: focus returned to the opening project button.
5. Inspected the full mobile Arabic Home and cropped the developer wall at the exact source-image coordinates for readable evidence.

## Scorecard

| Criterion            |    Score | Evidence                                                                                                                                                       |
| -------------------- | -------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |      8.5 | AR-dark mobile Arrival has a deliberate display composition; the recorded initial map-preparation phase tempers the first-five-second claim.                   |
| Originality          |        9 | The globe and two-shore conversational entry are distinct from a listings portal.                                                                              |
| AI-first             |        8 | Arabic places visibly move the map; the entire family/privacy brief remains readable, with unmatched requirements honestly disclosed (`sheikha-01-brief.png`). |
| Map experience       |        8 | Palm/Saadiyat are represented, but nearby unrelated areas also appear and the expanded sheet leaves little geographic context.                                 |
| Visual craft         |        8 | The main Arabic headline is elegant; the mobile developer wall breaks ordinary English words midword (`sheikha-04-developer-crop.png`).                        |
| Motion quality       |      8.5 | Reduced-motion interaction is restrained; recorded camera changes exist, without certified frame timing.                                                       |
| Arabic & RTL         |      7.5 | RTL structure is coherent, but completion is rendered as `ready` and location/price fragments remain English in Arabic evidence (`sheikha-02-evidence.png`).   |
| Trust & evidence     |        9 | Demo and reference are visibly distinguished; original currency, missing date and source basis are explicit. Missing facts are not filled with inventions.     |
| Discretion & privacy |      8.5 | No pushy urgency or automatic enquiry. The full privacy condition is retained, but source/URL retention behavior requires clearer future privacy validation.   |
| Developer appeal     |        8 | The reference wall gives visibility to nine organizations; broken wordmark wrapping weakens the premium presentation.                                          |
| Speed                |        8 | Typing and evidence opening responded locally; the manifest has long map-readiness outliers and no production-budget proof.                                    |
| Accessibility        |        8 | Escape restored the selected project control; the expanded mobile sheet leaves source disclosure underneath Map tools despite zero axe violations.             |
| **Mean**             | **8.25** | Stage 2 gate requires ≥9.0 and every score ≥8.                                                                                                                 |

## Three delights

1. “My privacy condition stays in my own words.” The original Arabic sentence survives submission without claiming it has verified privacy suitability.

2. “The evidence is willing to say what it does not know.” Demo status, unknown dates and original currency appear in the detail panel.

3. “The arrival has the right temperament.” Amiri display, sand/ink themes and the quiet private-office invitation feel deliberate.

## Three problems

1. **P2 — finish the Arabic evidence vocabulary.** Translate ordinary UI values such as completion `ready`, short price qualifiers and available city/community labels while preserving source quotations as originals. Evidence: `sheikha-02-evidence.png` and the recorded text.

2. **P2 — reserve space for mobile controls.** In the expanded Arabic sheet state, map sources sit underneath Map tools and depth controls. Give evidence its own non-overlapping position or deliberately hide redundant controls. Evidence: `sheikha-01-brief.png`.

3. **P2 — repair the developer wall.** `Ora Developer / s` and `Palm Hills Developm / ents` look broken. Use word-boundary wrapping, a smaller type size or a single-column compact layout. Evidence: `sheikha-04-developer-crop.png`.

## Verdict

“I would keep this direction, but I would not approve the Arabic and mobile execution yet.”

**Does not pass:** mean 8.25; minimum 7.5. Preserve this v1 evidence and re-review fresh repaired captures. No score has been raised to satisfy the gate.
