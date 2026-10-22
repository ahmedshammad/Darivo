# Build changelog

## Stage 0 — Foundation (2026-10-22)
- Added architecture, strict Next.js 16.4 App Router foundation, Tailwind tokens, light/dark shell, English/Arabic messages and document-level RTL.
- Defined all requested domain entities, Auth.js adapter models, initial SQL migration and PostgreSQL 16 + pgvector Compose service.
- Local one-command launcher provisions persistent PGlite + pgvector when Docker is unavailable, migrates and seeds demo identities. Disabled prepared-statement caching for this single-connection fallback.
- Auth.js demo credentials (development only), console magic links and server-side role helper are implemented. No credentials or secrets committed.
- Checks: lint and typecheck pass; 2 unit tests pass; Playwright Arabic navigation and client sign-in smoke test passes.
- Assumptions/gaps: production email is deliberately disabled until a delivery adapter is configured. Docker/PG16 execution cannot be tested on this host; CI targets PG16. Shared environments must use PostgreSQL, not the local PGlite socket. Stage 1 replaces the temporary collection landing with seeded inventory and search.

## Stage 1 — Data and discovery (2026-10-22)
- Seeded 200 fictional bilingual properties across 16 communities: 160 PUBLIC, 30 VERIFIED_ONLY and 10 PRIVATE_INVITE. Four fictional developers, bilingual area insights, payment plans and dated static FX rates are included.
- Implemented shared visibility-scoped data access, structured filters, PostgreSQL full-text + pgvector ranking, curated cards, map/list view, currency/area controls and complete property detail/trust/estimate panels.
- Created original vector architectural illustrations, avoiding copyrighted listing media. Landing composition uses these same synthetic assets.
- Checks: lint/typecheck clean; 7 unit/integration tests pass; 3 Playwright tests pass, including direct API denial, mobile filters/maps, Arabic content and no horizontal overflow at 375px.
- Resolved actual Arabic content localization with next-intl proxy (document direction alone was insufficient). Switched local dev to Webpack after reproducing a Turbopack reload loop; kept Next.js current. Explicit Tailwind source roots and test artifacts outside the source tree prevent watcher feedback. PGlite files persist in a project-keyed OS temporary directory; Docker volumes remain the durable default for shared work.
- Map uses an original offline schematic GeoJSON basemap and clustered pins, with local MapLibre workers; this intentionally has no paid tiles or network dependency. Stage 2 adds the consultant; property workflow links activate in Stage 3.

## Stage 2 — AI consultant (2026-10-22)
- Added provider interface, deterministic bilingual MockProvider, optional OpenAI-compatible tool-calling adapter, eight Zod-validated client tools and shared visibility checks.
- Added streamed NDJSON chat, inline scoped property cards, discovery prompts, persisted/editable client briefs, per-user history deletion and docked consultant on discovery/detail pages.
- Grounding is enforced by rendering trusted templates and tool-result cards; model prose is discarded. Restricted IDs resolve to no card. Advice queries create an advisor handoff. Write tools additionally check user intent. Saved history re-authorizes every referenced property.
- Checks: lint/typecheck pass; 14 tests pass; 36/36 EN/AR/mixed/adversarial mock evals pass with zero off-market leakage; 4 browser tests pass, including bilingual acceptance prompts and hidden-ID refusal.
- Real-provider eval explicitly skipped because no key is configured. Offline embeddings remain deterministic in this stage; provider embedding configuration/re-indexing remains a hardening item. Stage 3 completes client workflow screens and dossier export.

## Stage 3 — Client workflow (2026-10-22)
- Connected named shortlists, rename/removal, up-to-four comparison, private PDF export, viewing requests, persistent preferences, mock verification and account deletion.
- Dossiers are rendered server-side by Chromium using local fonts, escaped data and local-only illustrations. Each exported property is re-authorized. English/Arabic content appears together; no external render requests are allowed.
- Dubai/Cairo local slots use Temporal with ambiguous/nonexistent DST times rejected and UTC storage. Investment calculator uses bounded user assumptions and labels every result as an estimate.
- Checks: lint/typecheck clean; 18 tests pass; 36 evals pass; 6 browser tests pass, including consultant → shortlist → compare → PDF → viewing and profile role-injection rejection. Exported A4 cover and property page were rendered with Poppler and visually inspected for readable Arabic, alignment, margins and clipping.
- Mock verification deliberately submits a built-in placeholder and collects no identity document. PDF runtime requires Chrome (`pnpm exec playwright install chrome` if absent). Production e-mail, real KYC and legal compliance remain explicitly out of scope.
