# Stage 3 — Map Experience Designer

Conversation should visibly teach location while preserving the map's scale and the user's control. Reuse the approved single LivingMap: an inline mini-map is a preview/action into that surface, not another WebGL context. Server tools resolve canonical places and scoped project/unit coordinates; provider-supplied arbitrary coordinates never enter the renderer.

Actions carry stable IDs, request/turn identity and Brief revision. Apply once during the active request. Replay, cancelled turns and superseded streams do not move the map. Manual movement remains authoritative until the next explicit request. Moving the camera does not move keyboard focus. Reduced motion uses the established immediate camera transition, and collapsed/expanded sheet geometry remains part of the safe aperture.

A reference project stays on request, a demo unit stays visibly fictional, and approximate coordinates remain approximate. Isochrones keep the existing illustrative straight-line disclosure and speed assumption; comparison cannot imply a cross-border drive time. Stories start from an explicit action, with autoplay false. Unknown school curricula and demo POIs cannot establish suitability.

Validate the bilingual multi-market slice on desktop and narrow mobile: two project groups, comparison framing, changing one objective, map and source inspection, interruption, reload without camera side effects and keyboard parity. Preserve country labels, orientation labels' collision rules, sources and forty-four-pixel endpoint hit targets. No additional cartographic provider or fabricated geography is introduced by this milestone.
