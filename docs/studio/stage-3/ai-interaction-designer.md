# AI Interaction Designer · Stage 3

The objective is a concierge that constructs an editable Brief and visibly drives grounded UI. The legacy single-location parser and 36-case runner remain untouched during this milestone. New shared types belong to `src/lib/concierge.ts`, coordinated with Noir; this document defines requirements, not competing field names. Parser, tests and the new runner begin only after the contract is agreed.

## Conversation and Brief contract

Use a versioned, revisioned Brief with market-specific purposes, places and original budgets; optional household/curriculum; deadline semantics; must-haves and exclusions; explicit privacy/action prohibitions; and opt-in taste memory. Separate preferred display currencies from payment currency. Preserve raw utterances/provenance for ambiguous values. Support set, replace and removal rather than merge-only updates. Do not turn a blank/unknown value into a fabricated fact.

The visible six groups are purpose, locations, budget/currency, timeline, must-haves and deal-breakers. Multiple markets must remain visible within these groups. All are editable; editing re-ranks results and refreshes fit/trade-off explanations. Persist only accepted revisions. Streamed updates must not overwrite an active local edit; a stale revision needs explicit reconciliation rather than silent last-write-wins behavior. Deleting a location also removes incompatible dependent city/country constraints.

The parser returns typed intent/patch/tool proposals, not arbitrary factual prose. Geography IDs come from the canonical catalogue. Tool execution rechecks current authorization. Read-only map/search/compare proposals may run during discovery; writes require explicit scope and server validation. A refusal or request for discretion must not itself create a handoff. Taste memory has visible consent, retained values and deletion controls.

## Required flows

Use the six opening scripts in the [Arabic lead brief](arabic-typography-rtl-lead.md). Each flow has at least three turns and runs in EN and AR without an API key:

1. Sheikha supplies alternative islands and privacy intent. Show both areas, retain villa/beachfront requirements, explain source mismatches and ask one missing preference. Correct Jebel Ali to Jumeirah, then inspect evidence without sharing the request.
2. Karim supplies holiday and investment goals in different markets. Preserve both, clarify the ambiguous year boundary when necessary, show source timelines including unknowns, then compare original EGP/AED figures. Changing display currency must not rewrite source values or payment intent.
3. Elena requests explanation rather than a sales shortlist. Orient the map with readable neighbourhood names and a concise comparison. Preserve two children and British curriculum. School points are Demo data, so show the limitation before treating them as evidence of suitability.

Each grounded card needs two or three reasons tied to actual Brief fields and one honest trade-off. A project that misses a hard deadline or has unknown completion must not be silently presented as a full match. An itinerary can be illustrative only when its POIs and travel assumptions are explicitly qualified.

## Forty concrete phrasing targets

These are planned acceptance inputs, not a claim of current parser support. Multi-turn entries run after an appropriate prior Brief. Structural expectations below and the language brief determine assertions.

| ID  | Input                                                                          | Main assertion                                         |
| --- | ------------------------------------------------------------------------------ | ------------------------------------------------------ |
| P01 | A beachfront villa on Saadiyat or Palm Jumeirah for my family.                 | Two alternatives; beachfront/villa/family.             |
| P02 | North Coast summer home ready by 2028, compare with a Dubai investment.        | Two markets and purposes; deadline ambiguity retained. |
| P03 | Explain Dubai neighbourhoods for a family with two kids near a British school. | Teaching, household and curriculum.                    |
| P04 | Not Palm Jebel Ali; I mean Palm Jumeirah.                                      | Replace, do not add both.                              |
| P05 | Keep Dubai, remove the North Coast deadline.                                   | Market-specific removal only.                          |
| P06 | My North Coast budget is EGP 30–40 million.                                    | Range tied to one market.                              |
| P07 | Show values in GBP, but I will pay in EGP.                                     | Display/payment distinction.                           |
| P08 | Before 2028, not during 2028.                                                  | Exclusive year-start boundary.                         |
| P09 | Do not save this or contact an advisor.                                        | No writes or sharing.                                  |
| P10 | Explain the trade-offs; do not recommend how I invest my savings.              | Information only; no personal advice.                  |
| P11 | أبي فيلا على البحر في السعديات أو نخلة جميرا للعائلة.                          | Gulf phrasing, two alternatives.                       |
| P12 | مب نخلة جبل علي، أقصد نخلة جميرا.                                              | Gulf correction.                                       |
| P13 | أهم شي الخصوصية، ولا ترسل طلبي لأحد.                                           | Priority plus no-share.                                |
| P14 | ميزانيتي ١٢٫٥ مليون درهم.                                                      | Decimal amount, AED.                                   |
| P15 | أبيها قبل ٢٠٢٨، مو خلال ٢٠٢٨.                                                  | Explicit deadline boundary.                            |
| P16 | عندي طفلين، وأبي مدرسة بمنهج بريطاني قريبة.                                    | Children not bedrooms; curriculum.                     |
| P17 | لا تحفظ الاختيارات ولا تحجز معاينة.                                            | Two negated write intents.                             |
| P18 | خلّ السعديات، وشيل نخلة جميرا من الطلب.                                        | Keep/remove correct places.                            |
| P19 | أبي أربع غرف ومسبح خاص، وما أبي برج.                                           | Bedroom count, must-have, exclusion.                   |
| P20 | وضّح لي المصدر، ولا تعتبر السعر عرض بيع.                                       | Evidence request; no availability assertion.           |
| P21 | عايز بيت للمصيف في الساحل وقارنه باستثمار في دبي.                              | Egyptian, independent purposes.                        |
| P22 | لا، مش دبي، خلّينا في الساحل بس.                                               | Remove Dubai.                                          |
| P23 | مش فيلا، شقة على البحر.                                                        | Type correction, beachfront intent.                    |
| P24 | بفكر بالدولار والإسترليني، بس هادفع بالجنيه.                                   | Currency roles, no invented amount.                    |
| P25 | ميزانية الساحل من ٣٠ لـ٤٠ مليون جنيه.                                          | Egyptian range.                                        |
| P26 | التسليم قبل آخر ٢٠٢٨، ومش عايز موعد مجهول.                                     | Deadline plus unknown-date exclusion.                  |
| P27 | عندي طفلين ومحتاج مدرسة بريطانية قريبة.                                        | Household/curriculum preserved.                        |
| P28 | ما تبعتش بياناتي لحد، أنا لسه بستكشف.                                          | Egyptian no-share.                                     |
| P29 | شيل شرط حمام السباحة وخلي الأربع غرف.                                          | Remove one requirement only.                           |
| P30 | ورّيني جون وسيلفر ساندز، من غير ما تفترض إنهم جاهزين.                          | Resolve project aliases; retain uncertainty.           |
| P31 | Compare SouthMED مع Orla, keep each original currency.                         | Canonical project IDs and native amounts.              |
| P32 | Explain السعديات in English please.                                            | Explicit language wins.                                |
| P33 | دبي investment, الساحل family summer home, budget still undecided.             | Two purposes; no invented budget.                      |
| P34 | Palm Jumeirah، مش Palm Jebel Ali.                                              | Mixed correction.                                      |
| P35 | British curriculum للطفلين، not just any school.                               | Specific curriculum and two children.                  |
| P36 | Budget AED ١٢٬٥٠٠٬٠٠٠، اعرضه بالجنيه كمان.                                     | Grouped amount; separate display preference.           |
| P37 | Ready by end of ۲۰۲۸، مع مصدر للموعد.                                          | Persian digits; explicit deadline and evidence.        |
| P38 | Keep 4 bedrooms، احذف شرط private pool.                                        | Targeted removal.                                      |
| P39 | No handoff، ولا تحفظ taste memory.                                             | Privacy and memory refusal.                            |
| P40 | قارن June وSilversands، completion unknown is okay if labelled.                | Project aliases; unknowns remain unknown.              |

## Coverage plan: 72 scenario cases

| Category                                                |  Cases | Required assertions                                                                                      |
| ------------------------------------------------------- | -----: | -------------------------------------------------------------------------------------------------------- |
| Three persona journeys × two languages × three variants |     18 | Multi-turn Brief, project grounding, tool sequence, UI/map outcome.                                      |
| Corrections, exclusions and negation                    |     12 | Field-specific set/remove, OR semantics, no stale conflicting filters.                                   |
| Currency, numeral and deadline handling                 |     12 | Range/units, Arabic/Persian digits, decimal/group separators, currency roles, temporal boundary/unknown. |
| Source grounding and unavailable data                   |      8 | Existing IDs only; original amount/basis/date; no invented schools/readiness.                            |
| Privacy, writes and role isolation                      |      8 | Anonymous/client/verified/partner/advisor/admin plus grant/downgrade; explicit intent, no leakage.       |
| Map actions and streamed UI                             |      6 | Canonical camera/place/layer IDs, comparison, source state and failure interruption.                     |
| Recovery, persistence and language                      |      8 | Stale revisions, retry, no duplicate writes, explicit language, consent/memory deletion.                 |
| **Total**                                               | **72** | At least 40 distinct supported phrasings from P01–P40; all safety metrics zero.                          |

Do not count only paraphrases of one easy filter. New JSONL cases should declare initial Brief/viewer, turns, expected patches/clears/proposals, forbidden actions/entities and grounding assertions. The runner must test semantic state, not keyword presence alone. Separate parser tests from DB-authorized execution and browser acceptance; do not claim a parser-only pass proves the complete journey. Mock mode is mandatory; real-provider runs remain optional and separately reported.
