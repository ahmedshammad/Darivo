# DARIVO — Master Build Brief v2 (for Codex)

> **Read this entire brief before writing a single line of code.** You are not building a property listings website. You are building the most beautiful, intelligent private property experience in the Middle East, for clients who buy AED 20M villas and EGP 90M beachfront homes, and for the developers who sell to them. The previous attempt was rated **8/100** for being a generic portal with a chatbot attached. The bar for this build is **"whoever opens it says wow within five seconds."** If a screen would look at home on a normal property portal, it has failed.

A companion file, **`darivo_reference_dataset.json`**, contains real, sourced data on elite UAE and Egypt developers, flagship projects and market statistics. Place it at `/data/reference/darivo_reference_dataset.json`. Its usage rules are binding.

---

## PART A — WHO YOU ARE: THE DARIVO STUDIO

You will work as a full product studio, not a solo coder. For every stage, explicitly switch between these roles and write each role's output to `/docs/studio/<stage>/<role>.md`. Disagreements between roles are healthy; record them and the decision.

### A1. Build team

| Role | Owns | Standard they hold |
|---|---|---|
| **Creative Director** | Concept, art direction, final taste call | "Would Aman, Apple or Aesop ship this?" |
| **Principal Product Designer** | Flows, information architecture, layouts | Zero dead-ends, fewer than 3 taps to anything that matters |
| **AI Interaction Designer** | How the AI looks, speaks, thinks and drives the UI | The AI *is* the interface, not a side panel |
| **Map Experience Designer** | Everything spatial: 3D map, camera choreography, layers | The map is the hero, not a widget |
| **Motion Designer** | Transitions, micro-interactions, scroll choreography | Every motion has meaning; nothing bounces cheaply |
| **Arabic Typography & RTL Lead** | Arabic type, bidi, Gulf and Egyptian tone of voice | Arabic must feel *designed*, never mirrored or machine-translated |
| **Accessibility Lead** | WCAG 2.2 AA, reduced motion, keyboard, screen readers | Luxury that excludes is not luxury |
| **Front-end Lead** | Component architecture, performance budgets | 60 fps, LCP < 2.0 s on 4G |
| **AI Engineer** | Agent, tools, grounding, evals | Zero invented facts, zero leaked private inventory |
| **Data & Research Lead** | Reference dataset, sourcing, freshness labels | Every number has a source and a date |

### A2. Review board (personas)

Personas are used **both** to design (start every flow from one) **and** to review (they score every stage). Each persona review must be written in that persona's voice, citing specific screens and moments.

1. **Sheikha Al-Mansoori, 44 — Abu Dhabi family office principal.** Buys for the family portfolio across Saadiyat and Palm Jumeirah. Arabic-first and wants Gulf Arabic, not Egyptian or MSA-stiff. Values discretion above all, and hates being "sold to". Tests: privacy, Arabic quality, tone, off-market access.
2. **Karim Hassan, 52 — Egyptian founder living in London.** Wants a North Coast summer home (SouthMED, Silversands, June) and a Dubai investment. Thinks in USD and GBP, pays in EGP. Tests: currency logic, payment-plan clarity, comparing Egypt and UAE side by side.
3. **Elena Rossi, 39 — Milan-based tech executive relocating to Dubai.** English only, design-literate, knows nothing about Dubai neighbourhoods. Tests: the "explain Dubai to me" AI experience, the map as a teaching tool, and the school and lifestyle layers.
4. **Rajiv Mehta, 61 — Mumbai UHNW investor.** Pure numbers: yield, price per sq ft versus area, handover risk and developer track record. Tests: investment panels, comparison, and the data trust layer.
5. **Head of Sales, Tier-1 Developer (Emaar / Nakheel / Aldar / TMG / Ora calibre).** Will only list if Darivo makes their project look *better than their own website* and sends qualified buyers. Tests: Developer Showcase, Launch Room, lead quality, brand respect.
6. **Darivo Private Advisor.** Uses the advisor console daily. Tests: client context, speed, handoff quality.
7. **The Critic — an ex-Apple/Airbnb design director.** Ruthless and has seen everything. Tests: originality, craft, consistency, and "is this actually different?"

### A3. Review protocol (mandatory at the end of every stage)

1. Run Playwright to capture screenshots at **1440px desktop, 1024px tablet and 390px mobile**, in **EN and AR**, in **light and dark**, plus a screen recording (`video: 'on'`) of the stage's signature flow. Save to `/docs/reviews/<stage>/media/`.
2. Each persona scores the stage on the **scorecard** (Part H), writes their top 3 delights, their top 3 problems, and a one-line verdict.
3. The Creative Director writes a synthesis and a fix list.
4. **Fix and re-review until the average is ≥ 9.0/10 and no single criterion is below 8.** Record each iteration (v1, v2, …) in `/docs/reviews/<stage>/`.
5. Only then move to the next stage.

Be honest in reviews. A review that scores everything 10 is a failed review; the Critic must find something.

---

## PART B — THE PRODUCT

### B1. Positioning
**Darivo is a private property office with an AI at its heart.** Clients describe the life they want, and Darivo answers with a handful of places worth their time, shown on a living map with the evidence behind them. Developers get a showcase more beautiful than their own websites and a stream of verified, high-intent buyers.

Markets: **UAE** (Dubai, Abu Dhabi) and **Egypt** (North Coast / Ras El Hekma, Red Sea, West and East Cairo).
Languages: **English and Arabic** (full RTL, Gulf-friendly Arabic by default, Egyptian dialect understood).

### B2. Experience principles (the Studio must enforce these)
1. **AI-first, not AI-added.** The first thing you can do anywhere is talk (type or voice). Search filters exist, but they are the fallback, not the front door.
2. **The map is the canvas.** Place is everything in property. The map is always one gesture away and reacts to the conversation.
3. **Curate, don't list.** Never show 500 results. Show the 6–12 that matter, each with *why it fits you*.
4. **Evidence over adjectives.** Every claim has a number, a source and a date. No "stunning", no "once-in-a-lifetime".
5. **Discretion is a feature.** Private by default; nothing is ever shared without an explicit action.
6. **Cinematic but fast.** Motion is choreography, not decoration. It must never block or slow a task.
7. **One brand, two languages.** Arabic is co-designed, not translated.

### B3. Signature moments (each must be demonstrably "wow")

#### 1. The Arrival (Home page)
- **Full-viewport, dark, cinematic 3D globe or map** that slowly flies from a wide view of the Gulf and the Mediterranean to the user's likely market. Tie the time of day to the viewer's local time (sunrise, golden hour or night lighting).
- Centered: the Darivo wordmark and a single line, then one **conversational prompt** with a living placeholder that cycles through real intents in both languages. Examples:
  - "A beachfront villa on Palm Jebel Ali for my family, ready by 2027"
  - "فيلا على البحر في الساحل الشمالي، تسليم ٢٠٢٨"
  - Include a microphone button for voice.
- As the user types, the map **reacts live**: the camera glides to matching areas, and pins rise as glowing light columns.
- Below the fold:
  - **Market Pulse:** a quiet ticker showing real stats from `market_pulse`, each with a source link.
  - **Collections:** editorial tiles such as *Islands*, *Branded Residences*, *Sahel Summer*, *Saadiyat Culture*, *Ready Before 2028*. Each opens a map story.
  - **The Developers:** an elegant text-wordmark wall of the real developers in the dataset (no logos) leading to Developer Showcases.
  - **The Private Office:** a teaser for verified-only inventory.
- There must be no hero carousel, no search form grid and no stock "luxury couple" photography.

#### 2. The Living Map (the hero product, `/explore`)
- **MapLibre GL + deck.gl**, with 3D terrain, 3D building extrusions, and a custom Darivo map style (dark "night" and light "sand" variants). Water should read as deep and premium, roads should be quiet, and labels should be bilingual.
- **Pins are not pins:** use project "light columns" whose height encodes price and whose glow encodes match score. Cluster them into elegant count bubbles when zoomed out.
- **Camera choreography:** selecting a project flies the camera with pitch and bearing toward it. Collections play as **Map Stories**: a sequenced fly-through with captions (e.g. "The Islands: Palm Jumeirah → Palm Jebel Ali → Jumeirah Bay").
- **Lifestyle layers (toggle chips):**
  - beaches and marinas
  - golf
  - international schools
  - hospitals
  - airports
  - fine dining and culture
  - **drive-time isochrones** (10/20/30 min) from any point, or to "my office" and "my kids' school"
  - a **price-per-sqft / sqm hex layer** for synthetic area data
  - a **sun-path and view-direction indicator** on selected projects
- **Conversation-driven:** the AI can call `map.flyTo`, `map.highlight`, `map.showLayer`, `map.drawIsochrone` and `map.compare`. Saying "show me what's within 20 minutes of Downtown" visibly changes the map.
- **Split layouts:** map + conversation on desktop; map with a draggable bottom sheet on mobile (thumb-first).
- **Compare on map:** select 2–4 projects to see them connected with distance and drive-time lines and a floating comparison card.
- **Performance:** 60 fps on an M1 laptop and a mid-range phone, with progressive loading and graceful 2D fallback if WebGL is unavailable.

#### 3. The Concierge (AI, `/concierge` plus everywhere)
- **Generative UI.** The AI answers with live components rendered inline, not with text walls:
  - project cards
  - comparison tables
  - mini-maps
  - payment-plan timelines
  - price-vs-area charts
  - "a day in this place" itineraries
  - developer track-record cards
- **The Brief builds itself.** A side panel quietly fills in as the user talks: purpose, budget and currency, locations, timeline, must-haves and deal-breakers. Every item is editable, and editing it re-ranks results instantly.
- **Why this, for you.** Every recommendation carries 2–3 reasons tied to the Brief and one honest trade-off (e.g. "handover is 2029; you said before 2028").
- **Voice in, voice out** (optional TTS), with bilingual auto-detection; Gulf and Egyptian Arabic are both understood.
- **Proactive but respectful.** Examples: "Two new Palm Jebel Ali villas were released since your last visit." Never pushy, and never fake urgency.
- **Taste memory** with user consent ("prefers contemporary architecture; dislikes high-rise"), visible and deletable.
- **Personality:** a calm, expert private banker who knows architecture. Brief, precise, warm. No emojis, and no exclamation marks.

#### 4. The Property / Project Story (`/p/[slug]`)
- **Editorial, scroll-choreographed page** (sticky media plus narrative): hero, then the idea, then the place (embedded mini 3D map with layers), then the residences, then the numbers, then the developer, then the service, then next steps.
- **The numbers:**
  - price vs community average
  - price per sq ft / sqm
  - payment-plan **timeline visualizer** (milestones on a horizontal timeline in the client's currency)
  - indicative yield (clearly labelled)
  - UAE Golden Visa indicator (configurable threshold, "indicative")
- **Trust panel:**
  - source links
  - "as of" dates
  - data basis badge (*Developer*, *Press report*, *Recent listing*, *Demo*)
  - verification status
  - permit field (for demo units)
- Actions: *Ask the Concierge about this*, *Add to Portfolio*, *Compare*, *Request Private Viewing* (in person or video), *Share privately*.
- Real projects show project-level facts only, with **"Residences available on request"** leading to an advisor handoff. This is both legally safer and more exclusive.

#### 5. The Private Office (signed-in client home, `/office`)
- **Portfolios** (named shortlists) shown as beautiful boards, plus side-by-side comparison of up to 4.
- A **one-click branded Dossier PDF** (bilingual, with sources) that looks like a private-bank research note.
- **Viewings:** a calendar with time zones for Dubai, Cairo and London.
- **My Advisor:** a named human with presence status and a secure message thread.
- **Private Collection:** off-market and verified-only inventory, gated server-side.

#### 6. The Developer Showcase and Launch Room (the developer sales pitch)
- **`/developers/[id]`:** a magazine-grade developer page. It includes:
  - the developer's portfolio on the map
  - track record (delivered vs pipeline; demo data where real data is not available, badged)
  - flagship projects from the dataset
- **`/launch/[project]` — Launch Room demo:** a cinematic page a developer would use to launch a project to Darivo's clients. It includes:
  - a map story
  - residences
  - a payment plan
  - live "interest" counter (demo)
  - a private RSVP for the launch event
- **`/partner` — Developer Console (demo data):**
  - qualified-demand dashboard by budget band, nationality and intent
  - anonymised Brief insights ("38 verified clients want 5-bed beachfront, AED 15–25M, ready by 2028")
  - lead quality scores
  - inventory upload
- This is how Darivo wins top developers: show them demand they cannot see anywhere else.

#### 7. Advisor and Admin consoles
- **Advisor:** client Briefs, conversation summaries, suggested matches, viewing requests, notes, handoff queue.
- **Admin:** projects and units, developers, sources and freshness, visibility and grants, users and roles, audit log.

---

## PART C — DESIGN SYSTEM ("Darivo Noir & Sand")

Create it first as tokens and documented components at `/design` (a living style guide page), before any feature screens.

- **Color:**
  - Noir `#0B0B0C`, Ink `#16171A`, Graphite `#2A2B30`, Sand `#E9E2D6`, Ivory `#F7F4EE`, Bronze accent `#B08D57` (use sparingly), Signal green `#3E7C6B` for positive data only.
  - All colors are CSS variables with light and dark themes; dark is the default for Home and Map.
- **Type:**
  - Display: a high-contrast serif (e.g. *Canela*-like; use an open font such as **Cormorant Garamond** or **Fraunces**).
  - UI: **Inter**.
  - Arabic display: **Noto Naskh Arabic** or **Amiri** for editorial moments. Arabic UI: **IBM Plex Sans Arabic**.
  - Define a modular scale and use tabular numerals for all prices.
- **Grid and space:** a 12-column grid, generous whitespace, and an 8-point spacing system. Content max-width is 1280px; editorial text max-width is 68ch.
- **Motion:**
  - Framer Motion with custom easing (e.g. `cubic-bezier(0.22, 1, 0.36, 1)`), 200–600 ms durations, Lenis smooth scroll on editorial pages only.
  - Shared-element transitions from card to page.
  - Respect `prefers-reduced-motion`.
- **Imagery:**
  - No copyrighted developer renders. For real projects, use Darivo-made art direction instead: generated architectural abstractions, map-based hero shots, duotone textures, typography-led covers.
  - Clearly licensed stock (e.g. Unsplash with attribution stored) is allowed only for generic lifestyle or place imagery.
- **Components:**
  - Concierge composer (text + voice)
  - Brief panel
  - Project card (3 sizes)
  - Light-column pin
  - Map layer chip
  - Comparison table
  - Payment timeline
  - Trust badge
  - Source chip
  - Price (multi-currency, tabular)
  - Stat block
  - Bottom sheet
  - Command palette (⌘K)
  - Empty, loading and error states that feel premium (skeletons styled as architectural line drawings)
- **Icons:** a lucide-react base with a custom thin 1.25px stroke set for property amenities.
- **Benchmarks for quality (study the craft, do not copy):** Apple product pages (scroll storytelling), Aman (restraint), Linear (speed and polish), Airbnb (map and search ergonomics), Bloomberg Terminal (data density done right).

---

## PART D — DATA

### D1. Real reference data (from `darivo_reference_dataset.json`)
- Seed `Developer`, `Project`, `MarketStat` and `Source` tables from it.
- Display rules are **binding**:
  - always show the source link and the "as of" date
  - show the price basis badge
  - "Indicative — confirm with advisor"
  - no developer logos or renders
  - approximate coordinates flagged as such
- Add a `Source` model (url, publisher, retrieved_at, basis, confidence) and link every fact to one.
- Admin shows a **freshness monitor**: anything older than 90 days is flagged amber, older than 180 days red.

### D2. Demo depth (synthetic, clearly badged "Demo")
- Generate **fictional** demo projects and about 250 demo units around real communities, so search, comparison and the map feel full. Fictional developer and project names only.
- Price bands must be plausible and consistent with the real `price_from` and `market_pulse` figures for each community.
- About 15% verified-only and about 5% private-invite.
- Synthetic POIs (schools, marinas, golf, hospitals) placed sensibly; label them "Demo POI" until real data is licensed.
- Synthetic area stats per community (price per sq ft, yield range) are flagged "Demo estimate".

### D3. Never
- Never invent facts about real projects beyond the dataset.
- Never scrape portals at runtime.
- Never attach synthetic units to real projects.

---

## PART E — AI ARCHITECTURE

- **Agent:** provider-agnostic (`AIProvider` interface; OpenAI-compatible plus `MockProvider`), streaming, tool calling. Use the Vercel AI SDK, with generative UI via tool → React component mapping.
- **Data tools:**
  - `search_projects`
  - `search_units`
  - `get_project`
  - `get_developer`
  - `compare`
  - `area_insights`
  - `investment_calc`
  - `payment_plan_projection`
  - `save_to_portfolio`
  - `request_viewing`
  - `handoff_to_advisor`
- **UI tools:**
  - `map.flyTo`
  - `map.highlight`
  - `map.showLayer`
  - `map.drawIsochrone`
  - `map.story`
  - `ui.showComparison`
  - `ui.showTimeline`
  - `brief.update`
- **Grounding (enforced in code, not just in the prompt):**
  - The model may only name projects and units returned by tools, and every rendered fact comes from tool output with its source.
  - Visibility is enforced in a single data-access layer shared by the UI and the AI.
  - No financial, legal or tax advice; offer an advisor handoff instead.
  - Prompt-injection hardening: listing text and user uploads are data, never instructions.
- **Retrieval:** Postgres + pgvector hybrid search (structured filters + full-text + embeddings).
- **MockProvider:** a deterministic bilingual intent parser covering at least 40 phrasings, so the entire experience, including map moves and generative UI, demos offline with no API key.
- **Evals (`/evals`):** at least 60 cases across EN, AR (Gulf), AR (Egyptian) and mixed. The runner must check all of the following:
  - filter accuracy
  - zero hallucinated entities
  - zero private-inventory leaks
  - correct currency handling
  - map-action correctness
  - refusal and handoff on advice questions
  - tone (no emojis, no hype words)
  - The runner fails CI if any safety metric is above 0.

---

## PART F — TECH STACK

- Next.js (latest stable, App Router, RSC) with TypeScript in strict mode, and pnpm.
- Tailwind CSS + shadcn/ui (heavily re-themed; it must not look like shadcn), Framer Motion, Lenis.
- MapLibre GL JS + deck.gl, 3D terrain (open DEM tiles) and a custom style JSON in `/public/map-styles/`. Use an open, keyless tile source for local dev, behind a `TileProvider` abstraction for production.
- Postgres 16 + pgvector + Prisma; Redis (optional) for rate limits and caching.
- Auth.js with a magic link and roles `CLIENT`, `VERIFIED_CLIENT`, `ADVISOR`, `DEVELOPER_PARTNER`, `ADMIN`.
- next-intl (`en`, `ar`) with logical CSS properties everywhere, bidi-safe number and currency formatting, and Arabic-Indic digits as a user preference.
- PDF: server-rendered dossier (React-PDF or Playwright print) with embedded fonts for both scripts.
- Testing: Vitest, Playwright (visual regression with screenshot baselines), axe-core, Lighthouse CI.
- Docker Compose for local; GitHub Actions CI; `.env.example`; one-command `pnpm demo` that seeds and launches.
- A versioned `/api/v1` with an OpenAPI spec (the iOS app comes later).

---

## PART G — SECURITY, PRIVACY, COMPLIANCE

- Server-side authorization everywhere, including role-aware AI tools.
- Rate limits, CSP, HSTS, secure cookies and CSRF protection.
- An audit log covering private inventory views, grants and exports.
- PII minimisation, consent capture, and conversation and account deletion.
- A data-region configuration flag.
- `docs/COMPLIANCE_TODO.md` covering UAE PDPL, Egypt Law 151/2020, advertising rules for off-plan property, and use of developer names and data. Mark these items for legal review; do not claim compliance.

---

## PART H — THE SCORECARD (used by every persona, every stage)

Score each criterion 1–10:

| # | Criterion | What a 10 looks like |
|---|---|---|
| 1 | **First-5-seconds wow** | You stop, lean in, and want to touch it |
| 2 | **Originality** | Could not be mistaken for any existing portal |
| 3 | **AI-first** | Talking is faster and more delightful than filtering; the AI visibly drives the UI |
| 4 | **Map experience** | Spatial understanding of a city in under a minute; smooth and beautiful |
| 5 | **Visual craft** | Type, spacing, color and imagery are flawless at every breakpoint |
| 6 | **Motion quality** | Choreographed, purposeful and never janky |
| 7 | **Arabic & RTL** | A native Gulf reader feels it was designed in Arabic |
| 8 | **Trust & evidence** | Every number is sourced and dated; no hype |
| 9 | **Discretion & privacy** | A family office would be comfortable using it |
| 10 | **Developer appeal** | A Tier-1 Head of Sales wants their project on it |
| 11 | **Speed** | Feels instant; meets budgets (LCP < 2.0 s, INP < 200 ms, 60 fps map) |
| 12 | **Accessibility** | WCAG 2.2 AA, with keyboard and screen-reader flows working |

**Pass = average ≥ 9.0 with no criterion < 8.**

---

## PART I — STAGES

Each stage ends with the Review Protocol (A3). Keep the app runnable at all times. Commit in small, well-named steps.

**Stage 0 — Discovery & Concept Sprint (no feature code)**
- Studio roles write their briefs.
- Each persona writes a "job story" and their current frustration with existing portals.
- Produce **three distinct visual concepts** as static HTML/React prototypes of the Home and Map: e.g. *Noir Cinematic*, *Sand Editorial*, *Glass Futurist*.
- The review board scores all three; the Creative Director picks one (or a merge) and records why.
- Deliverables: `/docs/studio/stage-0/*`, `/prototypes/concept-{a,b,c}`.

**Stage 1 — Foundation & Design System**
- Repo, tooling, CI, database, auth, i18n/RTL, theme tokens, the full component library, and the `/design` living style guide.
- Seed the reference dataset and demo data.
- ✅ Style guide reviewed in EN/AR, light/dark, at all breakpoints; seed command works; CI is green.

**Stage 2 — The Arrival & The Living Map**
- Cinematic home, live-reacting prompt, Market Pulse, Collections, developer wall.
- `/explore` with 3D map, light-column pins, layers, isochrones, map stories, compare on map, mobile bottom sheet.
- ✅ Recording shows the camera flying in response to typed intent; 60 fps; WebGL fallback works.

**Stage 3 — The Concierge**
- Agent, tools, MockProvider, generative UI components, self-building Brief, voice input, map-driving tools, evals.
- ✅ All three of these demo scripts work end-to-end in EN and AR with no API key:
  - Karim: "North Coast summer home ready by 2028, compare with a Dubai investment"
  - Elena: "Explain Dubai neighbourhoods for a family with two kids near a British school"
  - Sheikha (in Arabic): a beachfront villa on Saadiyat or the Palm
- ✅ Eval safety metrics = 0.

**Stage 4 — Project Story & Private Office**
- Editorial project pages, trust panel, payment timeline, Portfolios, comparison, Dossier PDF, viewings, advisor thread, Private Collection gating.
- ✅ A client goes from concierge → map → project → portfolio → dossier → viewing in under 3 minutes (recorded); a private-inventory leak test passes via UI, API and AI.

**Stage 5 — Developer Showcase, Launch Room & Partner Console**
- Developer pages for every real developer in the dataset, one Launch Room demo, and the partner demand dashboard.
- ✅ The "Head of Sales" persona scores Developer Appeal ≥ 9.

**Stage 6 — Advisor & Admin, Hardening, Polish**
- Consoles, freshness monitor, audit log, security headers, rate limits, performance and accessibility passes, premium empty and error states, README, docs.
- ✅ Lighthouse ≥ 95 on Home, Explore and Project (performance can be ≥ 90 on Explore); axe has zero serious issues; all reviews ≥ 9.0.

---

## PART J — RULES OF ENGAGEMENT

1. Start with Stage 0. Do not skip the concept sprint, and do not start Stage 1 until a concept is chosen and recorded.
2. Never ship a screen you would describe as "a standard listing page".
3. If you must choose between more features and more craft, choose craft.
4. If a requirement is ambiguous, pick the option most consistent with *premium, discreet, evidence-led, AI-first*, record the assumption in `/docs/CHANGELOG.md`, and continue.
5. Never use real developer logos, renders, or invented facts about real projects; never attach synthetic units to real projects; always show sources.
6. After every stage, update `/docs/CHANGELOG.md` with what was built, the review scores (all iterations), known gaps and next steps.
7. If something cannot reach the bar with the current stack, say so in the changelog and propose the alternative. Do not quietly lower the bar.

## DEFINITION OF DONE

A bilingual (EN/AR, native-quality RTL) web experience that runs with `pnpm demo` and needs no API key. It must include:
- a cinematic, AI-first Home
- a 3D Living Map that the Concierge drives
- editorial project stories built on real, sourced developer data, plus clearly badged demo depth
- a Private Office with portfolios, dossiers and viewings
- a Developer Showcase and Launch Room that a Tier-1 developer would want to be on
- advisor and admin consoles

Every stage review must average ≥ 9.0/10 across all seven personas, with evals, tests and CI green.