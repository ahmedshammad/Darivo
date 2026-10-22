# Stage 2 — Front-end Lead

`LivingMap(LivingMapProps)` is a lazy client boundary with one MapLibre instance per theme/locale. Consumer code keeps accessible selection, conversational state and sheet geometry outside the renderer. The renderer receives only authorised projects. It does not fetch inventory, infer availability or request precise geolocation.

The local Next lazy-loading guide was read before implementation. MapLibre JS/CSS and deck.gl load progressively; custom styles are local JSON. MapLibreOverlay from `@deck.gl/maplibre` is the documented v6 adapter ([official integration guide](https://deck.gl/docs/developer-guide/base-maps/using-with-maplibre)). The tile provider abstracts vector, glyph, terrain and fallback URLs. Terrain failure degrades independently; WebGL/context failure uses useful 2D geography.

Camera changes use the declarative key and respect reduced motion. Event handlers read current props, so map selection cannot use stale results. Cleanup removes observers, handlers, overlays, map resources and outstanding load timeouts. Disposed asynchronous imports cannot recreate a map. Sources and illustrative limitations are localized and visible.

Initial quality budgets: clamp rendering pixel ratio, no perpetual render loop, cluster at overview zoom, cap overlay data to the authorised curated project set, update layer data only when relevant props or zoom change. Frame timing and Lighthouse remain parent-owned measurements. Scope includes targeted pure geometry tests and type/lint verification; no production build or server restart by this role.

Tradeoff: real open terrain/building coverage varies by place, and external tile availability cannot be guaranteed. The fallback is geographically real but regional; it deliberately exposes the reduced detail instead of presenting a fictional street map. Drive-time and sun/view tools are explicitly illustrative until routing and orientation data are licensed.

## Opt-in renderer evidence

The `.living-map` element exposes `data-map-mode`, `data-map-ready`, `data-deck-ready`, `data-camera-key`, `data-center`, `data-zoom`, `data-pitch`, and `data-moving`. `data-tiles-ready` becomes false at movement start and is refreshed from MapLibre's actual tile-loaded state on `style.load` and `idle`; `data-style-loaded` records the style-load event. Capture after the intended camera key, movement completion **and** tile readiness. Overlay creation alone does not mean the new basemap tiles have arrived. In 2D fallback, tile readiness means the bundled Natural Earth geometry has loaded.

For actual map cadence, dispatch `new CustomEvent('atlas:measure')` on the map root immediately before triggering a camera action. The root emits a bubbling `atlas:metrics` event after a bounded 1,500ms window. Its detail contains `renderer: 'maplibre'`, elapsed `durationMs`, `frameCount`, render-event `timestamps` in milliseconds relative to measurement start, consecutive `intervals`, per-frame camera `moving` flags, and final `tilesReady`. A repeated request replaces an existing measurement. There is no render listener or per-frame measurement work until requested; completion, fallback and unmount remove the listener and timer.

These intervals measure MapLibre render events, not browser RAF or GPU completion. Retain the raw values and moving flags, and report active-flight intervals separately from idle/tile-arrival gaps. Parent captures browser RAF separately; neither metric alone proves a sustained device-wide frame rate. The hook is local DOM instrumentation and sends no telemetry.

## Review v2 repairs

The v1 board found contradictory comparison minutes and an obstructed source/sheet flow. `atlasComparisonMetrics` now owns comparison numbers for both consumers: geodesic distance, and a 40 km/h illustration only for same-country pairs no farther than 150 km. Long or cross-border pairs have no time estimate. Six map tests cover this rule, the reach ring, and padded fallback framing.

The renderer fits 2–4 compared endpoints using consumer padding plus a 35px breathing margin, flattening pitch/bearing for spatial comparison. Padding changes trigger reframing; the network-independent map uses the same padded geographic bounds. Overlay collision repairs remain with the Explore layout owner. Map labels now expose actual OpenMapTiles neighbourhoods at the initial overview rather than waiting until zoom 11, with a clearer coastline and road hierarchy. Offline regional labels are collision-filtered without shifting their coordinates. Cluster-count meaning lives in the existing source disclosure.

References consulted: installed Next `use-client` guide; [MapLibre camera/fitBounds API](https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/); [OpenMapTiles place schema](https://openmaptiles.org/docs/schema/). Renderer smoke captures are in `docs/reviews/stage-2/media/renderer-v2/`; these are development interaction evidence, not performance certification. Formal v1 reviews and captures remain unchanged.

## Production startup repair

The v2 production trace attributes about 4.80 seconds of script evaluation to MapLibre on mobile Home. The initial globe unnecessarily requested detailed z2 vector tiles (roughly 3 MB uncompressed for two observed tiles), global DEM meshes, and deck initialization. The renderer now starts Arrival at world scale using the bundled, attributed Natural Earth land/coastline in a real MapLibre globe. Streets activate at local scale (zoom 5+), deck activates only for visible local columns or requested overlays, and DEM activates only in a pitched view at zoom 11+. Explore completes its basemap frame before attaching deck on `idle`; this is a rendering readiness boundary, not a fixed delay. Anti-aliasing multisampling is disabled, and unchanged project/label data is not resent to workers after every camera move. No device/audit detection or hidden timeout was introduced.

`atlas:measure` accepts optional `{durationMs}` event detail, clamped to 1500–5000 ms (default 1500). The same cleanup applies on finish, replacement, fallback and unmount. New `data-map-detail` identifies regional/local geography; `data-base-painted` marks first basemap idle; `data-deck-ready="not-required"` means a world scene currently has no deck content. Production remeasurement must include the first regional-to-local intent transition, so deferred work is measured rather than assumed harmless. No new performance score is claimed before that run.

The subsequent cold trace isolated synchronous globe shader readiness as a remaining cost. World-scale clusters now retain MapLibre's source cluster index while rendering native accessible buttons; GPU circles/text begin at local scale. The automatic globe remains present. Production v4 scores Home97/Explore90, with 126/237ms total blocking time and zero layout shift. LCP2.34/2.93s remains above the brief's target. Full raw reports, earlier failures and diagnostic limitations are preserved in `docs/reviews/stage-2/performance/v4/README.md`.

Four three-second Arrival/Explore intent probes at1440/390px recorded moving-frame medians16.5–16.7ms on M3 Metal. None of the moving intervals exceeded33ms; one full-window mobile Arrival RAF interval did. This is limited local evidence, not M1 or physical-phone certification, and does not measure INP. Seven focused renderer tests now cover the current geometry and shared numerical rules.

## Actual software capability and pointer follow-up

An ephemeral worker probes a one-pixel OffscreenCanvas context before loading MapLibre. Only explicit CPU renderer names select geographic2D; unknown/blocked/missing capabilities preserve the ordinary path, with a bounded2.5second worker timeout and a post-constructor safeguard. The runtime never persists or transmits renderer names. Real SwiftShader browser tests exercise both locales without mocking canvas. Software-v2 Lighthouse reaches90/94 with73/77ms TBT, while ordinary M3 hardware v8 remains98/96. LCP remains above2seconds on both paths.

The comparison glyph now has a transparent22px-radius picking layer, dispatched before native cluster handling. Production pointer tests select both June and Orla at20px cardinal offsets in EN/AR. Earlier44px checks measured clearance, not actual WebGL hit area; evidence wording is corrected. Open source disclosures temporarily hide competing map controls, restore them on close, and limit their height to the available mobile aperture. Eight fresh manual cases confirm readable qualifications and correct restoration.

## Orientation and reading follow-up

Hosted run39820219793 passes at e5a3052 (Home98/Explore98, LCP2233.1/2219.2ms). The strict2s budget stays open. Native PostgreSQL validation now passes67unit tests and36mock evals. Supplemental orientation is added only after the existing map loads; no extra blocking map dependency is introduced.

Fresh production captures and the next scored board review remain pending.
