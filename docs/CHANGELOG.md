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

## Stage 4 — Advisor and admin (2026-10-22)

- Added advisor client briefs/shortlists, private notes, scoped suggestions, viewing status updates, handoff resolution and private introductions with revocation.
- Added admin CRUD for listings (including bilingual copy, verification and visibility), fictional developers, communities and illustration media; user role/verification controls; event analytics and audit trail. Last-admin demotion is rejected.
- Private grants and their audit events are transactional. Advisors cannot suggest an address the receiving client cannot access. All staff REST routes enforce fresh database roles independently of navigation.
- Checks: lint/typecheck pass; 20 tests and 36 evals pass. Eight browser cases pass (seven in the full run; the final staff case passed after correcting a test-only sign-out navigation race). Grant isolation, direct staff API denial, audit recording, immediate revocation, private notes and developer create/update/delete are covered.
- No real CRM, identity provider or external messaging is connected. Next: production build, accessibility/performance, security review and complete runbook/OpenAPI documentation.

## Stage 5 — Polish and hardening (2026-10-22)

- Completed quiet-luxury landing and mobile/RTL polish, localized map controls, honest verification badges, readable contrast, keyboard entry, loading/error states and a deferred detail map. Reserved loading space and local font/image priorities reduce layout shifts.
- Added nonce-based production CSP, body-size limits, configurable rate-limiter and observability interfaces, region/provider validation, and direct security tests. Consultant histories persist only approved result types and re-check property visibility on retrieval.
- Added optional provider-generated 64-dimensional embeddings with source tagging, safe re-indexing, HNSW/FTS indexes and source-aware ranking. Mock mode remains completely offline.
- Completed formatting, README, versioned API guide, generated OpenAPI, AI configuration and legal/operational review notes. CI includes the browser suite, production build and reproducible Lighthouse score gate.
- Checks: lint/typecheck/format pass; 24 unit/integration tests pass; 36/36 mock evals pass with zero leakage; all 13 browser tests pass. Production build passes. Fresh isolated migrations and seed produce exactly 200 listings with the required visibility mix. Bilingual PDF pages were visually inspected.
- Final mobile Lighthouse scores: landing 93, search 91, Arabic detail 98; accessibility, best practices and SEO are 100 on all three. See VALIDATION.md for the test scope and reproduction commands.
- External limitations: no Git remote exists to execute hosted CI, Docker/PG16 is unavailable locally, and real-provider evals are skipped without an API key. Production mail, distributed rate limiting, real identity integrations and qualified legal review remain required before real deployment. No extra product features were introduced.

## V2 Stage 0 — Concept sprint in progress (2026-10-22)

- Started the supplied Master Build Brief v2 as a new full-scope goal. Preserved the complete brief and a stage-by-stage delivery ledger; the earlier MVP is not treated as v2 completion.
- The studio produced ten role briefs, seven persona job stories and three separate interactive HTML Home/Map studies. Production feature code remains unchanged while Stage 0 is open.
- Located and copied the supplied reference dataset exactly (SHA-256 `8c22ce499c141479320b749108c16f5bd1c6e13a8046b8b9cfe8029d7706bc7c`). Identified nine real developer organisations plus one aggregate editorial placeholder, 13 projects and three market statistics. Missing dates/low-confidence notes are retained, not invented.
- Captured current-app baseline and 72 concept-state screenshots across 1440/1024/390, EN/AR and light/dark, plus six signature recordings. Three-dimensional geographic prototypes use keyless OpenFreeMap with attribution; the static studies currently need network tiles.
- First simulated review round: all seven personas scored all three concepts and identified real defects. Concept C's globe revision leads but remains below the 9.0 gate. Full criterion tables are retained in `docs/reviews/stage-0/v1/`; none is represented as a human interview or endorsement.
- Creative direction selected for repair: **Noir Atlas** (C's spatial structure, A's restrained palette, B's evidence typography). Labels, Arabic display typography, mobile target visibility, faithful Brief extraction and explicit provenance are being revised before re-review. Stage 1 has not started.
- Known external gates remain open: hosted CI has no Git remote, native PostgreSQL16/Docker is absent, and target-device/human linguistic/accessibility certification must not be inferred from local automated evidence.

## V2 Stage 0 — Direction approved (2026-10-22)

- Initial board means: A7.702 (min6), B8.048 (min7), C8.185 (min7). Selected Noir Atlas was revised through v3 and v4; all interim findings and evidence remain saved.
- Re-review of C v4: board mean9.018, minimum8. The Critic remains8.917; the aggregate gate in PartA3 passes without rounding or claiming unanimous9s. `docs/reviews/stage-0/v2/creative-director-synthesis.md` records the dissent and all carry-forward work.
- Corrected mobile map target visibility, Arabic display type, multi-market/year/privacy intent retention, source context, recommendation trade-offs and attribution. Real-reference facts remain separate from fictional concepts and on-request availability.
- Fresh24-state matrix plus2 videos;12 accessibility configurations, zero Home/Map axe violations or overflow. Independent EN/AR client flows, keyboard dialogs, focus restoration and reduced motion checked. Local moving-frame median16.6ms, p9517.5ms; useful-map readiness1.28–3.58s remains a Stage2 performance concern. No physical-phone/4G/native-reader certification is claimed.
- Lint/typecheck,24 existing tests and13 browser tests pass. The first sandboxed database run failed to connect; the local-network-enabled rerun passed. No v2 production feature code was written before this gate.
- Next: Stage1 full component library and bilingual design guide, data provenance models/reference ingest,250 isolated fictional units, roles and preferences. Hosted CI/nativePG16 and final target-device validation remain unresolved external gates.

## V2 Stage 1 — Foundation implemented, review repair in progress (2026-10-22)

- Added Noir/Sand tokens, Amiri editorial Arabic, all 16 component types and the bilingual `/design` atlas. All 12 width/language/theme configurations pass automated accessibility, overflow and page-error checks after fixing the first preflight's swatch contrast and digit-toggle target size.
- Imported the supplied reference dataset without fabricated dates or unit availability: 13 real projects, nine real organisations plus one aggregate, three market statistics, 41 sources and 241 fact records. Seeded 250 units across 16 fictional projects, with 52 demo POIs and database-enforced separation from real references.
- Added verified-client and developer-partner roles, fresh database authorization, persisted display preferences and Arabic-Indic digits without modifying native property amounts. The legacy developer editor now rejects real-reference writes.
- Native PostgreSQL16 + pgvector validation now passes the full migration chain, two seed runs, 40 tests and 36 mock evaluations with zero private-inventory leakage. Lint, typecheck and formatting pass. The user supplied the GitHub destination; hosted CI is pending.
- Initial simulated board mean **8.839**, minimum **8**: gate fails. Independent reviews found initial/destination command focus, ArrowUp navigation, partial numeral formatting, clipped long mobile Brief values and ineffective sheet expansion. All reports and captures are retained; repairs and re-review are underway before Stage 2.
- Local database and UI checks do not establish live source accuracy, native-language certification, production mail readiness or the later map/performance gates. No new scope was added.

## V2 Stage 1 — Review and local gates pass (2026-10-22)

- Repaired command search/arrow/destination focus, consistent numeral formatting, long mobile Brief wrapping and real sheet expansion. Added a comparison-scroll hint and larger mobile evidence text. All four focused browser regressions pass; fresh12-state captures and two signature recordings have zero axe violations, page errors or overflow.
- Re-review mean **9.065**, minimum **8.5**. All seven initial and repaired reviews remain preserved with explicit simulated-review limits and carry-forward requirements.
- All16 application browser regressions pass. Production build, lint, typecheck and format pass. Initial production performance scores88/86/94 exposed unnecessary font prefetching through the language switch; removing it and the unused shared Arabic-display preload yields94/91/94, with accessibility100, best practices96 and SEO100. Thresholds were not lowered.
- Four guide cases also pass on the production build. A combined language/demo-sign-in probe passes language switching but cannot complete the development-only sign-in step because production deliberately omits those buttons; the failed probe is documented rather than weakening the production boundary.
- Stage1 awaits the hosted GitHub Actions run before closure. Stage2 has not begun.

- Hosted CI passed migration/seed/static/unit/eval checks, then spent over five minutes in the redundant browser installation step. The documented [Ubuntu24.04 runner image](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md#browsers-and-drivers) already includes Google Chrome. CI now pins that runner, verifies its Chrome executable and runs the same Playwright/PDF/Lighthouse checks against it. A30-minute job timeout bounds infrastructure stalls; no test or threshold is removed.

- Replacement hosted run passed40 unit tests,36 mock evals,20 browser cases and the production build. Lighthouse returned92/89/96 for Home/Search/Arabic detail; Search failed the unchanged90 threshold. Closed-map CSS and consultant code are being deferred, and future Lighthouse JSON reports will be retained as CI artifacts.

- Closed Search map and consultant resources now load on demand. The bilingual keyboard opening/closing regression passes; local production performance is **94/94/95** for Home/Search/Arabic detail with the unchanged gate. Full Lighthouse JSON reports are retained by subsequent hosted runs. Hosted confirmation is still required.

- A production-only immediate keyboard probe exposed a pre-hydration trigger race. The native consultant button now stays disabled until its handler is attached; the test waits for that observable state. Rebuilt production discovery checks pass **3/3** in EN/AR, including map loading, direct private-record denial and consultant focus restoration. The failed first probe remains in the validation record.

## V2 Stage 1 — accepted (2026-10-22)

- [Hosted CI](https://github.com/ahmedshammad/Darivo/actions/runs/39786834330) passed at `432c67a`: PostgreSQL 16 migrations/seed, formatting, lint, types, 40 tests, 36 mock evals, 21 browser cases and production build. Lighthouse performance **99/98/94**, accessibility **100**, best practices **96**, SEO **100**; thresholds unchanged. Full Lighthouse reports are retained as CI artifacts.
- Simulated board **9.065**, minimum **8.5**, with every review iteration preserved. Stage 1 is accepted. Next: the full cinematic Arrival and Living Map, with new interaction, WebGL fallback, performance and review evidence. Later native-language, assistive-technology and physical-device validation remains distinct from automated checks.
