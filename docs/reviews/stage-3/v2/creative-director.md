# Stage 3 v2 — Creative Director synthesis

**Decision: FAIL. Continue Stage 3.** This is a simulated contributor review, not independent client validation. The 84 scores average **8.3333**, minimum **6.5**; neither gate passes. Exact arithmetic is retained in `scores.json` and the seven reports remain unchanged.

The first repairs improved the product: exact community matching, visible calculation assumptions, concise teaching and explicit no-match recovery all work. The 60-state matrix has no axe violations, page errors or horizontal overflow. Performance is now 99, LCP 2181.85ms and TBT 51ms, but the strict two-second LCP target remains open. Hosted CI for the earlier repair commit `496a3f7` passed; the current recovery commit has a separate pending run.

## Required repairs

1. **Map readiness and continuity.** Local map checkpoints display markers on a flat field even when the captured readiness flag says tiles are ready. Later isolated diagnostics on the same build show the correct Palm coastline and streets without changing code or removing deck.gl. This indicates a readiness/loading race rather than permanent loss of geometry. Preserve useful geographic context during detail loading and make readiness evidence reflect the actual detailed source. Regional comparisons also need named geographic/endpoint context rather than anonymous cluster counts alone.
2. **Named-request targeting.** “Show SouthMED payment plan” leads with ORLA and unrelated project groups. A named project question must resolve that project and answer its schedule evidence directly, without changing other objectives or silently reusing another selection. Unknown schedules must remain unknown.
3. **Reading frame continuity.** Requirements and supplementary captures lose the header and leave black space below the interface. Immediate window scroll is zero, so diagnose all scroll containers and focus timing before choosing a fix. Keep movement within the reading panel.
4. **Evidence and numerical craft.** “Source unknown” ambiguously labels an unknown evidence basis despite a visible source link. Use precise basis wording. Remove repeated installment labels and resolve overlapping chart labels while retaining visible original values and qualifications.

The recorded strict Sheikha request still has no verified match. Refined results follow an explicit client decision to permit unknown beachfront evidence, with the original preference and location retained. No review treats those records as matches to the original strict request.

## Next evidence

Repair the named-request and map/reading transitions, then rerun targeted regressions, production capture and review. Preserve v2 as the failed iteration; passing tests alone cannot erase the observed failures. Physical-device cadence, field INP, native Arabic/speech and assistive-technology validation remain distinct unresolved checks.
