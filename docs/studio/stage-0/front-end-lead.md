# Stage 0 · Front-end Lead

## Starting person and job

The Critic judges the first rendered frame; Elena needs the first interaction to feel immediate. Map capabilities cannot justify a blank arrival, a slow composer, or a phone that loses its position after every response.

## Architecture proposal

Keep the existing application runnable while the concept sprint runs in isolated static prototypes. The selected concept becomes design tokens and documented components in Stage 1 before feature implementation. Server components provide authorized facts and source metadata. Small client islands own the composer, map, Brief editor and comparison. A single map controller translates validated UI actions into camera/layer effects. Do not mount multiple expensive WebGL canvases to imitate page transitions.

Define TileProvider for base maps, DEM and attribution. Custom night/sand styles are data files. MapLibre owns geographic navigation; deck.gl owns price columns, comparison links and synthetic area hexes. Geographic truth must survive a 2D fallback: accessible place lists and real map data, not a decorative invented coastline. Offline demo data and keyless development tiles are separate concerns; network map availability must be honestly reported.

## Runtime budgets and measurement

Target LCP below 2 seconds on the agreed 4G profile, INP below 200 ms, and sustained 60 fps on named M1 and mid-range phone devices. Load text/composer before costly terrain, extrusions and deck layers. Bound visible points and cluster remotely or in a worker. Keep source links and captions server rendered. Use local fonts, measured preloads, subset Arabic carefully, and never hide content until a flourish finishes.

Measure real frame times and loading traces, not animation duration as a proxy for performance. Lighthouse CI is a complementary gate, not evidence for a physical phone's frame rate. Save dimensions, browser/version, device, throttle and source availability with every trace.

## Responsive contract

1440: wide map canvas with restrained floating journal and Brief. 1024: narrower instruments, same navigation grammar. 390: thumb-level composer, single readable response, map mode remaining directly reachable. Use logical CSS, proper document direction, explicit bidi isolation of coordinates/currencies, 44px minimum targets and visible focus. Home and Explore default dark; every component supports Sand.

## Concept C implementation boundary

One static HTML page, local fonts and a shared actual geographic map module. Query parameters choose language, theme and Home/Explore. It simulates intent and response state; it does not introduce production routes, database changes, model calls, auth or inventory claims. Map flyTo and primary controls are executable for capture. No prototype claims deck.gl, DEM, offline map availability, a full agent or drag mechanics.

## Disagreement and decision

Glass can obscure geographic context and fail contrast. Use blur only on compact instruments, provide opaque text surfaces, and keep the central map unobstructed. If blur makes a device miss the frame budget, replace it with an opaque tint without altering layout. A full-height cinematic intro is rejected because it delays the first useful action.

## Acceptance evidence

Capture Home and Explore at all three requested widths in both languages and themes; record the signature flow. Check keyboard order, no horizontal overflow, reduced-motion response, map-source failure, and offline text/control usability. Stage 0 screenshots are evidence for concept review, not proof of production accessibility or performance.
