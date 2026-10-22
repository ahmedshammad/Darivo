# Critic / Head of Sales — interim inspection of selected C, capture v3

This is a simulated-persona evidence note. **It is not the final repaired-concept score.** The studio has announced a targeted v4 revision; final scores remain pending its fresh captures and quality evidence.

## Visible improvements proved by v3

- [Desktop dark Home](../media/v3/c-home-en-dark-1440.png): the globe retains only deliberate anchors, so country text no longer collides with the headline. Noir replaces the earlier teal atmosphere. The two-market story and conversational first action now read together.
- [Arabic light mobile Home](../media/v3/c-home-ar-light-390.png): Amiri provides an intentional, upright editorial voice. The two market panels and composer remain visible within the first screen.
- [Arabic dark mobile Map](../media/v3/c-map-ar-dark-390.png): Dubai, Saadiyat and North Coast controls all survive the breakpoint. The Palm anchor sits above the collapsed reply sheet. This resolves two material v1 objections.
- [English light tablet Map](../media/v3/c-map-en-light-1024.png): the three fictional recommendations now have separate reasons and explicit limitations. Their Demo identity remains visible. The reference spotlight has a clear entry point.

## Open finding carried into v4

Attribution is spatially separated from the composer but remains visibly faint, especially in [light desktop Home](../media/v3/c-home-en-light-1440.png). Source inspection explains why: `#atlas` creates a stacking context at z-index 0, while `.veil` sits above it at z-index 1. The veil also covers attribution inside the map container. Merely changing the attribution's own text colour would not prove the final composited contrast. The fix must be recaptured above the veil.

The parent review also identified contextual-reference and Brief-preservation improvements for v4. This note does not independently claim to have verified those defects or repairs; the next interaction evidence must do so.

## Quality evidence received

[V3 quality data](../media/v3/quality.json) reports 12 locale/theme/width configurations, each with zero recorded Home/Map axe violations and no horizontal overflow. Local LCP samples range from 48–72 ms. The rendering sample contains 128 frames, median 16.6 ms and p95 18.3 ms.

These are local Chrome prototype observations, not throttled 4G or physical-device certification. The parent noted possible concurrent browser review during the frame sample, so the final performance interpretation should use the planned controlled v4 pass. The LCP observation does not establish time until the WebGL geographic canvas is fully useful.

## Probe limitation

A supplementary Arabic source-dialog/keyboard probe was stopped before it produced screenshots because it waited on the README's `window.__conceptMap` handle, which is not exposed by the current prototype. The shared helper exposes `window.__map`. No success, source-dialog review, reduced-motion result or keyboard result is claimed from that aborted probe.

## Judgment held

The concept has materially improved and its core layout defects are repaired. The final review must inspect v4, including source-dialog context, preserved user intent, visible attribution, recordings and controlled quality results. No numerical score is assigned to this interim inspection.
