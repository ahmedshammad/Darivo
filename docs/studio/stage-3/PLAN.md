# Stage 3 — Concierge implementation plan

The accepted Stage 2 source is `c5033b8`, with review evidence committed at `62af928`. Stage 3 begins with ten role briefs and shared typed contracts. Stage 3 is not accepted until the three required journeys work in both languages, eval safety metrics are zero, and the complete review protocol passes.

## Architecture decisions

- Guests may discover public projects and units. Authentication is required for stored history, taste memory and confirmed writes.
- `/api/v1/concierge` is separate from legacy `/consultant`. The new transport uses the Vercel AI SDK and strict typed events. Model output never supplies free-form factual UI.
- Each market keeps its own purpose, budget and deadline. Display and payment currencies are independent. Original wording, uncertainties, exclusions and privacy restrictions survive corrections.
- Data and UI tools are allowlisted. All data comes through the existing authorized DAL. A provider may propose a portfolio save, viewing or advisor handoff; an explicit reviewed confirmation is required to execute it.
- History is a snapshot, with current authorization checked again. It cannot replay map movements or writes. Revision checks and request IDs protect edits, retries and deletion.
- One primary LivingMap renders live actions. Its existing controls and fallback stay functional. Inline map components reuse the primary map instead of creating additional WebGL contexts.

## Ownership and sequence

1. Noir owns shared contracts, Brief patch semantics, authorized tools, grounding and incremental engine execution. Sand owns deterministic parsing, bilingual corrections and the bilingual eval suite (currently 91 corpus cases). Glass owns the Concierge route, components, RTL, voice and interaction behavior. Parent owns SDK dependencies, real-provider adapter, transport hook, API, persistence and integration.
2. Implement Karim's complete bilingual slice first: submission, multi-market Brief, grounded cards, comparison/map, edit and rerank, cancel/retry and safe history restoration.
3. Complete Elena and Sheikha, remaining generative components, voice and explicit consent/confirmation. Integrate Arrival, Explore and contextual entry through the shared controller.
4. Run parser/contract tests, authorized tool and persistence tests, at least 60 evals, all browser journeys and existing regressions. Inspect production screenshots and recordings in EN/AR, light/dark at 1440, 1024 and 390 widths.
5. Seven independent persona reviews, Creative Director synthesis, repairs and re-review until aggregate at least 9 and every criterion at least 8. Record limitations honestly, run CI and commit logical increments.

## Disagreements resolved

Requiring sign-in before the first useful answer would interrupt the AI-first Arrival. Public read-only use therefore works without sign-in; storage and writes remain authenticated. Persistent history and taste memory are separate choices. Advice requests offer a handoff but do not create one automatically. British-school proximity remains unverified because the available school POIs are fictional. Reference project prices and targeted completion dates retain their source qualifications.
