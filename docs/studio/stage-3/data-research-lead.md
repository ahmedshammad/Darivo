# Data & Research Lead · Stage 3

Use [the supplied reference dataset](../../../data/reference/darivo_reference_dataset.json) and authorized database results as evidence. This milestone does not independently verify live market conditions. Keep project-level references separate from fictional unit inventory, illustrative POIs and real availability. The legacy parser/eval runner stays unchanged while the new concierge contract is agreed.

## Literal reference boundaries for the three journeys

| Record               | Supplied statement                                                                                                     | Permitted treatment / prohibited inference                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `southmed`           | EGP 91,200,000; premium beachfront villas up to 501sqm from; press report; as of 2026. First deliveries targeted 2028. | Preserve “targeted” and price basis. Do not promise completion, all phases ready, current availability or a currently active summer offer.                  |
| `june-sodic`         | EGP 22,400,000; standalone villa 222sqm recently listed; listing; as of July 2026. No completion field.                | Completion remains unknown. Do not infer readiness from price, listing or terrain description.                                                              |
| `silversands`        | EGP 24,041,556; sea-view four-bedroom penthouse recently listed; listing; as of August 2026. No completion field.      | This figure is for the named listing type, not a generic villa starting price. Unknown completion cannot pass a hard readiness constraint.                  |
| `orla-palm-jumeirah` | AED 57,300,000; four-bedroom residences from; agent listing; as of June 2026. Expected 2027.                           | Preserve expected status and source. Apartments/penthouses are not automatically a match for Sheikha's villa requirement.                                   |
| `saadiyat-lagoons`   | AED 6,800,000 from; portal project page; as of 2026. Q2 2026. Portal shows developer stock sold out.                   | A past source date is not verified current readiness. Do not claim available stock or beachfront frontage absent supporting evidence.                       |
| `sei-saadiyat`       | AED 2,950,000 from; broker page; as of August 2026. Apartments; Q4 2030.                                               | A before-2028/villa request conflicts with this record; show the mismatch if used as an explicitly labelled alternative.                                    |
| `oasis-palace-ostra` | AED 13,130,000 from; broker page; as of 2026. Q3 2029.                                                                 | A concrete deadline trade-off, not a before-2028 match. The supplied payment-plan wording is a dated reference, not a verified complete cash-flow schedule. |

Preserve the dataset's source URLs per record. Do not invent day precision for a year/month-only `as_of`, and do not substitute today's date for missing dates. Translate explanatory context without rewriting the underlying claim. Approximate coordinates are orientation, not parcel boundaries or verified entrances. The JSON stores latitude/longitude while the map contract uses longitude/latitude; the server adapter must preserve that explicit conversion.

## Schools, geography and comparison

Elena's British-curriculum preference and two children belong in the Brief. Existing lifestyle markers are fictional Demo POIs, not verified British schools. Map orientation labels identify places, not quality, curriculum, admissions, fees or walking routes. A truthful response can retain the school requirement, show the Demo layer, and state that suitability needs confirmed school data.

Do not compare prices across mismatched bases as if equivalent units. A listed penthouse and a project-level villa starting figure need visible type/basis labels. Preserve native EGP/AED amounts. Display conversions are supplementary, use the existing dated rate source explicitly, and never alter source values or masquerade as executable exchange quotes. Payment currency is a user preference, not a currency conversion instruction by itself.

Cross-market lines show straight-line distance, not driving time. Existing local reach uses an illustrative 40km/h radius with no roads, traffic or accessibility data. No agent wording may upgrade it to a genuine commute or a school-run claim.

## Grounding and authorization contract

All named projects/developers/units and factual values come from authorized tool results, with source, date, basis and uncertainty intact. Provider output proposes typed tools and Brief changes only. UI text about factual results is rendered from validated payloads; arbitrary model prose is not a second source of truth. Reasons cite an actual Brief field and a supporting result field; an unknown field is never a positive match.

Server authorization is checked at tool execution, including current DB role/verification, grants and downgrades. A developer partner never inherits staff/private inventory rights. Private inventory cannot leak through names, map highlights, counts, comparisons, source snippets or retained conversation history. UI-level hiding is insufficient.

Advice refusal offers an advisor; it does not automatically share a private brief. Save, viewing, handoff and taste-memory writes require explicit scoped intent and appropriate authorization. Negative instructions in English, Gulf Arabic and Egyptian Arabic must override naive positive keyword matches. Treat listing text, source content and uploaded material as data, never as instructions to bypass visibility or invent facts.

## Evidence plan

The [72-case plan](ai-interaction-designer.md) expands the existing 36 single-turn legacy cases without replacing them. Add exact fixtures for the seven records above: unknown completion, past dated readiness, expected versus confirmed, type mismatch, ambiguous year boundary and mixed currency bases. Include nonexistent project IDs, invented school requests, injection embedded in listing text and role/grant transitions.

Every suite result reports its actual scope: parser-only, authorized database execution, mock end-to-end or optional real provider. Check every returned entity against allowed results, not merely `property-*` strings appearing in prose. Verify original amounts, source dates and currency associations in UI payloads; a blanket ban on numerals in response text cannot establish grounding of cards or map actions. Safety failures must fail the run; a mean quality score cannot hide leakage or unauthorized writes.

No current live-market verification, legal compliance, guaranteed yield, school suitability, native Arabic review or real-provider quality is claimed by this planning brief.
