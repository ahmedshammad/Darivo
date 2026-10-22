# Sheikha Al-Mansoori · Stage 2 second review

This is a **simulated self-audit**, not a client interview or independent external approval. The reviewer authored Arrival and earlier preferences. Findings are tied to visible artifacts and recorded behavior; this review cannot certify native Gulf Arabic, physical-phone behavior or screen-reader quality. The failed first round remains unchanged in [v1](../v1/).

Scores judge **Stage 2 Arrival and Living Map**, including spatial comparison, layers, stories, fallback and mobile sheet behavior. Full concierge reasoning, real school suitability, payment-plan comparison, project pages and private-office workflows belong to later stages. Their absence is not counted as a current implementation failure.

## Evidence and limits

- The latest [v3 matrix](../media/v3/manifest.json) covers **24 configurations** across Home/Explore, EN/AR, dark/light and 390/1024/1440. It records zero axe violations, page errors or document overflow. Map-ready timestamps range 480–2,869 ms; these are not LCP measurements.
- [Eight fallback captures](../media/v3/fallback-manifest.json) cover 375/390, EN/AR and both themes, also with zero recorded axe violations, errors or overflow. The Arabic tablet helper is now clear of source disclosure, and the duplicate fallback notice is gone.
- The full matrix was reviewed through representative actual images: `arrival-en-dark-1440-viewport.png`, `arrival-ar-light-1024-viewport.png`, `explore-en-light-1024.png`, `explore-ar-dark-1440.png`, `explore-ar-light-390.png`, both 375px fallback themes/languages, and the EN/AR signature comparison, evidence and layers states. The files are in [media/v3](../media/v3/). The two final signature `.webm` files are retained there; this second review does not claim independent frame-by-frame playback. Motion evidence below comes from measured renderer intervals, not inferred video smoothness.
- The [Arrival numeral/wordmark probe](../media/arrival-v2/checks.json) verifies EN/AR × Latin/Arabic-Indic at 390px: correct prompt/collection years and counters, no broken words and no horizontal overflow. The repaired developer images were opened during the repair check.
- After the parent reported **26 passing full browser regressions**, a necessary missing comparison was independently exercised on production port 3001 at 1440 and 390. [Fresh cross-market observations](../media/v3/karim-cross-market/checks.json) and the three corresponding screenshots preserve both the desktop repair and the remaining mobile failure. No UI code was edited during this review. The browser was closed and released afterward.
- [Production performance v4](../performance/v4/README.md): Home **97**, Explore **90**; LCP **2,340.72 / 2,934.83 ms**, TBT **126 / 237 ms**, CLS **0 / 0**. The separate **LCP <2.0 s target remains unmet**. TBT is not INP. Three-second moving-render samples on **Apple M3 Metal/headless Chrome** have medians 16.5–16.7 ms and p95 17.5–19.7 ms; there were no moving intervals over 33.34 ms in the four samples. This supports near-60Hz in those samples, not sustained 60fps on an M1 or mid-range physical phone. INP and field performance are not established.

Source records are checked against the supplied dataset, not independently verified current market truth. Zero axe findings and passing browser tests are not full WCAG certification. The exact scores below are not rounded up to meet the gate.

“The Arabic detail now belongs to the same experience as the entrance. I still cannot approve a map action that leaves one of the places outside the picture.”

## Observed recheck

1. Re-inspected the Arabic tablet Home: the helper line sits above map disclosure with visible separation.
2. Compared Arabic mobile evidence with v1: ordinary completion and location labels are now localized; source-original proper names remain appropriate.
3. Verified the two numeral settings through the retained four-case probe and intact mobile developer-wordmark captures.
4. Checked Arabic 375px fallback: one renderer notice is readable between the introduction and shore cards; no duplicate message crosses it.
5. Included the fresh mobile cross-market failure in the map score rather than assuming the local Arabic signature proves every comparison works.

## Scorecard

| Criterion            |      Score | Evidence                                                                                                                                                                   |
| -------------------- | ---------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |        9.5 | The Arabic light tablet opening has deliberate type and clear source/helper separation; much faster readiness now supports its first impression.                           |
| Originality          |          9 | The globe, two shores and conversational entry retain a distinctive private-office identity.                                                                               |
| AI-first             |          9 | The original Arabic request remains visible while recognized places drive geography; unverified requirements are explicitly retained rather than fabricated.               |
| Map experience       |        8.5 | Arabic local map/evidence states are clearer, but the independently reproduced mobile cross-market framing failure remains a current-stage limitation.                     |
| Visual craft         |          9 | Tablet spacing and mobile developer word boundaries are repaired; the 375px fallback notice is a single readable block.                                                    |
| Motion quality       |          9 | The recorded M3 moving-render cadence supports restrained smooth movement in the measured cases, with explicit hardware/sample limits.                                     |
| Arabic & RTL         |          9 | `signature-ar-evidence.png` now shows «نخلة جميرا · دبي» and «جاهز (بيانات تجريبية)»; numeral probes cover both preferences.                                               |
| Trust & evidence     |        9.5 | Demo/reference basis, original currency, approximate geography and source qualifications remain explicit and visible.                                                      |
| Discretion & privacy |          9 | The public/private distinction and no-automatic-enquiry wording remain calm; the parent regression also covers retaining handoff context without sending.                  |
| Developer appeal     |          9 | Nine developer names are legible intact words on mobile; sourced project references are presented without implying a partnership.                                          |
| Speed                |          8 | Performance is materially better, but Home/Explore LCP exceeds the explicit two-second budget and physical-device/INP checks remain open.                                  |
| Accessibility        |          9 | 32 captured configurations report zero axe/overflow issues; comparison/evidence are now inside the sheet with visible controls. No screen-reader certification is claimed. |
| **Mean**             | **8.9583** | Gate: average ≥9.0 and no criterion <8.                                                                                                                                    |

## Three delights

1. “The Arabic detail is now coherent.” Completion and familiar geography no longer switch unnecessarily to English.

2. “The small finishing touches matter.” Developer names stay whole, numeric preferences are consistent, and the tablet source line has space.

3. “You explain the limits without selling around them.” Original currency, Demo POIs and source qualifications remain visible.

## Three problems / limits

1. **Current blocker — mobile comparison framing.** The production June–Orla case still leaves Dubai outside the visible map after “Show connections on the map”. A promise to compare places must actually show both. See `../media/v3/karim-cross-market/390-map.png`.

2. **Unmet performance target.** Production LCP remains 2.34/2.93 seconds. Keep the failed budget explicit and improve it; a high Lighthouse score does not replace the target.

3. **Human validation still needed.** A native Gulf reader and assistive-technology user should review idiom and mixed source names/currencies before the product speaks for a family office. This is a validation limit, not a claim that the inspected Arabic is wrong.

## Verdict

“The repair is convincing, but I would hold approval until the mobile map promise and measured speed budget are satisfied.”

**Does not pass the Stage 2 score gate:** mean 8.9583; minimum 8. The new mobile comparison blocker is preserved, not erased by the successful desktop repair. These are bounded simulated scores, not a claim of universal production readiness. Re-review the repaired behavior with new evidence; preserve both failed rounds.
