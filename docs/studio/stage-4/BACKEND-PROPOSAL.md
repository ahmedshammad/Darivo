# Stage 4 backend proposal — discovery only

Status: proposed contract, not implemented. Stage 3 closes on `a288074` with its accepted review and hosted checks; its strict LCP and physical/native validation limits remain open. This proposal covers Project Story and Private Office only. It follows the installed Next data-security and route-handler guides: server-only authorized DAL, minimal DTOs, explicit uncached private responses and fresh mutation authorization.

## Existing pieces and consequential gaps

- `src/server/db/properties.ts` already re-reads database roles/verification and applies shared visibility, including grants. Keep `Property` as the fictional unit model and preserve its real-project/developer exclusion constraints.
- `src/server/db/reference.ts` returns public real projects with sources and precision-aware dates, but resolves by ID only and includes raw records. Do not pass that entire object through Story RSC props or public JSON.
- `getAtlasData` already suppresses demo projects without visible units and computes demo summaries from authorized units. Reuse that rule, not unfiltered project relations.
- `Shortlist`/`ShortlistItem` are unit-only; `scopedShortlists` reauthorizes every unit. Keep these tables and existing API response shapes. Add a separate project-item relation for reference projects.
- `ViewingRequest` requires a unit, stores UTC instants plus timezone and has request status. Existing `slotToIso` uses Temporal with `disambiguation: reject`; retain it and test London/Cairo DST gaps and overlaps.
- `confirmConciergeProposal` claims proposals and writes in one serializable transaction, checks privacy/current visibility and is idempotent. Its unit-only save/viewing branch is the integration point, not a second AI write path.
- `advisorInbox` exposes all clients to authenticated staff. It is not an assigned-client thread authorization boundary. `Advisor` has no presentation profile, assignment, messages or presence. The seed has a `Demo advisor` user, not a named real human or an established active advisor profile.
- Privacy integration gap: `persistConciergeTurn` deliberately does not save a `doNotSave` turn. The persisted session snapshot alone cannot reveal the latest in-memory restriction to a new Office API. Add a minimal durable privacy-policy record, not conversation content; both Concierge and direct workflows must consume it.
- The legacy PDF renderer is bilingual, escapes text, embeds local fonts and blocks network requests. It contains unit-only synthetic copy, old visual styling and no rich reference citation appendix. Reuse the renderer infrastructure, not its document content or fixed clipped-page layout.

## Shared read contract

Proposed client-safe strict schemas in `src/lib/office.ts` and `src/lib/story.ts`; no Prisma/server imports. Reuse `LocalizedText`, `GroundedFact`, `GroundedSource`, precise nullable dates, native money and FX provenance from Concierge. Extract shared evidence projection from grounding where necessary; do not fabricate an empty client Brief to manufacture recommendation reasons for an editorial page.

```ts
type OfficeEntityRef =
  { kind: 'reference-project'; id: string } | { kind: 'demo-unit'; id: string };

type StoryDTO = StoryCommon &
  (
    | {
        kind: 'REAL_REFERENCE_PROJECT';
        projectId: string;
        availability: 'ON_REQUEST';
        residences: null;
      }
    | {
        kind: 'DEMO_PROJECT';
        projectId: string;
        availability: 'DEMO';
        residences: AuthorizedUnitSummary[];
      }
    | {
        kind: 'DEMO_UNIT';
        unitId: string;
        projectId: string;
        availability: 'DEMO';
        residences: null;
      }
  );
```

`StoryCommon` fields: version 1; localized name; locale-independent `storySlug` and `storyPath` (`/p/${storySlug}`); curated narrative sections whose assertions reference fact IDs; center plus approximate flag; licensed/local media with `ILLUSTRATIVE`/`DEMO`/`SOURCE_PHOTOGRAPH` provenance; minimal developer identity/kind; facts/sources; numeric modules; server-generated capabilities. A missing image or fact remains missing or explicitly illustrative. No invented architecture description, photography attribution or current stock. Real references lead with “Residences available on request”; that is an enquiry, not a confirmed unit/viewing.

`NumericModule` is discriminated `AVAILABLE | UNAVAILABLE`. Available values carry subject ref/name, native amount/unit, source fact IDs or explicit input operands, derivation/basis, precision-aware dates and optional dated static-FX display amounts. Preserve original price qualifiers. Price/area only divides amounts and area belonging to the same documented subject/basis; never divide a “from” price by a headline “up to” area. Demo community average/yield is visibly Demo, not market evidence for a real project. Golden Visa is configurable/indicative and requires applicable unit facts; absent or unsuitable evidence produces unavailable, never an eligibility promise. Payment schedules reuse exact authorized unit schedules or fully sourced reference terms; unknown is a named unavailable module, not zero installments.

Capabilities are server data, rechecked on action: `ASK_CONCIERGE`, `COMPARE`, `ADD_TO_PORTFOLIO`, `REQUEST_UNIT_VIEWING`, `ENQUIRE_PROJECT`, `SELECT_UNIT`, `COPY_PRIVATE_LINK`, each allowed/disabled with a stable reason code. A demo-project grouping must select a visible unit before portfolio/viewing. No hidden count, minimum price, thumbnail or slug goes into a disabled action.

Proposed route identity: `/[locale]/p/project-{Project.slug}` and `/[locale]/p/unit-{Property.slug}`. Explicit namespaces avoid cross-table slug collisions without renaming stored slugs. Every caller receives `storySlug` and `storyPath`; the UI adds only the validated locale prefix. Parent can reuse the same path for Concierge/map links and whitelisted sign-in continuation. No trial lookup that reveals whether a restricted unit exists. Parent may choose another reserved namespace before implementation. Demo-project pages exist only while at least one authorized unit exists; their bounded residence list and any displayed minimum derive solely from visible units and identify that basis.

## Authorized services and routes

All page loaders, JSON handlers, PDF generation, comparison and AI writes call the same services. Fresh viewer resolution is required at entry and in mutations, not trusted session role snapshots. Use `server-only`; never persist request-scoped authorization in a global cache. Unauthorized/missing entities return the same opaque 404.

| Service / route                                                                                                              | Proposed behavior                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resolveStory(slug, viewer)`; `GET /api/v1/stories/[slug]`                                                                   | Curated StoryDTO; public reference or freshly visible demo entity. Page metadata uses the same resolver; no private names in OG/RSC/404 content.                                 |
| `listPortfolios(viewer)` / `getPortfolio(id, viewer)`; `GET/POST /api/v1/portfolios`, `PATCH/DELETE /api/v1/portfolios/[id]` | Client-owned `Shortlist` wrapper. Versioned name/item mutations; no other owner's existence disclosed.                                                                           |
| `addPortfolioItems(id, refs, viewer)`; `POST/DELETE /api/v1/portfolios/[id]/items`                                           | 1–24 unique typed references, all authorized before atomic mutation. Real project vs fictional unit stays explicit.                                                              |
| `compareOfficeEntities(refs, viewer)`; `POST /api/v1/office/comparison`                                                      | 2–4 fresh authorized entities. Reject whole requested comparison if one target is inaccessible; no partial-result oracle or hidden names. Native currency/basis remain separate. |
| `buildDossier(id, viewer, preferences)`; `GET /api/v1/portfolios/[id]/dossier`                                               | Owner-scoped bilingual PDF from fresh visible items and source appendix. No raw snapshots or public file URL.                                                                    |
| `requestUnitViewing(input, viewer)`; existing `/api/v1/viewings` adapter                                                     | Exactly one authorized unit, 1–3 future slots, allowed timezone, in-person/video, requested status. No instant confirmation promise.                                             |
| `requestProjectEnquiry(input, viewer)`; `POST /api/v1/project-enquiries`                                                     | Exactly one public reference project with an explicit client message and optional preferred discussion slots. Separate type and wording from unit viewings.                      |
| `getMyAdvisor(viewer)`; `GET /api/v1/office/advisor`                                                                         | Current assignment's minimal named profile and authored availability and its timestamp, or unassigned. No all-staff directory.                                                   |
| `readThread/sendMessage`; `GET/POST /api/v1/office/threads/[id]/messages`                                                    | Client owner or currently assigned advisor only; bounded cursor pagination and idempotent send. No model-generated human response.                                               |
| `PATCH /api/v1/office/advisor/availability`                                                                                  | Fresh advisor role, own profile only; explicitly authored state and server timestamp, bounded rate. Never an inferred online indicator.                                          |
| `GET /api/v1/office/private-collection`                                                                                      | Shared visibility with current role/grants; generic empty invitation does not reveal totals or gated records.                                                                    |

Portfolio DTO: id/name/version/createdAt/updatedAt, authorized mixed entries `{itemId, ref, resolvedSummary}`, visible count only. Omit inaccessible entries and their identity/positions from reads; comparison/action batches fail atomically. Do not expose stored count minus visible count. Legacy `/shortlists` remains a unit-only view of the same underlying board, with its old shape and scoped PDF behavior until migrated explicitly.

Direct button actions are explicit writes, protected by same-origin, bounded strict input, current client-role check, owner check, rate limit and idempotency key. Concierge proposals remain proposals: extend the strict portfolio ref union, preserve old `unit` proposal parsing, reauthorize all targets in the confirmation transaction. Reference-project “viewing” becomes an explicitly reviewed project enquiry; never silently reuse the unit-viewing result. Current no-save/no-share/no-book settings govern direct office writes as well as AI proposals, through one `assertOfficePrivacy(viewer, action, tx)` policy. Load a fresh `ClientPrivacyState` inside the mutation transaction; never accept a request-supplied permissive policy or silently clear flags. Restrictive Concierge preflight must persist these three policy flags even when the conversation itself is not saved. Only explicit versioned settings can relax restrictions; providers cannot. Known stored Brief restrictions are conservatively backfilled, and an invalid existing policy fails closed. An account with no policy or restrictive history starts at the documented default, not an inferred override of an unsaved request. Return a stable `privacy_restricted` reason and an actionable Brief/settings link. A user changes privacy explicitly before retrying; a portfolio/viewing/thread button is not an implicit override.

Privacy matrix: `doNotSave` blocks portfolio mutations, new enquiries/viewing requests, advisor messages/context copies and dossier generation; it never blocks deletion/cancellation or reading already authorized content. `doNotShare` blocks enquiry/viewing submission, advisor messages/context copies and the private-share action, but not owner-only portfolio storage or private dossier download when saving is allowed. `doNotBook` blocks unit viewing requests and scheduling effects; it does not turn a plain project question into a booking. Reference enquiries with optional proposed discussion slots must respect both doNotShare and doNotBook. Direct API tests must reproduce every blocked UI state. Neither assignment nor opening the Office copies a Brief/history automatically: only the exact visible client-reviewed text/context submitted by the client may be stored in a thread.

## Viewing, advisor and private sharing semantics

The input sends `{localDateTime, timezone, mode, clientRequestId}`; server resolves to UTC with Temporal and returns both original zone and canonical instants. Dubai/Cairo/London are the only initial zone IDs. Reject nonexistent/ambiguous local times with an actionable error, rather than shifting them silently. A later advisor confirmation selects one of the requested instants and records actor/time; request status alone does not create a booking. Keep old ISO-slot requests supported through a legacy adapter, with future/horizon validation unchanged.

Assignments are server-managed, never client-selected advisor IDs. A new assignment creates its own thread; replacing an assignment closes the former relationship. Former advisors lose read/send access immediately; the client can read their archived thread. A new advisor does not automatically receive a previous private thread or all Concierge history. Any copied Brief/context is an explicit client-reviewed snapshot, reauthorizing entity attachments on every read. Admin emergency access, if added, must be a distinct audited path, not a hidden bypass in the normal thread resolver.

Assignment confers no unit visibility. Resolve thread attachment cards under the client owner’s current inventory permissions, including when the assigned advisor reads them; advisor staff scope cannot enlarge the client’s collection. Messages are escaped plain text, bounded length, with typed optional entity attachments resolved fresh. Do not put restricted card names/prices into stored system-message prose. User-written prose cannot be reliably redacted after a grant change; it remains private to thread participants and must never become public/share-preview material. Delivery status means stored, not read by a real advisor. Use authored availability (`AVAILABLE`, `AWAY`, `BY_APPOINTMENT`, `UNKNOWN`) and a server-recorded update timestamp, labelled as advisor availability as of that time. This is not live online presence or a response-time promise. No heartbeat simulation is required. Seed profiles are clearly fictional persisted Demo advisors; never display a fake human as online. No fabricated typing or generated replies attributed to a person.

Smallest private-share implementation: explicit copy of the canonical sign-in-protected Story URL, with clear wording that the recipient needs their own access. It grants no inventory entitlement and exposes no content to link-preview fetchers. No bearer share token, external email or new grant is required for Stage 4. Recipient-bound links can be proposed later if product scope requires delegation.

## Additive migration proposal

1. Keep `Shortlist`, `ShortlistItem.propertyId` and `ViewingRequest.propertyId` unchanged and non-null. Add `Shortlist.version` (default 0), `updatedAt`, and item ordering timestamps only if the UI requires stable ordering. Add `ShortlistProjectItem(id, shortlistId, projectId, createdAt)` with unique shortlist/project and FKs. A DB check via constraint trigger ensures project kind is `REAL_REFERENCE`; reject changing an attached project's kind. Do not attach units to real projects.
2. Add `ProjectEnquiry(id, userId, projectId, message, slots DateTime[], timezone?, status, createdAt, updatedAt)` and real-reference-only constraint. It is not a `ViewingRequest`. Optional `ViewingRequest.confirmedSlot`, `updatedAt`, `version` are additive; existing requested rows remain valid.
3. Extend `Advisor` with localized display name, explicitly Demo profile kind, optional local portrait, authored availability and nullable availabilityUpdatedAt. Do not relabel existing user identities as real people. Add immutable `AdvisorAssignment(clientId, advisorId, assignedAt, endedAt)` with a partial unique active assignment per client; `AdvisorThread(assignmentId unique)`; `AdvisorMessage(threadId, authorId, body, attachmentRefs?, createdAt, clientRequestId)` unique per author/request. Server checks fresh role and current assignment even for an old thread ID.
4. Add `WorkflowMutation(userId, kind, clientRequestId, requestHash, resultRef, createdAt)` unique by user/kind/request. Claim and write in one transaction; reject changed payload under the same key. Reuse existing ConciergeProposal atomicity for AI confirmations rather than recording two independent claims.
5. Add `ClientPrivacyState(userId unique, doNotSave, doNotShare, doNotBook, version, updatedAt)` with no raw prompt/history. Signed-in preflight may restrict it; explicit same-origin versioned settings may change it. Deleting conversation history does not clear account restrictions. Coordinate this narrow Concierge/settings integration before any Office mutation ships; snapshot-only checking is insufficient.
6. Keep all old rows/routes readable. Seed new advisor assignment/profile idempotently only for labelled demo accounts; do not overwrite real workflow data. No wholesale backfill of messages, reference availability, stock, sources or human activity.

## Dossier and leak acceptance

The dossier includes a bilingual cover, named subject sections, original amounts plus optional dated display conversion, qualified completion, exact available schedules, unavailable facts, Demo marks, and a deduplicated URL/basis/date appendix retaining record-level citation scope. Missing publication/retrieval dates remain explicit; export time is not source freshness. Render bounded local resources only; allow no remote URL fetching or client-supplied HTML. Use flowing pagination, not fixed-height overflow clipping. Reauthorize before data load and immediately before releasing generated bytes; if access changes during rendering, discard and regenerate/deny. Downloads already delivered cannot be recalled, so mark the document confidential/generated-at and avoid claims of revocable possession.

Required leak matrix: guest; unverified client; verified role+status; granted client; other client; downgraded/revoked/deleted account; partner with old grants; assigned advisor; former/unassigned advisor. Assert across HTML/RSC/metadata, JSON, map summaries, portfolios, comparison, PDF text/links/images, viewings, thread attachments and AI replay/confirmation. Search for sentinel IDs, slugs, names, prices and coordinates, not merely row counts.

Additional tests: real-project add/enquiry never creates Property or unit viewing; concurrent double click produces one mutation; stale board version yields conflict; mixed allowed/denied write rolls back; unknown/refused schedule remains tied to the requested subject; date precision and basis survive DTO/PDF; arithmetic uses compatible operands; original currency/payment intent survives display FX; DST gap/overlap rejection in Cairo/London; former advisor loses read/send/availability scope; client cannot forge author/advisor/availability state; assignment does not enlarge client visibility; direct API cannot bypass any active privacy restriction; no public caching; malicious text/PDF URLs remain escaped/blocked. Fresh PostgreSQL migration plus upgrade over existing workflows must both pass. The recorded bilingual concierge → map → story → mixed portfolio → dossier → unit viewing journey must finish under three minutes without bypassing real authentication or confirmations.

## Suggested implementation order

Approve strict read/mutation contracts and slug namespace first. Then additive migration and shared DAL with negative tests; Story/public evidence and mixed portfolio endpoints; source-rich PDF; unit viewing/project enquiry adapters; assigned thread/authored availability; finally Concierge confirmation integration and the recorded end-to-end journey. Parent owns the new sourced PDF renderer/export adapter after DTO freeze. Proposed Noir ownership is shared projection contracts, DAL, additive migrations, office APIs and secure thread. Parent coordinates final boundaries and DB/build slots before implementation. The privacy-policy seam and canonical slug namespace are decisions to freeze before implementing the contracts. No schema, runtime code, database or server was changed for this proposal.
