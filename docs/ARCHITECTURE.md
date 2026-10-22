# Darivo architecture

## Purpose and boundaries

Darivo is a bilingual private property office demo. V2 introduces supplied, sourced real-project reference data alongside fictional unit inventory. Accounts, demo units, permits, POIs and illustrative investment assumptions remain fictional. Reference projects never own demo units. English and Arabic share the same domain model and REST API. No production compliance is claimed.

The full V2 scope and current gates are preserved in [the studio brief](studio/MASTER-BRIEF-V2.md) and [delivery ledger](studio/DELIVERY-LEDGER.md). Earlier MVP behavior is a working substrate, not proof that the V2 stages are complete.

## Runtime

Next.js App Router and strict TypeScript serve locale routes under `/en` and `/ar`, with next-intl and logical CSS. Tailwind tokens and accessible shadcn-style components support quiet ivory/ink themes. Auth.js issues sessions; authorization always reloads the user from the database. Magic-link mail is logged locally. Explicit demo account login is restricted to the local demo environment.

PostgreSQL 16 + pgvector is the canonical datastore, accessed with Prisma. Docker Compose provides the standard database. If Docker is unavailable on a developer host, a documented PGlite PostgreSQL + pgvector fallback may be used; this must retain actual PostgreSQL semantics rather than silently substituting a JSON datastore. All mutations persist. Currency amounts use integer minor units; dimensions use square metres.

## Trust boundaries

One repository layer supplies UI routes and consultant tools. Visibility is PUBLIC, VERIFIED_ONLY (approved client), or PRIVATE_INVITE (explicit user/property grant). Staff access is role checked; client verification never grants private-invite access. Search, ID lookup, comparisons, PDFs and chat must use this same scope. Request bodies and tool calls are Zod validated. Mutations require session authentication and same-origin CSRF checks. Auth, search and chat are rate limited. Audit events record privilege changes and private access.

## Consultant

AIProvider returns structured, validated tool requests. MockProvider uses deterministic bilingual parsing and local embeddings. The OpenAI-compatible implementation can propose only allowlisted client tools. All facts rendered to clients come from tool results; prose is generated from trusted localized templates. Stored external text is data, never instructions. Legal, tax and personal financial advice route to an advisor. Responses stream as NDJSON events; cards carry scoped property IDs.

## Search and storage

Structured predicates are mandatory. Hybrid ranking combines PostgreSQL full-text search and cosine similarity over pgvector embeddings, with deterministic hashed bag-of-words embeddings in mock mode. At most 12 curated matches render by default. Maps are an adapter with an offline schematic fallback and optional open tiles. No map billing dependency.

## Client and staff workflows

Client briefs, named shortlists, preferences, viewing requests, consent and conversations belong to the authenticated user. Viewing slots are stored in UTC with the client's IANA timezone. Dossiers are server-rendered bilingual PDFs. Advisor and admin routes enforce roles independently of navigation. Account deletion removes personal workflow data and revokes sessions; security audits retain only minimized event metadata.

## Operations

Environment configuration contains secrets and region intent. Structured logs omit conversations and tokens except deliberately printed local development magic links. OpenTelemetry-ready hooks expose request timing. CI provisions pgvector, migrates, seeds, then runs lint, typecheck, unit, integration, e2e and consultant eval checks. Production deployment requires legal review, distributed rate limiting, mail delivery, identity checks and operational controls documented in COMPLIANCE_TODO.md.

## Original MVP Stage 0 plan (completed before V2)

1. Initialize package/tooling, Git, environment example and PostgreSQL Compose.
2. Define Prisma entities and initial migration; provision a working local database.
3. Implement locale routing, tokens, responsive shell and accessible UI primitives.
4. Add Auth.js, persisted demo users, protected role routes and dev magic links.
5. Run lint, strict typecheck, unit and browser smoke checks; record results and commit.

## Acceptance gates

V2 stages follow the current master brief: concept sprint; foundation/design system; Arrival/Living Map; Concierge; Stories/Office; Developers/Launch/Partner; Operations/Hardening. Every stage adds browser evidence, seven simulated persona reviews, meaningful checks and a changelog entry. The board-average gate is9.0 with no criterion below8. External infrastructure limitations are reported, never represented as passing checks.

## Local host adaptation

`pnpm demo` (and `pnpm dev`) uses persistent PGlite with pgvector over a loopback PostgreSQL socket by default when no environment exists. This is a development-only WebAssembly PostgreSQL build with a single database connection, not a substitute for production PostgreSQL16. Docker Compose and CI use PostgreSQL16. V2 validation additionally provisions a temporary native PostgreSQL16.2 + pgvector0.6.2 binary under `/tmp`, isolated from the demo; test results are recorded separately. It is a validation fixture, not a production installation. Prisma6.19 remains pinned to preserve the existing migration/client contract.

## V2 foundation contracts

Reference ingestion preserves the supplied record and individual fact provenance. Source URL/publisher/basis/confidence and nullable retrieval dates remain separate from fact as-of precision and dataset compilation date. Missing dates are unknown, not fresh. Real developer organisations are distinct from the aggregate editorial entry. Database constraints prevent fictional units from attaching to real-reference projects or developers.

The approved Noir Atlas direction becomes shared raw and semantic CSS tokens plus local Latin/Arabic font families. `/design` is the living component guide; production feature screens wait for the relevant later-stage gate. Interactive primitives own focus, reduced motion and logical-direction behavior. Prices preserve native currency and expose any indicative static-FX conversion separately.

Roles expand to CLIENT, VERIFIED_CLIENT, ADVISOR, DEVELOPER_PARTNER and ADMIN. Verified eligibility is checked against current database verification; a role label or stale session alone never grants access. Developer partners have no implicit advisor, admin or private-client authority. Preference mutations accept only declared display fields, including Arabic-Indic digits, and never role or verification state.

## Atlas and legacy route boundaries

The locale root owns the document, shared font/reset/token styles and one persistent display-preferences provider. Home and Explore render their real heading and composer directly, retaining map-specific readiness UI rather than a locale-wide loading placeholder. Their authored bilingual copy does not require the full legacy translation payload.

The `(legacy)` route group preserves existing public URLs while owning legacy page styles, `NextIntlClientProvider` and `Shell`. Each existing child route retains its localized loading boundary. New routes that use next-intl client hooks must provide the appropriate message context; Atlas components accept locale and copy explicitly. Preferences controls are separate from the shared state provider so they do not add translation UI dependencies to Atlas.

`getLayoutUser` uses React request-scoped memoization to share one session/database lookup between layouts. It is not a persistent user cache. Session identity is checked with Auth.js; current role and display preferences are selected from the database. Authorization remains in the existing server data/API layers. Locale error and not-found boundaries provide their own main landmark because they can replace a child layout.

## Story and Office boundaries

`src/server/db/story.ts` projects current authorized data into one strict Story DTO used by HTML, metadata, JSON, comparison and dossier generation. Real-reference projects, fictional project groups and exact fictional units are separate discriminants. Only a real project interest or exact visible unit can enter a portfolio; fictional project groups require unit selection. Reference facts preserve native currency, price basis, precision, source dates and original wording. Unknown area, yield or schedule stays unknown.

Office adds reference-interest relations beside existing unit shortlist foreign keys, versioned boards, idempotent mutation receipts, advisor assignments, authored availability, secure threads and project enquiries. Thread attachments are resolved against the client's current inventory scope for both participants. Advisor assignment does not grant the client new inventory access. Local viewing times use Temporal with explicit DST rejection and retain the requested timezone beside UTC instants.

Minimal versioned privacy policy is independent of conversation storage. Restrictive preflight precedes external processing and persistence; only explicit settings relax it. Both Concierge and legacy Consultant use this policy. Owner-only dossier export is read-only: it generates embedded-font bilingual HTML/PDF without fetching remote assets, fingerprints authorized content, then reloads current identity and projection before releasing bytes. Export audit records contain actor/board identifiers without document content. No public export URL, implicit sharing or fabricated human presence is introduced.

Story alone owns Lenis and cleans it up on navigation, with native reduced-motion scrolling. The shared map remains a single lazily loaded instance. Office and Story route components use authored bilingual dictionaries; display preferences never change the native price or source. Deep links carry typed IDs and reviewed navigation intents, not names, private facts or client Briefs.
