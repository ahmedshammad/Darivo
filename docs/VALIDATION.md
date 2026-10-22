# Validation record — 22 October 2026

## V2 Stage 1 — current checkpoint

The [hosted run for checkpoint 432c67a](https://github.com/ahmedshammad/Darivo/actions/runs/39786834330) passed migration, seed, static checks, 40 tests, 36 evals, 21 browser tests, production build and the unchanged Lighthouse gate. Hosted performance scores were Home **99**, Search **98**, Arabic detail **94**; accessibility 100, best practices 96 and SEO 100. Stage 1 passes. [Detailed evidence](reviews/stage-1/hosted-ci.json) preserves the earlier cancelled and failed runs. These scores do not establish the later Stage 6 LCP or physical-device budgets.

| Check                          | Result                                                                                                                                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reference/demo database        | Native PostgreSQL16.2 + pgvector0.6.2; all three migrations and two seed runs pass                                                                                                                          |
| Seed boundaries                | 250 fictional units,16 demo projects,13 real references,9 real organisations plus one aggregate,41 sources,241 sourced fact records,52 demo POIs; zero invalid unit attachments or invented retrieval dates |
| Unit/integration suite         | 40 tests pass on native PostgreSQL                                                                                                                                                                          |
| Mock evals                     | 36/36 pass, zero private-inventory leakage; real provider skipped without a key                                                                                                                             |
| Browser checks                 | 16 application cases plus four new design-system regressions pass; final demo sign-in/preferences subset4/4 also passes                                                                                     |
| Design matrix                  | EN/AR × light/dark ×1440/1024/390:12 configurations, zero axe findings, overflow or page errors; two signature videos                                                                                       |
| Simulated review board         | Initial8.839/min8; repaired9.065/min8.5; all iterations preserved                                                                                                                                           |
| Production build/static checks | Build, lint, strict types and formatting pass                                                                                                                                                               |
| Production guide               | Four focused guide cases pass on the optimized build                                                                                                                                                        |
| Local Lighthouse               | Home94, Search94, Arabic detail95 performance; accessibility100, best practices96, SEO100                                                                                                                   |

The first production performance run returned88/86/94. Removing unnecessary other-language font prefetching and a shared unused font preload repaired the regression without lowering the90-point gate. Language switching passes in production. A combined development sign-in probe cannot finish there because production intentionally excludes quick demo credentials; this is recorded as an inapplicable test step, not bypassed by enabling production demo accounts.

The native fixture is temporary, loopback-only validation infrastructure. Docker itself remains unavailable on this host. These results do not certify live source freshness, native Gulf-Arabic quality, physical-phone performance, human screen-reader usability, production mail or legal compliance. Stage2–6 remain separate acceptance gates.

## V1 historical baseline

The following records the earlier MVP before V2 reference data and component work. It is retained as history, not a claim about V2 completion. It was validated locally on macOS arm64, Node22.22.3, pnpm11.25.0, Chrome and PGlite with pgvector. Its inventory and identities were synthetic.

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

### V1 production performance

`pnpm test:performance` uses Lighthouse 13.5 with its default simulated mobile throttling against the optimized production build. Each route uses a fresh browser audit. Scores are observations from this host and may vary with hardware and load; the script and CI enforce a minimum of 90 in each category.

| Page                          | Performance | Accessibility | Best practices | SEO |
| ----------------------------- | ----------: | ------------: | -------------: | --: |
| `/en`                         |          93 |           100 |            100 | 100 |
| `/en/search`                  |          91 |           100 |            100 | 100 |
| `/ar/properties/property-002` |          98 |           100 |            100 | 100 |

Local font preloads, reserved loading space, image priorities and an explicitly opened detail map reduce initial layout shifts and browser work. The interactive search map still opens directly from the map tab.

### External checks not performed at the V1 checkpoint

- No Git remote is configured, so GitHub Actions has not run. The workflow provisions PostgreSQL 16 + pgvector and runs formatting, lint, types, tests, evals, browser checks, production build and Lighthouse. Equivalent available checks passed locally.
- Docker/PostgreSQL 16 could not run on this host. Fresh migrations and integration checks used real PostgreSQL semantics through PGlite; this does not verify the canonical deployment engine.
- No AI API key is configured. The real-provider evaluation reports an explicit skip; live tool-calling and embeddings require validation with the intended provider.
- Real mail, KYC, legal compliance and production hosting remain the documented MVP integration boundaries, not verified production services.
