# Darivo architecture

## Purpose and boundaries

Darivo is a bilingual, private property discovery demo. All accounts, listings, permits, insights and financial assumptions are fictional. English and Arabic share the same domain model and REST API. No production compliance is claimed.

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

## Stage 0 plan

1. Initialize package/tooling, Git, environment example and PostgreSQL Compose.
2. Define Prisma entities and initial migration; provision a working local database.
3. Implement locale routing, tokens, responsive shell and accessible UI primitives.
4. Add Auth.js, persisted demo users, protected role routes and dev magic links.
5. Run lint, strict typecheck, unit and browser smoke checks; record results and commit.

## Acceptance gates

Stages follow the supplied brief in order: foundation; data/discovery; grounded consultant; client workflow; advisor/admin; polish/hardening. Each stage adds meaningful tests and a changelog entry with verified checks and explicit limitations. External infrastructure limitations must be reported, not represented as passing checks.

## Local host adaptation

This host has no Docker or PostgreSQL installation. `pnpm dev` uses persistent PGlite with pgvector over a loopback PostgreSQL socket by default. This is a development-only WebAssembly PostgreSQL build with a single database connection, not a substitute for production PostgreSQL 16. Docker Compose and CI use PostgreSQL 16. Prisma 6.19 is pinned for its stable schema-engine workflow; Prisma 8 was a release candidate at implementation time.
