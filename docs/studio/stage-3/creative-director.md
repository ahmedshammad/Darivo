# Stage 3 — Creative Director

Design specification only. The Concierge extends the accepted Noir/Sand Atlas; it must feel like the same private office. Keep local Darivo display/UI fonts, Amiri Arabic display and Plex Arabic UI, quiet borders, restrained warm emphasis and opaque reading surfaces. Avoid a generic bubble-chat skin, dashboard grid, fabricated property imagery or continuously animated AI ornament.

## A useful answer has a visual hierarchy

Lead with a concise answer to the user's actual question, then one main component. Supporting evidence follows the claim it qualifies. A calm next step closes the response; do not append an indiscriminate row of actions. No emojis, sales exclamation marks, fake scarcity or unsupported superlatives.

| Component               | Presentation and required evidence                                                                                                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project cards           | Two or three initially, with a meaningful expand action when more results exist. Title/place, native amount or on-request status, source/date/basis, 2–3 Brief-linked reasons and one concrete trade-off. No unexplained fit percentage.                 |
| Comparison              | 2–4 columns, shared row labels, native currency/basis and completion uncertainty visible. Any conversion states its rate/date/basis. Mobile has a visible horizontal-scroll hint; labels remain understandable while moving between columns.             |
| Mini-map                | A compact geographic context/action surface that opens or drives the one main LivingMap. Do not allocate a new WebGL scene for every historical reply. A static preview must be actual geographic imagery/data with attribution, not decorative map art. |
| Payment timeline        | Milestones, dates/relative timing, percentages and original total. Validate the total; keep missing dates and indicative plans explicit. Never invent a reference project's plan to fill the specimen.                                                   |
| Price-versus-area chart | Label units, currency, dates, sample definition and Demo/indicative status. Include an equivalent data table. Do not call a single demonstration unit a community average.                                                                               |
| Day-in-place itinerary  | A readable sequence linked to places. Separate fictional illustration from sourced venue facts; do not imply verified travel durations, opening hours or school admission.                                                                               |
| Developer card          | Name, supplied factual milestones and dated sources. Distinguish an editorial project association from partnership or endorsement. Missing track-record evidence becomes an honest gap.                                                                  |

Existing `Price`, `SourceChip`, `TrustBadge`, `ComparisonTable`, `LayerChip` and relevant state components provide a foundation. `BriefPanel`, `ProjectCard`, `PaymentTimeline` and composer need production contracts rather than direct specimen reuse: remove hardcoded Demo assumptions only when the actual supplied basis supports another label. Preserve the design guide itself as a specimen.

## Persona-specific composition

Karim receives two clearly named objectives before the comparison. A North Coast home and Dubai investment must not collapse into a single cheapest-first list. His deadline is visible before an attractive but late-handover recommendation. Currency conversions are explanatory projections, never silently substituted native prices.

Elena first needs an intelligible map and plain-language neighbourhood differences. Use the added orientation labels but retain their measured limits: mobile Saadiyat can omit a supplemental label; native duplicates occur. School guidance must not acquire authority from polished cards when the underlying points are fictional.

Sheikha receives a composed Arabic response that preserves the Saadiyat/Palm alternative. Privacy is a Brief requirement to verify, not a badge inferred from a waterfront address. Native Gulf editorial validation remains necessary; Arabic visual polish alone cannot certify the tone.

## States are part of the composition

Empty: a short invitation and the three usable demo prompts, with Demo context visible. Generating: a precise status and Stop action, retaining previous content. Cancelled: completed content remains, the unfinished reply is labelled incomplete, and draft/retry remain available. Error: explain whether history loaded, the reply failed, or an action could not apply; provide the corresponding retry without a second optimistic duplicate. No results: show which constraints were applied and propose an explicit editable relaxation, never silently drop the deadline or location.

Source metadata uses comfortable support type, ordinary contrast and wrapping. Keep factual content separate from model interpretation. Optional detail can collapse; basis, native currency, source date/unknown date and Demo/reference distinction cannot be hidden solely inside a tooltip.

Review the first slice in both languages and themes at 1440/1024/390, with 375px and 500px-high focused evidence checks. Record all three complete journeys before Stage 3 scoring. Existing Stage 2 scores are context, not advance approval of the Concierge.

## Implementation audit — before production review

All eight typed component variants have concrete renderers: project cards, comparison, mini-map, payment timeline, price/area chart, itinerary, developer card and notice. Recommendations retain reasons, a trade-off and source basis. Reference facts and fictional demonstrations remain distinct; unknown availability, retrieval dates and unsupported schedules are not filled with invented values. Original source wording is retained when a faithful localized display value is supplied.

The inline mini-map uses bundled Natural Earth geography and authorized named anchors, with keyboard actions directed to the one main map. Its coarse regional coastline is explicitly not a street, plot, school-catchment or reclaimed-island map. Charts separate native currency/area-unit groups and disclose static FX; itineraries are illustrative planning slots, not confirmed appointments or validated routes. These qualifications are part of the product rather than fine-print exceptions.

Development evidence in `docs/reviews/stage-3/media/elena-v3` shows the completed draft cleared, a compact composer and three readable neighbourhood anchors in sampled English/Arabic desktop, tablet and phone layouts. Earlier captures and failures remain available. The complete production matrix, authored journey recordings and scored review are still pending. Native Gulf editorial review, live commercial availability and physical-device visual assessment remain unproven.
