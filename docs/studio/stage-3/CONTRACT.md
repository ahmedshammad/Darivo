# Stage 3 shared Concierge contract

Status: version 1 implementation contract. This is a bounded engineering agreement, not evidence that Stage 3 is complete. `src/lib/concierge.ts` contains client-safe strict Zod schemas and inferred types. No server or provider module belongs in that dependency graph.

## Brief and corrections

`ConciergeBrief` has an integer revision and stable market/constraint IDs. Markets preserve independent objectives or alternatives, country, canonical place IDs, native budget ranges and currency association, property type, readiness and deadline. Household children are never bedrooms. `before 2028` is exclusive; `by 2028` retains its wording and boundary uncertainty. The engine discloses the market-specific end-of-year interpretation without blocking results and invites an earlier-date correction. Unknown completion cannot satisfy a readiness promise. Unassigned amounts and deadlines remain explicit until associated with a market.

`displayCurrencies` changes presentation only; `paymentCurrency` is separate from budget currency. Conversion rows must disclose the static demo FX method and date. Original money, source wording, date precision and uncertainty survive presentation changes. Explicit response language beats script detection and UI locale.

`ProviderBriefPatch` permits sets, market upserts/removals, constraint upserts/removals and monotonic privacy restrictions. It cannot grant memory consent or relax privacy. `memory.restrict` permits decline/revoke and clears retained items. The trusted user-edit `BriefPatch` additionally permits explicit privacy/memory replacement; the transport must establish that the user made that edit. `applyConciergeBriefPatch` rejects stale revisions, validates the complete result and increments once. Removing a market removes its constraint associations without converting scoped constraints into global constraints.

## Provider and execution boundary

`ConciergeProvider.plan` receives message, current Brief, response language, round, authorized prior entities, current tool-result components and AbortSignal. It returns `ConciergeProviderPlan`: strict tool calls, optional safe Brief patch, response language, a finite application-copy reply key, clarification fields and `continue`. There are at most three rounds and eight calls per round. Mock may continue once to compare authorized results across markets; subsequent provider rounds inspect authorized tool results. Providers cannot emit UI prose, cards, facts, prices, consent grants, executable code or external writes.

`runConciergeTurn({message,brief,viewer,locale,conversationId,turnId,requestId,signal,provider}, emit)` returns `{brief,components,text,proposals,actions,status}`. It is persistence-free. The engine resolves every entity via the authorized DAL, builds localized application copy and validates generated components. Guests receive public data. Fresh role/verification/grant checks govern units. A real reference project is always availability on request; fictional units belong only to fictional projects.

## Grounding and generative components

Cards distinguish reference project, demo project and demo unit. Reasons connect Brief fields to facts, with unknown/conflict states. Every fact has a localized label, entity, provenance, source references, precision-aware date, native currency and original wording where applicable. Missing dates remain unknown; dataset compilation time is not retrieval time. Shape validation is necessary but insufficient: server grounding checks entity/fact/source relationships against authorized current data.

Components include curated cards, comparison, a preview of the one shared map, payment timeline, price-area chart, itinerary, developer card and notices. Missing numeric values remain unavailable, never zero. Schedules must have sourced percentages totaling 100; absent schedules produce an honest unknown notice. Demo/user projections disclose assumptions. Demo POIs cannot establish a real school's curriculum or admission suitability. Legal/tax/personal investment questions offer an advisor, without inventing advice or submitting a handoff automatically.

## Writes, cancellation and history

`WriteProposal` is a discriminated union carrying validated details: portfolio name/entities; viewing slots/timezone/mode/entities; or advisor reason. All have IDs, expiry and a bilingual review summary. A proposal is not execution or consent. Parent transport stores authenticated proposals server-side, checks current privacy and visibility again, and executes existing workflows once after explicit confirmation. Guest proposals can be rendered for sign-in but never execute. Reference-project save/viewing is unsupported by the unit-only workflow: return a clear notice and offer an explicitly confirmed advisor enquiry. Never invent or attach a unit to satisfy it.

`ConciergeAction` includes action, turn, request and Brief revision IDs. Actions are declarative, server-derived and consumed once only by the active request. Manual pan wins until the next explicit user request. No map action steals focus. Completed components remain after cancellation; cancelled/superseded actions do not execute. Replay uses `applyActions:false` and contains snapshots only. `rehydrateConciergeComponents` re-authorizes all entity references, rebuilds current facts when feasible and drops an entire component if any referenced entity is unavailable. Saved price/visibility is never an authority. `ConciergeHistoryTurn` stores response language and completion state. Parent owns optimistic persistence, SDK streaming/transport and request idempotency.

## Delivery sequence

1. Freeze schemas and pure revision-safe patch reducer; parser and frontend consume the same exports.
2. Add scoped grounding/tools and incremental engine events; test privacy, stale revision, fabricated references, cancellation and role revocation.
3. Parent integrates SDK provider, transport and persisted replay; frontend renders each discriminant with honest fallback states.
4. Exercise bilingual multi-turn examples and at least sixty evaluation scenarios before visual review. Mock and live-provider evidence remain distinguished.

## Implemented first server slice

The server exports `runConciergeTurn`, `executeConciergeTool`, `resolveCard`, `validateCardReferences` and `rehydrateConciergeComponents`. `runConciergeTurn` additionally accepts optional already-authorized `priorEntities` and returns the actual `responseLanguage`. Further provider rounds receive current authorized components. The final application sentence is one event; streaming occurs through actual tool/component arrivals, without artificial word pacing.

Required generative components have explicit bounded triggers: `ui.showMiniMap(entities)`, `ui.showPriceAreaChart(entities)` and `ui.showItinerary(placeIds)`. Charts use numeric unit area, never project site area. Itinerary slots are marked `DEMO_ILLUSTRATION`, not bookings, travel-time estimates or a feasible route. A visible school layer always discloses fictional markers and unknown curricula. Unit map highlights resolve to their authorized parent project marker.

Matching uses original dataset `type[index]` facts, scoped constraints, exact budget currency and conservative day/month/quarter/year upper bounds. Hard verification requirements fail closed when evidence is missing. A reference project bedroom range is not a confirmed unit bedroom match. Source completion targets remain qualified even when their reported bound is within the requested period. Multi-market curation balances groups and prioritizes real reference evidence over fictional examples; it never fills a missing market with another country's results.

Evidence facts are curated for reading: prices, community, country, type, reported features, status, completion and payment plan. Raw IDs, coordinates and nested price JSON are not displayed as facts. Optional `displayValue` supplies faithful known translations while canonical `value` and `originalText` remain available. Unknown translations are explicitly original source wording. Card reasons identify the actual location, original-price budget comparison, type/deadline evidence and specific conflicts or unknowns.

No-save currently suppresses every write proposal because confirmation requires a retained server draft. A viewing proposal needs one authorized fictional unit and future slots within one year; missing details yield clarification. Advisor proposal reasons use the user's request. No external contact, booking or portfolio save occurs in the engine. Consent-based taste extraction, SDK transport, persistence and confirmation remain parent-owned integrations.

### Exact unit payment timelines

`ui.showTimeline` now accepts exactly one of `{projectId}` or `{unitId}`. `payment_plan_projection` accepts the same exclusive target plus `scheduleFactIds`. Existing project-target calls are unchanged. A unit target resolves that exact authorized fictional Property and its own stored PaymentPlan; it never chooses a representative project unit. The native unit price, booking/construction/handover percentages and all fact references retain Demo provenance. Missing, unauthorized or mismatched targets produce an honest unavailable state. A real reference project passed as a unit cannot acquire a fictional schedule. Replay resolves the unit again and drops the timeline after access loss. Neighborhood-example replay also refreshes its seeded AreaInsight facts instead of retaining old estimates.

Clarification copy is application-authored: the first validated ambiguity receives one specific bilingual question (currency, amount, market, relative-date anchor or selected entity), without exposing internal field codes.

### Consented taste as a bounded soft signal

Search applies all explicit Brief filters before taste ordering. Only the known consented IDs `prefers-contemporary`, `prefers-low-rise` and `dislikes-high-rise` participate; no-save and revoked/absent consent disable their use. Matches require existing sourced/Demo type or feature facts. Villa/townhouse/mansion-only types can support avoiding towers, with an explicit warning that height is unverified; they do not establish modern architecture or low-rise height. Style/low-rise matches require explicit feature wording. Unknown tastes neither exclude records nor fabricate scores. Stable ties retain DAL ordering, real-reference projects retain priority over fictional project examples, and unit ranking stays within the bounded authorized candidate cohort. Cards show Brief-linked fact references for the taste signal or an explicit unknown. Hard requirements, source dates and original price evidence are unchanged.

The engine emits a curriculum/demo-school limitation whenever a school requirement is retained, even if a provider chooses no school/map tool. This is disclosure, not an invented school recommendation. Deterministic natural developer/calculation reachability is owned by the parser; calculations still independently require the selected authorized fictional unit and explicitly currency-associated user assumptions at the tool boundary.

Constraint row IDs are identities, not semantics. Filtering and card explanations derive a bounded supported kind from the current normalized English/Arabic text (pool, beachfront, high-rise, unknown completion or property type). Editing “private pool” to “beachfront” therefore changes meaning without changing its field ID. Unknown, negated or compound wording remains unknown rather than reusing the old ID's meaning; required verification fails closed. The must-have/exclusion list controls polarity, and editable market associations control scope.

### Timeline subject identity

Payment timelines carry optional `subjectName: {en, ar}` for compatibility with older persisted components. New tool output always copies the name from the same freshly authorized card that supplies `entity`, price and schedule. Providers cannot supply this field in tool arguments. History replay reauthorizes the entity and regenerates the name from current data; a missing or revoked entity drops the entire timeline, including its saved name. Clients may show the existing entity ID only as an older-payload fallback, without inventing a name.
