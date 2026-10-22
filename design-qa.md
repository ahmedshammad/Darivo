# Arrival implementation · Stage 2 visual QA

Scope: the approved Noir Atlas Arrival screen and its new production Home integration. This is an implementation fidelity check, not the independent Stage 2 client score gate or a claim that later-stage features are complete.

## Evidence and normalization

- Source visual truth: `docs/reviews/stage-0/media/v4/c-home-en-dark-1440.png`.
- Implementation: `docs/reviews/stage-2/media/arrival-check/en-dark-1440.png`, rendered from `/en?theme=dark` in local Chrome.
- Both images are 1440 × 1000 pixels, CSS viewport 1440 × 1000, device scale 1. No density normalization was needed. Both represent public, English, dark, empty-intent Arrival.
- Combined full-view comparison: `docs/reviews/stage-2/media/arrival-check/source-arrival-comparison.png`. Source left, implementation right. Combined focused header/headline region: `source-arrival-type-comparison.png` in the same folder. These combined images were opened and visually compared.
- Additional directly inspected states include Arabic light at 390 × 844, English dark at 390 × 844, Arabic dark at 1024 × 1000, source disclosure open, and typed Palm/school intent. Screenshots and machine observations are in `docs/reviews/stage-2/media/arrival-check/`.
- Settled local geography evidence: `en-dark-390-intent-settled.png`. Camera arrival and deck creation do not imply that newly requested vector tiles have loaded; the earlier intent captures with incomplete tiles are retained as timing evidence, not judged as finished geography.

## Findings and comparison history

1. **Resolved P1 — globe missing.** Early screenshots showed the UI on a black field. The map owner corrected the canvas positioning/height specificity. The combined desktop comparison now shows the actual globe in the intended dominant position.
2. **Resolved P2 — Arabic horizontal overflow.** Long developer names exceeded the two-column mobile grid and shifted the RTL viewport. The Arrival grid now uses zero-minimum tracks, minimum widths and appropriate wrapping. The fresh Arabic screenshot and four-config measurements show no document overflow.
3. **Resolved P2 — mobile controls competing with attribution.** The composer moved above the dedicated evidence strip; opened source disclosure hides the floating composer and shore cards. The source control, attribution and close interaction were exercised in both languages.
4. **Resolved P2 — responsive camera race.** Updating responsive zoom with an unchanged camera key could retain desktop framing on mobile. Mobile now has its own initial camera key. The final EN/AR observations both confirm zoom 1.35 before the five-second approach and 1.5 afterward.
5. **Resolved P2 — shore cards covering the local target.** Recognized intent hides both shore teasers. The settled Palm screenshot shows the island, local label and project column in the resulting clear middle region.
6. **Resolved P2 in Arrival v2 — mobile wordmark fragmentation.** The formal v1 review found `Ora Developer / s` and `Palm Hills Developm / ents` in the Arabic 390px Home. `docs/reviews/stage-2/v1/sheikha-04-developer-crop.png` preserves the defect. Arrival v2 uses one full-width mobile column and wraps at spaces. The freshly opened `docs/reviews/stage-2/media/arrival-v2/ar-latin-developers.png` shows intact words and deliberate multi-line organization names. All four locale/numeral configurations report no broken words or horizontal overflow.
7. **Resolved P2 in Arrival v2 — static numeric copy ignored the preference.** Arabic-authored years stayed Arabic-Indic even with Latin numerals selected; collection/section numbers could remain Latin with the opposite preference. Display formatting now first normalizes either digit alphabet, then applies the preference to prompt years, collection titles/captions and section counters, as well as Market Pulse. `docs/reviews/stage-2/media/arrival-v2/checks.json` confirms EN/AR × both preferences. User-authored input and stored source values are unchanged.

No actionable P0/P1/P2 Arrival-owned visual difference remains in the inspected evidence. Full stage review and the parent capture matrix remain separate acceptance checks.

The subsequent simulated Stage 2 v1 board reviews **did not pass**. They are retained at `docs/reviews/stage-2/v1/{sheikha,karim,elena}.md`. The scoped Arrival fixes above do not imply repair or approval of Explore's comparison framing, panel overlap, story teaching or Arabic evidence. Those owners and a fresh independent stage review determine the overall result.

## Fidelity surfaces

- **Fonts and typography:** the same serif display voice, italic English accent, spaced wordmark and small sans-serif controls remain. The production heading is slightly larger, with the same centered single-line desktop structure. Arabic uses its deliberate Amiri display composition and Arabic UI face; it was visually inspected, without claiming native-reader certification.
- **Spacing and layout:** the dominant central globe, high centered introduction, flanking shore cards and bottom conversational entry match the approved hierarchy. The navigation is simplified for actual routes. Mobile intentionally uses stacked heading lines and wider globe framing. Sources occupy a separate accessible strip.
- **Colors and tokens:** near-black, warm ivory and muted gold remain the primary balance. The light variant uses sand and dark text. Four focused configurations report zero axe AA violations; this is automated evidence, not complete accessibility certification.
- **Image quality and assets:** the world is real MapLibre geography, with the shared geographic fallback supplied by the map owner. Source glowing market points are now count clusters from actual permitted demo/reference data. This is an intentional functional-data substitution. No invented property render, logo or custom raster imitation was added. Lucide supplies UI icons.
- **Copy and content:** the signature headline and conversational premise remain. Production copy replaces simulated-concierge language with a spatial-preview disclosure. Market Pulse has source/date/basis; five Collections and nine developer text wordmarks come from the shared data/contracts. Reference data is not independently verified current market truth. The below-fold editorial additions implement the master brief and have no exact Stage 0 screenshot counterpart.

## Interactions and limits

`checks.json` records four focused configurations: zero page errors, zero axe violations, zero overflow, three stat cards, five collection links, nine developer links, openable map sources and EN/AR intent transfer into Explore. `final-checks.json` records both mobile locales' responsive camera, Cairo timezone approach, hidden shore teasers and honest unavailable-voice fallback. Parent separately reported three passing Atlas E2E tests. Own Arrival ESLint and project TypeScript checks passed before handoff; the parent owns the complete final regression run.

The microphone uses the browser speech API only after a click. The unavailable API path was exercised; real speech capture and service-dependent transcription were not recorded. Automated screenshots are local Chrome evidence, not physical-device performance certification. Placeholder rotation is disabled under reduced motion; the map renderer handles instantaneous reduced-motion camera movement.

## Implementation checklist

- [x] Correct renderer canvas integration and preserve map attribution.
- [x] Correct Arabic mobile overflow and mobile intent occlusion.
- [x] Verify public-data-only Home, bilingual navigation and camera/query handoff.
- [x] Verify responsive initial framing, restrained approach and voice fallback.
- [x] Open combined source/implementation full view and focused typography comparison.
- [x] Freeze Arrival files for independent formal stage capture.

Follow-up polish: a later approved visual refinement could make numeric map clusters quieter than the current functional default. This does not prevent reading or using the Arrival screen. The map owner is adding observable settled-tile readiness for reliable review capture.

final result: passed

## Production capture follow-up

The intermediate production matrix at `docs/reviews/stage-2/media/v2/` revealed two additional Arrival defects despite zero axe/overflow findings: tablet helper text crowded the source disclosure, and Arrival's duplicate fallback status overlapped LivingMap's own notice. The tablet composer now sits 24px higher, while the mobile override is retained. Arrival announces loading only; LivingMap owns fallback status.

The repaired files `media/v3/arrival-ar-light-1024-viewport.png` and `media/v3/fallback-arrival-ar-dark-375.png` under the same Stage 2 review folder were opened and visually checked. Both text collisions are resolved. The final capture includes all 24 EN/AR/theme/breakpoint layouts, eight forced-fallback mobile states and completed EN/AR signature recordings. The seven-persona scored review remains a separate stage gate.
