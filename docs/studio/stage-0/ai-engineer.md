# Stage 0 · AI Engineer

## Starting person and job

Rajiv needs reproducible calculations with explicit inputs; Sheikha needs proof that no private property can cross an authorization boundary. Attractive generated prose is not acceptable evidence for either.

## Proposed system

Retain the existing shared visibility-scoped data-access boundary and evolve it for Developer, Project, Source, MarketStat and Unit. Do not attach fictional units to real projects. Facts are records containing value, unit/currency, basis, as-of date and source identifiers. Retrieval combines structured predicates, PostgreSQL full text and pgvector, always within the same authorization scope. Source age is explicit rather than a model confidence adjective.

AIProvider will support Vercel AI SDK streaming, an OpenAI-compatible adapter and deterministic MockProvider. Tool schemas are strict and versioned. Data tools: search_projects, search_units, get_project, get_developer, compare, area_insights, investment_calc, payment_plan_projection, save_to_portfolio, request_viewing and handoff_to_advisor. UI tools: map.flyTo, map.highlight, map.showLayer, map.drawIsochrone, map.story, ui.showComparison, ui.showTimeline and brief.update.

Tool → component mapping is an allowlist. Entity names and displayed facts are resolved from returned authorized identifiers, never model text. The model proposes actions; the server validates input, authorization and explicit mutation intent. Client map commands contain only scoped IDs and checked geometry. Persisted history is re-authorized at read time so revoked grants cannot remain in old conversations or exports.

## Offline and bilingual behavior

MockProvider needs at least 40 independently tested phrasings spanning English, Gulf Arabic, Egyptian Arabic and mixed inputs. Parse Arabic digits, currency aliases, ambiguous budget units and time ranges explicitly. Preserve existing Brief constraints on follow-up. Cross-market comparison keeps local currencies plus timestamped conversion assumptions. Estimated travel-time layers must say estimate and cannot imply licensed routing when absent.

Prototype C intentionally uses a much smaller deterministic demonstration. It marks its project suggestions as fictional and its conversation as simulated. This is interaction evidence only and must not be counted toward the production MockProvider, 60-case evaluation requirement, or real-data grounding.

## Safety and evidence plan

At least 60 evals cover filters, zero hallucinated entities, zero private leaks, currency, map actions, advice handoff and tone. Safety failure count above zero fails CI. Add revoked-grant conversation, map payload, comparison and PDF checks. Treat retrieved descriptions and uploads as inert data. No legal, tax or financial recommendations; calculations explain arithmetic and assumptions and offer advisor handoff.

Use property-based cases for currency/unit conversions and server authorization, adversarial tool-call cases for malicious instructions and out-of-scope IDs, and end-to-end cases for all three required persona scripts. A source must be reachable and its date available; absence should yield an honest no-data component.

## Disagreement and decision

An animated map can imply routing accuracy without a routing provider. Spatial actions must distinguish exact geometry from illustrative estimates. Prototype cameras use actual place coordinates; demonstration project positions are approximate and fictional. No numerical travel times, yields or prices are invented for real projects. The companion dataset has now been located at `data/reference/darivo_reference_dataset.json`. Production ingestion must validate its records and usage rules; finding the file is not permission to fill gaps with synthesized real-project facts.
