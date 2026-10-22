# Map Experience Designer — Project Story discovery

Use one actual geographic map instance for the Story's Place chapter, retaining the accepted LivingMap behavior and fallback. The hero can be an SSR geography-led cover; it is not a second hidden WebGL map. No new map code or assets are created in this discovery.

## The visual handoff

The existing [Arabic Sand arrival](../../reviews/stage-2/media/v9/arrival-ar-light-390-viewport.png) demonstrates geographical atmosphere without invented architectural photography. The [current named-unit timeline](../../reviews/stage-3/media/v8-timeline-final/timeline-en-dark-1440.png) shows local Palm context at a useful scale. Story should inherit that geographic truth, with more whitespace and fewer competing labels.

From Concierge/Explore, preserve authorized entity identity, locale, theme and display preferences. The hero names the place immediately. A real map-derived cover may use bundled Natural Earth geometry with its attribution and approximate-location caption; coarse geography must not masquerade as a detailed parcel boundary. Do not draw a site outline from a single approximate point.

## Embedded map behavior

Current `LivingMapProps` already supplies projects, POIs, selected/highlighted IDs, camera key/padding, layers, sun and fallback hooks. It has arrival/explore modes and layout-dependent controls, not a proven embedded Story mode. Before implementation, agree an embedded layout contract or scoped wrapper that contains attribution/controls within the Place frame. Do not rely on full-viewport fixed positions inside a small panel.

- Begin with selected project and nearby named area at a camera that includes recognizable land and water. There is no universal zoom: coastal district and an individual unit's community need different context.
- Provide Overview and Local controls, a small set of relevant layer chips and Open in Atlas. All camera changes are explicit; ordinary scroll does not continuously rotate or zoom the map.
- Demo POI qualification stays inside the visible map frame in every layout, including when a source disclosure or action bar opens. Selecting a school cannot imply a real school place or driving time.
- Terrain/buildings are actual basemap context. They do not establish a particular project's architecture, permit, sea view or height. The sun/view indicator is orientation only, never a verified unit view or solar study.
- Retain useful geographic 2D fallback for unsupported/software contexts and network failure, with explicit limitations and keyboard-selectable named targets. Canvas focus/pan/Enter behavior and selected-name accessibility must not regress.

## Framing and lifecycle

Compute usable map aperture from its actual container and visible controls, not viewport constants copied from Explore. Reserve marker radius, popup and attribution clearances in both RTL and LTR. On mobile, cap map height to a deliberate normal-flow region and keep sources reachable outside or within a nonoverlapping details panel. Width-only resize must refit only when framing is explicitly requested; user pan/zoom is preserved otherwise.

One observer may initialize the map as the Place chapter approaches view, because that is where interactive geography is offered. The cover, location and evidence render independently and immediately. No arbitrary timer or audit-specific map delay. Once mounted, preserve the instance through reading sections; pause unnecessary continuous work offscreen and dispose listeners/workers on route exit. Stop automatic camera work when the user interacts.

## Evidence and tests

Use source-only project facts for reference entities and authorized demo units for fictional depth. A demo-project grouping must not expose hidden-unit minima/counts. Check actual pixels, loaded local detail and marker hit geometry; `data-map-ready` alone was insufficient in earlier stages. Validate 1440/1024/390, 375 and short-height, both languages/themes, WebGL/software fallback, tile failure, keyboard and reduced motion. Scope map evidence to the Story container and keep source/licence attribution legible. The earlier M3 cadence is a baseline, not proof of Story performance or the M1/physical-phone requirement.
