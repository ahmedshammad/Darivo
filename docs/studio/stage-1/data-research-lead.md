# Data & Research Lead — Foundation

## Persona starting point

Rajiv asks which number is an actual sourced project fact and which is an illustrative investment assumption. Karim needs the original EGP amount and source date before any conversion. Sheikha needs a geographic reference to be clearly separated from a residence recommendation.

## Decisions

- Preserve the supplied JSON byte-for-byte and retain the original record alongside normalized fields. It has13 real project records,3 market statistics,9 real developer organisations and1 aggregate editorial note. The aggregate is not a company and must not enter a developer count or company showcase as one.
- Store Source and fact-level links rather than treating a whole page as equally current. Source URLs, publisher, basis and confidence are retained. Retrieval dates are nullable: reading the supplied file does not mean its external sources were retrieved. Dataset compilation is separately2026-10-22.
- Preserve year/month/day precision. Missing dates are unknown and need review; they are never fresh by default. Freshness uses conservative date bounds and keeps ambiguity visible. A year-only price should not receive a fabricated day.
- Keep real reference projects separate from fictional demo projects, with250 demo units attached only to the latter and to fictional developers. Enforce this in the database as well as seed logic; a future admin upload must not bypass the boundary.
- Treat listing and agent/broker price bases honestly. They are not developer tariffs. Source-backed real-project units remain on request; no synthetic availability, permits, track records or payment milestones attach to those records.
- Derive plausible fictional community bands using the reference as context, but never present a derived number as a new fact about a real project. Demo POIs and area statistics are explicit demo estimates.

## Concrete edge cases

Marassi North Coast has a low-confidence undated figure: do not promote it to a dated numeric starting price. Saadiyat Lagoons' stated completion quarter does not prove delivered status. Ostra's payment prose is not a dated installment schedule. SouthMED's supplied date remains year-only. Developer positioning and known-for statements have no supplied fact date; compilation is not a substitute.

## Design contract

Price renders with original currency, date precision, basis, source and indicative label. Converted demo values additionally show static FX date/basis. Coordinates are approximate community centroids. Reference source chips need descriptive links and authored Arabic context, without altering the supplied proper names or external source titles. Area references that do not match the requested residence type must say so.

## Acceptance evidence

Seed is repeatable; exact reference counts and record payloads match the file; no real project/developer owns a demo unit; database attempts to create an invalid association fail; private visibility mix is checked; sources retain missing-date semantics. Design guide displays both sourced-reference and demo states in EN/AR and both themes. These checks do not independently verify current market truth, authorize a public offer or certify legal compliance.
