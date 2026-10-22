# Motion Designer — Stage 0

## Motion thesis

Movement answers a question: where am I, what changed, or where did the selected object go? Darivo needs camera direction and editorial continuity, not a library of decorative entrances.

## Concept A motion grammar

- Home to Explore: headline yields to the conversation rail while the map retains its place; 480ms ease-out.
- Place selection: one 1200ms camera flight with a bounded zoom, pitch and bearing; no repeated orbit.
- Button feedback: 160ms colour and border changes. No scaling or spring bounce.
- A small status line announces the destination. Text appears immediately and does not wait for the camera.
- No automatic infinite flights, parallax or flashing light columns in the prototype.

## Accessibility contract

With `prefers-reduced-motion: reduce`, all interface transitions collapse and camera duration is zero. Input is usable from the first paint. Keyboard focus is visible and never moved merely because the camera moved. A user can navigate with explicit destination buttons rather than gestures.

## Deferred production work

The Stage 0 static prototype demonstrates the direction, not measured 60fps or shared-element production transitions. Stage 2 must record frame timing on named hardware and profile the map with columns and layers. Stage 4 must prove that scroll storytelling remains navigable with motion disabled.

## Review disagreement

The creative desire for an unprompted wide-to-near opening must remain subordinate to input readiness and reduced motion. A single optional arrival flight is preferable to a cinematic intro that the client must wait through.
