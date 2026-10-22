# Darivo geographic styles

`noir.json` and `sand.json` are Darivo-authored MapLibre styles using the OpenMapTiles schema served by OpenFreeMap. They retain source attribution. Roads, water and building geometry are real OpenStreetMap data, whose coverage varies. Building height comes from the vector source, not project price. DEM is Mapterhorn Terrarium512 at true elevation, without exaggeration.

`natural-earth-land.geojson` is the unmodified Natural Earth 1:110m land dataset, downloaded 2026-10-22 from the Natural Earth maintainer repository: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson . Data are public domain: https://www.naturalearthdata.com/about/terms-of-use/ . Used only for the explicitly reduced-detail, offline 2D fallback. It is actual generalized geography, not a schematic illustration or street map.

Runtime remote hosts: `tiles.openfreemap.org` for vectors/glyphs; `tiles.mapterhorn.com` for terrain. No raster imagery or copyrighted developer art is used. Natural Earth fallback data and styles are local, so network failure retains geographic context.
