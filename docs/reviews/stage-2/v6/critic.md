# Stage 2 v6 — The Critic

**Simulated persona self-review, not an independent human review.** This agent contributed Explore and earlier accessibility/polish repairs. This sixth scored iteration uses current production `media/v8`; prior reviews remain unchanged. Scope: Stage 2 arrival, geographic discovery and evidence presentation. Later agent features are not being certified.

The opening now has a better technical foundation: the real headline is the first content, and less document data reaches the browser. The captured experience retains its character. I found no new blocking visual defect in the inspected states. The two-second loading requirement still has not been met.

## Inspected sequence

1. **Arrival — strong.** The [English dark desktop](../media/v8/arrival-en-dark-1440-viewport.png) gives the globe, two markets and conversational entry a clear hierarchy. [Arabic light phone](../media/v8/arrival-ar-light-390-viewport.png) preserves that hierarchy within a narrow viewport. These settled screenshots do not alone prove first-paint timing; the trace below does.
2. **Orientation — usable, still sparse.** [English light desktop Explore](../media/v8/explore-en-light-1440.png) places the conversation beside recognizable geography. [Arabic dark tablet](../media/v8/explore-ar-dark-1024.png) gives few neighborhood names before interaction. [Arabic forced fallback at 375px](../media/v8/fallback-arrival-ar-light-375.png) clearly discloses its regional 2D map and unavailable street/3D detail.
3. **Comparison — repaired behavior retained.** The [English cross-market checkpoint](../media/v8/signature-en-comparison-map.png) keeps Egypt and Dubai endpoints visible and separates 2,746.7km from Saudi Arabia. The [Arabic local comparison](../media/v8/signature-ar-comparison-map.png) keeps both endpoints clear of the story menu, comparison control and source strip.
4. **Layers and evidence — coherent, dense on phones.** [Arabic map tools](../media/v8/signature-ar-layers.png) explain Demo POIs and approximate travel assumptions. [Arabic evidence](../media/v8/signature-ar-evidence.png) and [English evidence](../media/v8/signature-en-evidence.png) have opaque reading surfaces, visible Back controls and complete project names. The fixed composer/method area leaves a relatively short window for the actual evidence.
5. **Signature completion — bounded evidence.** The [EN](../media/v8/signature-en.webm) and [AR](../media/v8/signature-ar.webm) recordings are supplied as completed journeys. I inspected their checkpoint stills, not continuous playback. The [24-state matrix](../media/v8/manifest.json) and [eight fallback cases](../media/v8/fallback-manifest.json) report zero axe violations, overflow and page errors.

## Performance and verification boundary

The [paired loading trace](../performance/trace-v2/README.md) improves simulated Home LCP from 2,657.540 to 2,180.506ms and replaces the placeholder/late headline sequence with the real headline as the sole LCP candidate. The [scoped-provider measurements](../performance/v11/README.md) reduce the Home gzip document from 38,555 to 26,434 bytes, or 31.4%; eight sampled layout comparisons remain identical. These are concrete gains, not a claim that all page resources shrink by that percentage.

The same local Lighthouse set scores Home98/Explore96, with LCP2,187.722/2,189.386ms. Its raw reports precede the subsequent standalone-boundary landmark correction; they are not an exact rerun of the final capture build. The supplied eight production no-JavaScript/cross-route/not-found tests pass. Current full regression and CI remain pending; the prior `93103bc` CI is green.

Fresh [M3 Metal cadence](../media/performance-v8/performance.json) covers four three-second Home/Explore probes at1440/390: sampled moving medians16.5–16.7ms, p9517.7–19.6ms, no sampled moving intervals above33.34ms and no errors. Full RAF windows contain one slower interval in each Arrival case and Explore390, none in Explore1440. This is bounded smoothness evidence, not sustained physical-device or field-INP certification.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                             |
| -------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | Desktop and Arabic-phone openings retain a strong hierarchy; the trace now proves real content replaces the placeholder.                                             |
| Originality          |     9 | The two-market globe and conversation form a distinct opening, visible in the desktop Arrival checkpoint.                                                            |
| AI-first             |     9 | Signature map/layer changes respond spatially while the interface identifies demo guidance; full agent reasoning is outside this stage.                              |
| Map experience       |     9 | Both comparison checkpoints preserve visible endpoints and readable connections; initial local naming remains sparse.                                                |
| Visual craft         |     9 | Evidence surfaces, light/dark palettes and English/Arabic type hierarchy remain coherent after payload changes.                                                      |
| Motion quality       |     9 | Purposeful signature transitions and fresh bounded M3 cadence support the implementation; no new physical-device claim.                                              |
| Arabic & RTL         |     9 | Phone, tablet and tools checkpoints preserve RTL hierarchy and readable bilingual names; native-reader validation is absent.                                         |
| Trust & evidence     |     9 | Orla retains its price qualification, agent-listing basis and date; Demo evidence remains explicit.                                                                  |
| Discretion & privacy |     9 | Private-access entry and restrained availability language remain visible; historical scoped-handoff proof is not presented as a fresh security audit.                |
| Developer appeal     |     9 | Full Home presents sourced market context and developer identities with the no-partnership qualification.                                                            |
| Speed                |     8 | Real startup and payload gains are demonstrated, but measured LCP remains above the strict two-second budget.                                                        |
| Accessibility        |     9 | Current zero-axe/overflow captures and supplied boundary/no-JS tests support the repair; prior target/keyboard evidence remains bounded by incomplete AT validation. |

**Persona average: 8.92/10. Minimum: 8.** This contributes to the board-wide average≥9/minimum≥8 decision; it is not a separate individual gate. The loading-budget miss remains open regardless of the aggregate.

## Three delights

1. The real opening survives the loading-boundary repair without a visual compromise: the trace and fresh desktop capture support different parts of that claim.
2. The English cross-market distance remains legible between two visible endpoints rather than competing with country lettering.
3. Arabic evidence retains one complete project name and a quiet reading surface after the shared-provider reduction.

## Three remaining problems / limits

1. **The speed promise remains unmet.** Approximately2.19s LCP is progress, not sub-two-second compliance. Complete the current regression/CI before describing this revision as fully green.
2. **Initial neighborhood teaching is thin.** The dark tablet map shows roads and project geometry with few local names; the coarse fallback cannot fill that gap with street detail. The orientation proposal remains unimplemented and receives no score credit.
3. **Phone evidence has limited reading space.** The Arabic evidence checkpoint spends substantial height on composer and map-method controls before the project facts. Keep future additions from shrinking that window further.

**Verdict:** “The startup repair is real, and the current captures preserve the crafted experience. I support this Stage 2 direction while retaining the speed dissent and the narrower orientation and phone-reading concerns.”

Limits: simulated self-review; no live browser this round, physical phone/M1, native Gulf-reader study, complete assistive-technology journey or field INP. Pending checks receive no credit.
