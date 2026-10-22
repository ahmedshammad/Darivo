# Map Experience Designer — Stage 0

## Spatial thesis

Elena should understand the relationship of a place to the city before she sees a price. The map should remain legible behind the editorial foreground and become the main work surface after her first question.

## Concept A treatment

Use a real geographic tile surface in a warm, muted night treatment, with a sand counterpart. The camera begins over Dubai's coast; Palm Jumeirah, Saadiyat and Egypt's North Coast are explicit destination controls. Selecting one changes the camera and the location readout. UI labels distinguish approximate demo positioning from verified project locations.

On desktop, keep a conversation rail at the inline start and a selected-place dossier near the lower opposite edge. On mobile, use a compact conversation sheet with the map visible above it. Avoid a permanently open card grid. Map attribution is never covered.

## Next-stage choreography contract

`map.flyTo` must consume validated coordinates. Selection updates the camera, selected light column, dossier and accessible status together. Reduced motion uses an immediate camera change. Narration must explain what changed. Real drive times require licensed routing or a clear estimate label; a circle must never masquerade as an isochrone.

## Prototype limits

The shared MapLibre helper supplies actual map tiles. This stage does not claim production terrain, deck.gl columns, routing, licensed POIs, 60fps, or real price encodings. The selected demo project is a fictional concept around a real community. No made-up buildings, simulated CSS coastlines or unsourced developer geography are allowed.

## Evidence required

Capture Home and Explore at 1440, 1024 and 390 in both languages and themes. Record a location change and conversational map transition. Check attribution, gestures, keyboard alternatives, map fallback and the relationship between the dossier and map at every size.
