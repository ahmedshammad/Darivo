# Orientation follow-up — proposed, not implemented

Read-only assessment of the current Stage 2 `media/v7` captures and renderer source. No application edits, browser session, build, new provider or score credit. Revisit after the parent's measured startup experiment.

## Observed gap

[Initial phone Explore](../../reviews/stage-2/media/v7/explore-en-dark-390.png) and [Arabic desktop](../../reviews/stage-2/media/v7/explore-ar-light-1440.png) show geography and project markers but few area names to orient a newcomer. The [Arabic fallback arrival](../../reviews/stage-2/media/v7/fallback-arrival-ar-light-390.png) correctly discloses regional 2D geography; this is not evidence of street-level fallback detail.

`FallbackMap` currently caps solo zoom at7 and labels only Dubai, Abu Dhabi, North Coast, Cairo and Red Sea. Its land source is the existing Natural Earth110m geometry. Merely adding neighborhood labels at that scale would crowd them: projected Palm Jumeirah-to-Jumeirah Bay/Downtown/Dubai Hills/Palm Jebel Ali distances are approximately13/15/11/19 CSS pixels atzoom7. Atzoom10.5 they become145/167/125/211 pixels, using the same existing coordinates and Mercator projection. These are calculated screen separations, not measured interaction or new geographic claims.

## Smallest useful candidate

- Allow **Explore-only solo zoom up to10.5** for an approximate place view. Keep Home's regional cap7 and comparison cap12 unchanged.
- Belowzoom9 retain the broad region names. Atlocal zoom use existing `ATLAS_PLACES` names/coordinates for Palm Jumeirah, Palm Jebel Ali, Jumeirah Bay, Downtown Dubai and Dubai Hills; include Saadiyat in its existing Abu Dhabi context. Add no new places or inferred neighborhood boundaries.
- Prioritize the requested/nearest place; show at most3 labels on phones and5 on desktop, only where they fit. Use a few alternative label anchors and collision checks against other labels, visible controls and44px project-target clearance areas. Selected comparison relationships take precedence. Labels remain noninteractive and must not intercept project clicks.
- For the WebGL initial map, put the same limited local names into the existing collision-managed annotation path aroundzoom9–12. Avoid duplicating visible basemap names or displacing selected comparison labels.
- Keep the actual simplified land geometry. Explain approximate area positions and simplified coastline in the existing fallback disclosure, alongside unavailable street/3D detail. Do not invent palm-island outlines, streets, exact boundaries or lifestyle claims. A closer projection is not a more detailed basemap.

The zoom change and fallback names are one candidate: at the current cap, label-only treatment cannot reliably separate the Dubai places. If enlarged coarse coastline proves confusing in screenshots, do not present it as neighborhood detail; retain the fallback cap and consider only the WebGL naming improvement.

## Validation before acceptance

1. Capture EN/AR, both themes,375/390/1440 at initial Dubai, typed Palm/Downtown and Abu Dhabi/Saadiyat, plus manual pan/zoom and phone sheet states. Require at least two readable known area names in the exposed initial phone map where geometry permits; never force labels into controls to hit a count.
2. Assert names and positions come unchanged from `ATLAS_PLACES`. Check actual label rectangles against controls and project targets. Exercise project pointer selection and keyboard-origin placement to confirm labels never steal input.
3. Re-run nearby/cross-market framing, source disclosure and fallback paths with external tiles blocked. Confirm Home regional presentation and source attribution remain intact.
4. Inspect enlarged fallback coastline before deciding whether it teaches more than it confuses. Record limitations, screen evidence and any failed cases. Do not claim street detail, physical-phone performance, native Arabic validation or score improvement from source inspection alone.
