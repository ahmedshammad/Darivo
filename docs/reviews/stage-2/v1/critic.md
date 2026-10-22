# Stage 2 v1 — The Critic

**Simulated persona review, not a real external reviewer or user study.** This review covers the Arrival and Living Map, including their current interactions. It does not score the unbuilt Stage 3 agent, Stage 4 office or Stage 5 developer showcase as though they already existed. The reviewing agent also contributed Explore implementation; these findings are an explicit self-audit, not independent human certification.

I would stop at this arrival. I would not yet call the experience finished. The globe, serif headline and two geographic doors create a clear identity. Once I begin using the phone, however, the map controls, source controls, comparison and conversation compete for the same pixels. That is a product problem, not a screenshot-polish problem.

## Evidence and flow

The supplied current capture matrix is `../media/v1/manifest.json`: 24 route/configuration states at 1440, 1024 and 390, EN/AR, dark/light, with zero reported axe violations, horizontal overflow or page errors. I inspected the current files directly, including EN dark desktop Arrival, EN light full-page Arrival, AR light mobile Arrival/Explore, AR dark tablet Explore and EN dark desktop Explore. A fresh reduced-motion mobile probe is saved in `../media/v1/critic/interaction.json`.

1. **Arrive — visually strong.** [Desktop arrival](../media/v1/arrival-en-dark-1440-viewport.png) and [Arabic phone arrival](../media/v1/arrival-ar-light-390-viewport.png) give the prompt a clear place and use actual geography. Full-page [Sand arrival](../media/v1/arrival-en-light-1440.png) carries sources through Market Pulse and uses text developer names without implying partnerships.
2. **Enter Explore — functional, less explanatory than it looks.** [Desktop Explore](../media/v1/explore-en-dark-1440.png) has real geographic columns and source-qualified cards, but a large near-black sea area and very few named neighbourhoods. The repeated “reference point for understanding this market” is a disclaimer, not a useful explanation of Dubai.
3. **Step through Islands — healthy manual route.** [Stop 1](../media/v1/critic/01-mobile-story.png) and [Stop 2](../media/v1/critic/02-mobile-next.png) show distinct Palm settings. Reduced motion disables playback, leaves next/previous usable and preserves the caption. The caption repeats the same generic sentence at both stops instead of teaching the difference between them.
4. **Open evidence — sound content, broken mobile composition.** [Evidence](../media/v1/critic/03-mobile-evidence.png) preserves the original currency, date precision and unknown completion. Heading focus and return to the originating project button passed. Expansion pushes the map-source control behind the Map tools/2D row.
5. **Compare — calculations disclosed, placement fails.** [Comparison](../media/v1/critic/04-mobile-comparison.png) explicitly states straight-line distance and a 40 km/h assumption. The floating card covers the expanded sheet’s title and composer. An accessible DOM and zero axe findings do not make this layering coherent.
6. **Choose an office / fall back — honest but unfinished.** [Office selection](../media/v1/critic/05-office-point.png) asks for a point rather than guessing a personal address. [Offline geography](../media/v1/critic/06-fallback.png) remains selectable and names its reduced detail; its notice overlaps the story selector.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                                                                                                                  |
| -------------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     8 | Arrival is distinctive and restrained; the dark Explore overview loses geographic legibility in a large near-black field. Arrival desktop and Explore desktop frames above.                                                                               |
| Originality          |     9 | Globe to geographic columns, with a conversation as the entry point, is recognisably different from a property portal.                                                                                                                                    |
| AI-first             |     8 | Current Stage 2 demo guidance changes camera/layers and retains the typed request; mobile comparison covers the composer. Full model reasoning is outside this stage.                                                                                     |
| Map experience       |     8 | Actual geography, deliberate origin selection, source-readable estimates and working story stops; sparse place labels and repeated captions fall short of teaching a city quickly.                                                                        |
| Visual craft         |     7 | Three reproducible overlay collisions in mobile evidence, comparison and fallback. Frames 03, 04 and 06.                                                                                                                                                  |
| Motion quality       |     8 | Manual reduced-motion story steps and camera-key updates work; purposeful choreography is present. This is not a measured physical-device frame-rate pass.                                                                                                |
| Arabic & RTL         |     8 | Amiri heading hierarchy and reversed rail are convincing. AR1024 project locations and price qualifiers remain English; original source text is honest but needs an adjacent concise Arabic explanation.                                                  |
| Trust & evidence     |     9 | Original amounts, price qualifiers, reported dates, unknown completion, approximate coordinates and on-request availability remain visible. Sources are not replaced by fictional real-project units.                                                     |
| Discretion & privacy |     9 | Office/school placement is deliberate, no enquiry is sent automatically, and no unsolicited urgency or sharing is shown. Full permission correctness is covered separately, not inferred from screenshots.                                                |
| Developer appeal     |     8 | Text-only real identity is respectful and evidence is strong; a tall narrow source card and generic geographic explanation are not yet a memorable project presentation.                                                                                  |
| Speed                |     7 | Capture manifest has Home map-ready 1.336–14.948 s and tiles-ready 1.942–15.519 s; Explore tiles-ready 1.298–9.310 s. These local capture timings are not LCP and not a controlled production benchmark, but the variability prevents a high speed score. |
| Accessibility        |     7 | Base captures pass axe and keyboard checks, but the signature harness confirms the comparison heading intercepts clicks on the mobile collapse handle. See failed-signature.log.                                                                          |

**Average: 8.00/10. Minimum: 7. Gate: FAIL.**

## Three delights

1. The desktop globe gives two markets a single editorial identity without stock property photography — `arrival-en-dark-1440-viewport.png`.
2. The Palm Central evidence admits “Completion: Not provided” and keeps “Residences available on request”; restraint here is part of the luxury — `critic/interaction.json` and frame 03.
3. Keyboard focus returns to the newly rendered project button after evidence closes, and reduced-motion stories remain usable manually — the fresh interaction log.

## Three problems and required fixes

1. **Recompose expanded mobile states.** Give comparison a section within the expanded sheet or a dedicated modal with clear dismissal. Put source access in a stable location that cannot collide with top tools. Test the combined story + selection + comparison state, not only each control separately. Frames 03/04/06.
2. **Make the map teach something.** Add a small, carefully chosen neighbourhood label hierarchy and different sourced or geographic captions at each story stop. Explain place selection in relation to the recognised place, not the same generic sentence on every card. Desktop Explore and story frames 01/02.
3. **Prove a fast arrival and preserve Arabic clarity.** Collect production LCP/INP/render samples separately from third-party tile readiness; show a graceful useful loading transition when tiles are late. Keep original source qualifiers, but accompany them with faithful Arabic wording. Manifest and `explore-ar-dark-1024.png`.

**Verdict:** “The identity is credible. The phone still exposes several independently designed layers; make them behave as one product before calling this stage done.”

Evidence limits: production performance was pending at review time. No physical M1 laptop, mid-range phone, native Gulf-reader panel or comprehensive screen-reader audit was performed. The zero-axe result is useful evidence, not a WCAG certificate. Motion findings rely on the current captured flow and manual reduced-motion probe, not the prior stage’s performance results.

## Signature failure retained

The full mobile signature did **not** complete. At `scripts/capture-atlas.mjs:120`, after two comparison selections, the “Between these places” heading repeatedly intercepted clicks on `.atlas-sheet-handle`. The control was visible and enabled but unreachable by pointer. This lowers Accessibility to 7; it is a confirmed task blocker rather than a visual-only risk.

The [failure log](../media/v1/critic/failed-signature.log) is preserved alongside the raw incomplete recordings [first attempt](../media/v1/page@bd2c15346ad6d101d027ce108e5c07c2.webm) and [second attempt](../media/v1/page@cb5e3c21c083d7784d7329767eb2cd7a.webm). These are failed-flow evidence, not successful EN/AR signature demonstrations.
