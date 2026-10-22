# Stage 3 — Motion Designer

Design specification only. Motion explains a change in place or information; it never delays input, manufacture progress or repeatedly pull the user away from their chosen map view. Preserve the accepted geographic renderer and its measured limits.

## One owner for map actions

The Concierge controller owns committed map state. Noir's validated contract supplies declarative actions; parent transport delivers them. The renderer continues to accept camera, highlights, layers, comparisons and origin geometry through props. No generated JavaScript or raw map object is exposed to an AI response.

Each action belongs to a turn and Brief revision and has a stable ID. Apply it once while that turn is current. Replayed history renders components but does not replay map side effects. A cancelled or superseded turn cannot move the camera after completion. A manual pan/zoom interrupts an active flight and prevents delayed actions from the same request reclaiming the view. A new explicit user request or “Show on map” action may initiate a fresh camera request.

Explore's current 650ms local interpretation may remain a labelled draft preview only if it cannot fight committed Concierge actions. Do not run two independent authorities against the same camera. Coalesce camera actions within one response so highlighting/layer updates accompany one meaningful flight rather than a sequence of incidental jumps. If an explicit narrative story is requested, retain pause/skip controls.

## Timing and geometry

Use the established approximately 600ms camera flight by default, stopping a prior flight first. Reduced motion uses the same final view immediately. Data/layer changes should remain understandable without animation. Avoid animated text reveal, bouncing pins, pulsing match glows, artificial typing delays and continuous render loops.

A selected project, comparison or origin must be visible in the actual available map aperture. Reuse existing padding/resize handling, including the mobile toolbar, stories, comparison peek, source panel and full target radius. Do not copy a fixed desktop padding into the new Concierge. Measure the occupied reading surface; recompute framing on a real size request, not on every streamed token. Camera changes must not reset user-controlled map position for an unrelated Brief text update.

The mobile sheet uses the accepted transition and explicit keyboard expand/collapse action. During editing or a short viewport, legibility wins over choreography. Keep the compact-to-edit composer change immediate so the caret is visible. Preserve opaque evidence surfaces and suppress redundant map popups while their selected evidence is being read.

## Response choreography and interruption

Reserve only the space needed for genuine loading feedback. Add completed response components in stable document order; do not repeatedly reorder cards while a user is inspecting one. A committed Brief edit can update ranking with a short status and stable focus. Keep evidence expanded and maintain the selected project if it is still valid; explain removal when it no longer fits.

Stop immediately disables further visual actions for that turn and stops its owned flight if one is active. Completed components remain readable and partial content is labelled incomplete. Retry replaces or continues the failed response through stable IDs rather than duplicating the user's message. On route change, cancel outstanding animation/recognition/stream listeners; no late callbacks update an abandoned scene.

## Persona moments and evidence

Karim: one purposeful cross-market framing reveals Egypt and UAE together, then comparisons stay still while native prices and deadlines are read. Elena: one neighbourhood change and its related school layer explain the geography; no unsolicited island tour. Sheikha: show both requested alternatives or move to the selected one without treating “or” as a resolved preference.

Validate response → camera → manual interruption → next explicit request in both languages and with reduced motion. Measure actual map render cadence and browser RAF separately during first local-detail load and comparison changes. Preserve the accepted progressive loading and real software-renderer fallback. The latest Stage 2 M3 probes are supporting history, not proof that added Concierge streaming and components preserve the same budget. Fresh physical M1/phone, field INP and strict LCP evidence remain required or explicitly unresolved.

## Implementation audit — before production review

The Concierge owns one main LivingMap. Authorized current-turn actions drive its declarative state; historical snapshots never replay camera commands. A user's map movement or explicit card/map action suppresses subsequent map commands from the same request. Stop freezes the owned camera and rejects late actions. Distinct Stop/Send elements and prevention of the Stop click's default action fixed an observed duplicate submission. Recognition, TTS and stream cleanup are handled on departure.

Mini-map previews are lightweight SVG geography, not extra WebGL scenes. Choosing a place clears competing comparison framing before moving the main map. Stories are explicit continuation links to the existing Atlas narrative rather than an autoplay sequence inside Concierge. Reduced-motion behavior inherits the renderer's immediate final view. The composer contracts only after a successful reply; cancellation/failure preserve the user's text.

Sampled development captures and focused interactions support these transitions, but no new Concierge performance budget is certified. Stage 2's bounded M3 cadence is historical evidence; it does not measure concurrent streaming, charts, long history or mobile speech. Fresh production render/RAF measurements, strict LCP, field INP and physical M1/phone checks remain open. A complete manual interruption and next-request journey should accompany the production review.
