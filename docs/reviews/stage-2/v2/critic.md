# Stage 2 v2 — The Critic

**Simulated persona self-audit.** The reviewing agent contributed to Explore; this is not an independent human review, external endorsement or native-reader study. This is the second scored iteration, using the repaired production captures in `media/v3`; the unscored `media/v2` captures retained the comparison-scroll defect. Stage 3 agent reasoning and later office/showcase features are outside this review.

This now behaves like one product. Comparison belongs to the conversation, the sources have a stable home, and opening evidence starts at the beginning. The exact failures that made the first phone demonstration unsafe to present are repaired. I still will not quietly turn a measured 2.93-second LCP into a two-second pass.

## Evidence and sequence

The [production matrix](../media/v3/manifest.json) contains 24 configurations: Home/Explore × EN/AR × light/dark × 1440/1024/390. The [fallback matrix](../media/v3/fallback-manifest.json) adds eight Home states at 375/390. Both report zero axe violations, overflow and page errors. These are bounded checks, not a WCAG certificate.

1. **Arrival — strong.** [English Sand desktop](../media/v3/arrival-en-light-1440-viewport.png) retains the wordmark, globe and single conversational entry. [Arabic tablet](../media/v3/arrival-ar-dark-1024-viewport.png) now keeps the helper and source controls apart.
2. **Explore — clear hierarchy.** [Arabic tablet](../media/v3/explore-ar-dark-1024.png) gives the source qualifier and community a faithful Arabic rendering while retaining the proper project name and publisher. Selection reasons now name the community rather than repeating an empty generic assurance.
3. **Compare — repaired.** [Arabic comparison](../media/v3/signature-ar-comparison.png) and [English comparison](../media/v3/signature-en-comparison.png) show the comparison immediately, in the sheet, with its heading and return-to-map action visible. It no longer intercepts the sheet handle or sits above the current scroll position. The supplied production regression asserts heading focus and full viewport intersection after the second selection.
4. **Evidence — repaired.** [Arabic evidence](../media/v3/signature-ar-evidence.png) starts with the Back action visible. The expanded sheet carries reading notes and attribution without overlapping Map tools. The production regression also checks heading focus, Back visibility, Escape and collapse → tools.
5. **Degrade gracefully — honest.** [Arabic mobile fallback](../media/v3/fallback-arrival-ar-light-390.png) explicitly identifies its regional 2D limit without covering the headline or composer. Its geography is still usable as geographic context.
6. **Complete the flow — retained evidence.** The supplied production harness completed both [English](../media/v3/signature-en.webm) and [Arabic](../media/v3/signature-ar.webm) recordings. I inspected their associated current signature stills and the supplied completion result; continuous subjective video playback was not independently evaluated in this file-only review. The separate cadence telemetry below supports the motion score.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                                                                                      |
| -------------------- | ----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | The globe, typographic hierarchy and two geographic doors form one recognisable arrival in both languages. Current Home desktop/tablet frames.                                                                                |
| Originality          |     9 | A conversation-driven geographic atlas with price columns and editorial collections has its own identity, without borrowed property renders.                                                                                  |
| AI-first             |     9 | Stage 2 demo guidance visibly drives the camera and keeps the original request; comparison now reveals itself without taking over the composer. This does not certify the future agent.                                       |
| Map experience       |     9 | Real geography, fit-aware comparison, clearly approximate travel, keyboard origin placement and distinct story-stop captions form a coherent spatial exploration. Initial overview place labels could still be more useful.   |
| Visual craft         |     9 | Comparison, evidence, source controls and fallback no longer collide in the reviewed repaired states. The AR tablet and mobile compositions hold together.                                                                    |
| Motion quality       |     9 | MapLibre moving-event medians 16.5–16.7 ms and p95 17.5–19.7 ms in the supplied four short M3 runs; reduced-motion/manual alternatives and completed signature flows remain available. Bounded evidence only.                 |
| Arabic & RTL         |     9 | Arabic source qualifiers/community names and coherent Amiri hierarchy improve the original-wording-only presentation. Original records remain available; numeral preferences are shared across figures and method prose.      |
| Trust & evidence     |     9 | Native amounts, original qualifiers, source dates, grouped URLs, approximate coordinates and demo/reference boundaries remain explicit. Long or cross-border connections do not masquerade as drive-time routes.              |
| Discretion & privacy |     9 | Chosen personal points are deliberate; handoff preserves a draft without automatic submission; supplied tests cover the contextual sign-in return. No real private-inventory certification is inferred from visuals.          |
| Developer appeal     |     9 | Precise reference identity, contextual handoff and source fidelity now support a credible initial presentation. The later full developer showcase is not being scored here.                                                   |
| Speed                |     8 | Production Lighthouse Home97/Explore90 and much lower blocking time are a real improvement. LCP remains 2.34072/2.93483 s, above the explicit <2.0 s target. INP and physical devices remain unestablished.                   |
| Accessibility        |     9 | 32 matrix/fallback checks report axe0; targeted production cases cover comparison reveal, evidence Back visibility, collapse, keyboard origin placement and no-auto-send handoff. This is not comprehensive AT certification. |

**Average: 8.92/10. Minimum: 8. Individual persona gate: FAIL (average below 9.0).** The seven-persona aggregate decision belongs to the board; this individual result must not be rounded up or relabelled as a performance-target pass.

## Three delights

1. **Comparison became a coherent task.** The Arabic signature shows the place pair, 5.8 km / approximately 9-minute illustrative estimate, method and return-to-map action together. No floating panel interrupts the conversation.
2. **Evidence now respects the reader’s place.** The Back action is immediately visible in the current evidence frame; translations explain the commercial qualifier while the source record remains intact.
3. **The visual identity survived the performance repair.** The Sand globe remains an intentional arrival even after the world overview switched to bundled actual regional geography and deferred heavier local detail.

## Three remaining problems / refinements

1. **Open acceptance gap: LCP.** The [production v4 report](../performance/v4/README.md) still exceeds two seconds on both routes. Keep this visible and improve the startup path or obtain an explicit scope decision; do not cite the Lighthouse score alone as satisfaction of that requirement.
2. **Overview teaching can be more economical.** [Dark tablet Explore](../media/v3/explore-ar-dark-1024.png) still gives much of the canvas to dark sea while showing few area names at the initial zoom. A curated label hierarchy would help a newcomer before they open a story. This is a refinement, not the former phone blocker.
3. **The expanded phone is necessarily reading-heavy.** The source/method area and composer leave a fairly short content window. The current hierarchy works, but future richer responses should preserve this restraint rather than add more permanent controls. Current EN/AR comparison frames show the limit.

**Verdict:** “The phone now has a coherent interaction model. I accept the craft repair; I retain a speed dissent until the stated loading target is met or explicitly revised.”

Limits: Lighthouse used local production with simulated mobile network/CPU settings; cadence used headless Chrome on Apple M3, not M1 or a physical mid-range phone. Three-second samples are not sustained-60fps certification. Full screen-reader testing, native Gulf-language review and field INP are not established. No new live browsing was performed while the shared production capture was running.

**Subsequent finding — historical scores retained:** After this review was written, the cross-market mobile case exposed another definite interaction defect. Comparing June with Orla and choosing “Show connections” left the collapsed phone map on the North Coast, with Dubai outside the visible map. The [390px screenshot](../media/v3/karim-cross-market/390-map.png) and [camera checks](../media/v3/karim-cross-market/checks.json) record center `[28.02,31.10]`, zoom 9 and pitch 48; the desktop case fitted both markets. The earlier verdict therefore does not establish that all mobile comparison framing was correct. A later renderer repair and passing regression have been reported by the implementation team; they require fresh evidence in the next scored review. No scores above have been silently changed.
