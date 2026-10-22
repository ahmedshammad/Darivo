# Darivo

A private, bilingual property-finder demo for the UAE and Egypt. English and Arabic/RTL, 200 fictional residences, a grounded AI consultant, private collections, bilingual PDF dossiers and advisor/admin workflows.

## Run in a few minutes

Requirements: **Node.js 22**, **pnpm 11**, and Chrome for PDF export/browser tests. No AI key or Docker is required for the quick demo.

```sh
pnpm install && pnpm dev
```

Open **http://localhost:3000/en** or **http://localhost:3000/ar**. Leave that terminal running. The launcher creates a private `.env` with a random auth secret, starts persistent local PGlite + pgvector, applies migrations, seeds 200 properties and starts Next.js. Restarting does not reset your saved work. PGlite data lives in your OS temporary directory under `darivo-postgres-<project hash>`; OS cleanup can remove it, so use Docker volumes for durable development.

If Chrome is missing, install it for PDF rendering and tests:

```sh
pnpm exec playwright install chrome
```

Use **Private access → Explore the demo**:

| Account         | Email                   | Access                                              |
| --------------- | ----------------------- | --------------------------------------------------- |
| Private client  | client@darivo.example   | Public inventory                                    |
| Verified client | verified@darivo.example | Public + verified-only                              |
| Advisor         | advisor@darivo.example  | Advisor desk + private introductions                |
| Administrator   | admin@darivo.example    | Inventory, users, verification, audit and analytics |

No passwords are needed for these explicit **development-only** identities. The normal email-link form prints a single-use Auth.js link in the local server console. Only invited/seeded accounts may sign in. Production demo credentials and the console mailer are disabled.

## Try the complete journey

1. Sign in as Private client and open **Your consultant**.
2. Ask **“3-bedroom villa in Dubai Hills under 12 million dirhams”** or **“فيلا ٣ غرف في دبي هيلز تحت ١٢ مليون درهم”**.
3. Save the returned residence to **Dubai family home**. Select it for comparison and download its bilingual private dossier.
4. Request a private viewing with a Dubai or Cairo timezone. Your advisor confirms availability.
5. Submit the profile’s built-in verification placeholder. Sign in as admin, choose **Users & verification**, and approve it.
6. From the advisor desk, grant `property-020` to the private client. It becomes visible to that client only. Revoke it and access disappears immediately. Audit records both actions.

All listings, developers, permits, insights, financial assumptions and accounts are fictional. The area names are real geography. Illustrations are original vector artwork, not listing photographs. The offline map is schematic, not a navigational map.

## PostgreSQL 16 + pgvector (canonical setup)

With Docker installed:

```sh
cp .env.example .env
# Keep LOCAL_DB=external; set AUTH_SECRET or let pnpm dev generate it.
docker compose up -d --wait
pnpm dev
```

The database binds to loopback port 55432. Set a unique `POSTGRES_PASSWORD` and matching `DATABASE_URL` for any shared environment. CI uses PostgreSQL 16 with pgvector. This host lacked Docker, so local execution was validated using the PGlite fallback; it uses real PostgreSQL semantics but is a single-backend WASM development database, not the production engine or a production service.

## AI configuration

Default: `AI_PROVIDER=mock`, deterministic bilingual parsing and local hashed embeddings. All tools and visibility checks are identical for both providers.

To opt in to an external compatible provider, configure `.env`:

```dotenv
AI_PROVIDER=openai
OPENAI_API_KEY=your-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

Restart with `pnpm dev`, or run `pnpm db:seed` to re-index embeddings. Vectors are 64-dimensional and tagged with their source. Without a key, the app falls back to MockProvider. External mode sends the client message/brief to that provider; do not enter real personal information in this demo. Raw model prose never reaches the client: validated tool facts render through trusted localized templates and cards. See [AI.md](docs/AI.md).

## Validate

With `pnpm dev` running in another terminal:

```sh
pnpm check          # lint, strict types, units/integration, 36 AI evals, browser tests
pnpm build          # optimized production compilation
pnpm format:check
```

Browser tests use Chrome and write traces to `/tmp/darivo-e2e-results`. PDF visual QA uses Poppler. `pnpm eval` runs mock cases and additionally reports real-provider results when a key is configured. Real-provider checks are explicitly skipped without a key.

For a production preview, keep the database available, then run:

```sh
AUTH_URL=http://localhost:3001 pnpm exec next start --port 3001
```

Production preview has public pages; enabling real sign-in requires implementing a production mail delivery adapter. This is a local demo, not a launch-ready regulated service.

With that preview running, `pnpm test:performance` runs mobile Lighthouse on the landing page, search and Arabic property detail, enforcing scores of at least 90. Override its origin with `LIGHTHOUSE_BASE_URL`. See [recorded validation results](docs/VALIDATION.md).

## Structure and decisions

- Next.js App Router + strict TypeScript, next-intl, Tailwind, Radix/shadcn-style Button, restrained Framer Motion, MapLibre.
- Auth.js JWT sessions with Prisma adapter and console magic links. Every privileged request reloads current role/verification.
- Prisma/PostgreSQL, pgvector + full-text search, shared visibility DAL, Zod inputs and tools.
- Versioned `/api/v1` endpoints; [OpenAPI contract](docs/openapi.json), [API guide](docs/API.md).
- [Architecture and local adaptations](docs/ARCHITECTURE.md), [stage checks and assumptions](docs/CHANGELOG.md), [legal/operational review](docs/COMPLIANCE_TODO.md).
- Current Next.js stable was installed from the registry. Prisma 6.19 is intentionally pinned for the stable schema-engine workflow. Webpack is used after a reproducible local Turbopack reload loop. Local fonts and MapLibre worker assets are vendored with licenses.

## Operational limits

- Local, in-process rate limiting is suitable for one demo instance. Use a shared limiter before multi-instance deployment.
- `DATA_REGION=UAE|EGYPT|LOCAL` validates deployment intent; it does not guarantee physical data residency.
- No payments, real KYC, CRM, paid maps, external messaging or real listing feeds exist.
- Shared links retain normal visibility restrictions; they do not bypass verification or private grants.
- Dossiers export at most 24 authorized properties. All estimates are illustrative and labeled.
- Deleting a demo account removes its workflow data; the next seed recreates its fictional identity. Legal review and production mail/identity/retention controls are required before launch.

## Troubleshooting

- **Port 55432 is occupied:** use the already running database with `LOCAL_DB=external` and its URL, or stop the other local demo. Do not run two launchers against the same PGlite directory.
- **Sign-in redirect mismatch:** open `http://localhost:3000`, matching `AUTH_URL`; restart after changing env variables.
- **Prepared-statement errors with PGlite:** keep `connection_limit=1&pgbouncer=true&statement_cache_size=0` in its URL.
- **PDF browser not found:** install Chrome with the command above, or set `PDF_BROWSER_CHANNEL` to an installed Playwright channel.
- **Dev reload loop:** the scripts deliberately use `--webpack`, explicit Tailwind source roots, and external test/database storage.
