# Stage 0 — Data & Research Lead

## Position

Trust must be visible at the point of comparison. A project is an editorial reference; an available residence is a separate, fictional demo unit. Those records must never be joined by implication or by a convenient seed relationship.

## Authoritative inputs

The supplied dataset was copied without changing its contents from `/Users/hammad/Codex-App-Development/Darivov-2/darivo_reference_dataset.json` to `data/reference/darivo_reference_dataset.json`. It contains 13 project records, 10 developer entries and 3 market-pulse records, compiled 22 October 2026. The copy is the source of supplied claims, not evidence of independent verification.

## Binding presentation rules

Every real figure keeps the original as-of text, source link and basis. Listing and agent-listing prices must say “Recently listed from”; press, broker and portal project pages must retain their distinct provenance. Never turn these into developer price lists. Always include “Indicative, publicly reported — confirm with advisor.” Coordinates are approximate community centroids. Real projects have “Residences available on request” and a handoff, never synthetic available units.

## Issues discovered in the supplied records

- `other-uae-luxury` is an editorial placeholder containing several company names, not one real developer. Preserve it as a reference note; do not invent a company, statistics or project showcase for it. Nine entries identify real developer organisations.
- Developer entries lack individual as-of/retrieval dates. Display “Dataset compiled 22 October 2026; source date not supplied”, rather than implying the links were retrieved or verified that day.
- Project dates have day, month and year precision. Preserve the original precision. Freshness flags should conservatively use the beginning of the supplied period and disclose that basis; unknown dates are “Date unavailable”, not fresh.
- Marassi North Coast lacks an as-of date and its price note is explicitly low confidence. No precise price-from figure should be inferred from that range.
- A completion date is a supplied expectation, not a verified delivery event. Saadiyat Lagoons’ reported Q2 2026 date must not automatically become “Delivered”.
- Ostra’s payment-plan prose is insufficient to infer a complete dated schedule. A projection must expose assumptions or remain “Schedule on request”. Never invent milestones for a real project.
- `agent_listing`, `listing`, `broker_project_page`, `portal_project_page`, `press_report` require explicit normalization with the original basis retained.

## Planned data boundary

Add Source, Project, ProjectFact and MarketStat records. Store value, source references, original date text/precision and confidence for each real claim. Separate provenance-rich reference data from 250 fictional demo units and fictional demo projects/developers. Track retrieval attempts separately from source dates. Add a freshness monitor and test that no demo unit can reference a real project.

## Concept constraints

Stage 0 uses actual geographic basemaps and explicitly labeled fictional residence examples. Public map tiles: OpenFreeMap/OpenMapTiles/OpenStreetMap, with attribution. Source: https://openfreemap.org/quick_start/ (consulted 22 October 2026). Custom style derivatives retain attribution. MapLibre 6 terrain API reference: https://maplibre.org/maplibre-gl-js/docs/examples/3d-terrain/ . Concept light columns indicate approximate communities, not verified residence locations or live availability.

## Disagreement and decision

Creative direction benefits from striking real names and figures. The data role rejects any unlinked price simply to improve composition. Decision: source/date rows are part of the visual system, and unknowns remain visible. The dataset's missing dates are data limitations, not copywriting problems to hide.
