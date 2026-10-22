# Reference and demo data boundaries

The supplied dataset is imported without asserting that its sources have been independently re-verified. Its original JSON remains in `data/reference/darivo_reference_dataset.json`; each stored developer, project and market statistic also retains its exact original record.

The import has **9 real reference organisations, one aggregate research record, 13 real reference projects and 3 market statistics**. `other-uae-luxury` is `AGGREGATE`, never a company or project owner. Real project records are project-level research and expose `ON_REQUEST` availability; they never include a synthetic unit collection.

`ReferenceFact` stores each supplied field or array item with record-level source links. The dataset does not identify which URL supports each individual sentence, so `citationScope=record` makes that limitation explicit. Prices retain the supplied listing/agent-listing/press/broker/portal basis; other facts use `UNKNOWN` when the dataset does not provide a basis. Source publisher labels are original URL hostnames, not invented corporate attributions.

Source retrieval dates remain null with `UNKNOWN` precision. The dataset compilation date is not a retrieval date. Original `as_of` strings preserve year, month or day precision; absent dates stay null. Freshness is an age range for partial dates rather than an invented exact day. An undated, low-confidence record remains explicitly unknown/low. Invalid calendar dates are rejected by the importer.

The source DTOs return semantic presentation flags (`ON_REQUEST`, `RECENT_LISTING`, `PUBLIC_REPORT`, `indicative`) so renderers must localize their labels. Original source wording and proper names are preserved; translating factual descriptions requires a separately reviewed translation rather than silent rewriting during import.

## Fictional depth

There are 250 deterministic fictional units in 16 fictional projects, under four fictional developers. Visibility is 200 public, 38 verified-only and 12 private-invite. Existing `property-001` through `property-200` identities remain stable so portfolios, viewings and grants retain their relationships. Re-seeding upgrades their price, area and provenance fields to the new fixture specification; it does not delete workflow records. The stable acceptance villa remains AED 8.8M.

Fictional price ranges use supplied country/community reference anchors with explicit synthetic adjustments for type, size and market. They are **Demo estimates**, not observed community valuations. `Project.demoPriceBasis` records the anchor IDs, method and demo FX date. Demo area insights and all synthetic POIs are explicitly labelled; no real school, hospital or marina is asserted by these points.

## Enforcement

Database triggers reject a unit assigned to a real reference developer or project, a demo project assigned to a real/aggregate developer, a project/developer mismatch, and provenance reclassification while dependent units/projects exist. A persisted unit must have a fictional project. Legacy admin creates that omit the new project field resolve to a clearly fictional collection for their demo developer and community. Referenced projects cannot be deleted out from under units.

The public reference data-access module never queries units. Unit lookup remains behind the existing shared visibility-aware data layer. Source metadata and a public project ID never grant access to private unit inventory.

`tests/reference.test.ts` verifies exact import, null retrieval dates, date precision/calendar validity, aggregate exclusion, per-fact citations, unit separation, direct-SQL rejection and reference DTO boundaries. Native PostgreSQL and PGlite migration/seed results are recorded separately by the Stage 1 validation owner.
