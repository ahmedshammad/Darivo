# Validation record — 22 October 2026

Validated locally on macOS arm64, Node 22.22.3, pnpm 11.25.0, Chrome and PGlite with pgvector. All inventory and identities are synthetic.

| Check                               | Result                                                                            |
| ----------------------------------- | --------------------------------------------------------------------------------- |
| ESLint, strict TypeScript, Prettier | Passed                                                                            |
| Vitest unit/integration suite       | 24 passed across 6 files                                                          |
| Mock consultant evaluation          | 36/36 passed; zero off-market leakage                                             |
| Playwright browser suite            | 13 passed                                                                         |
| Production compilation              | Passed                                                                            |
| Empty database migration and seed   | Both migrations applied; 160 public, 30 verified-only, 10 private-invite listings |
| OpenAPI contract                    | 21 paths; all 359 internal references resolved                                    |
| Bilingual PDF visual inspection     | A4 cover and property page rendered with Poppler; readable Arabic, no clipping    |

Browser coverage includes the full consultant → shortlist → comparison → PDF → viewing journey; Arabic filters and map; mobile layouts at 375px; keyboard entry; axe AA scans on public, client and staff screens; role injection and staff API rejection; grant isolation, revocation and audit; shortlist/PDF ownership; CSRF, body limits and private HTML redaction. Automated accessibility checks supplement, rather than replace, human screen-reader testing.

## Production performance

`pnpm test:performance` uses Lighthouse 13.5 with its default simulated mobile throttling against the optimized production build. Each route uses a fresh browser audit. Scores are observations from this host and may vary with hardware and load; the script and CI enforce a minimum of 90 in each category.

| Page                          | Performance | Accessibility | Best practices | SEO |
| ----------------------------- | ----------: | ------------: | -------------: | --: |
| `/en`                         |          93 |           100 |            100 | 100 |
| `/en/search`                  |          91 |           100 |            100 | 100 |
| `/ar/properties/property-002` |          98 |           100 |            100 | 100 |

Local font preloads, reserved loading space, image priorities and an explicitly opened detail map reduce initial layout shifts and browser work. The interactive search map still opens directly from the map tab.

## External checks not performed

- No Git remote is configured, so GitHub Actions has not run. The workflow provisions PostgreSQL 16 + pgvector and runs formatting, lint, types, tests, evals, browser checks, production build and Lighthouse. Equivalent available checks passed locally.
- Docker/PostgreSQL 16 could not run on this host. Fresh migrations and integration checks used real PostgreSQL semantics through PGlite; this does not verify the canonical deployment engine.
- No AI API key is configured. The real-provider evaluation reports an explicit skip; live tool-calling and embeddings require validation with the intended provider.
- Real mail, KYC, legal compliance and production hosting remain the documented MVP integration boundaries, not verified production services.
