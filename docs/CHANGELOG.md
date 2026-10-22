# Build changelog

## Stage 0 — Foundation (2026-10-22)
- Added architecture, strict Next.js 16.4 App Router foundation, Tailwind tokens, light/dark shell, English/Arabic messages and document-level RTL.
- Defined all requested domain entities, Auth.js adapter models, initial SQL migration and PostgreSQL 16 + pgvector Compose service.
- Local one-command launcher provisions persistent PGlite + pgvector when Docker is unavailable, migrates and seeds demo identities. Disabled prepared-statement caching for this single-connection fallback.
- Auth.js demo credentials (development only), console magic links and server-side role helper are implemented. No credentials or secrets committed.
- Checks: lint and typecheck pass; 2 unit tests pass; Playwright Arabic navigation and client sign-in smoke test passes.
- Assumptions/gaps: production email is deliberately disabled until a delivery adapter is configured. Docker/PG16 execution cannot be tested on this host; CI targets PG16. Shared environments must use PostgreSQL, not the local PGlite socket. Stage 1 replaces the temporary collection landing with seeded inventory and search.
