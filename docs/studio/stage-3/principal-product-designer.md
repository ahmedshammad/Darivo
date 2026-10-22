# Stage 3 — Principal Product Designer

Design specification only. Stage 2 is accepted at board aggregate 9.012, minimum 8, with source `c5033b8` CI passing. That acceptance does not close the separately recorded strict LCP, physical-device or independent-reader limits. The approved Atlas and Stage 1 components are the visual starting point; no new visual direction or frontend implementation is proposed here.

## Three journeys, one conversation model

| Persona | Retained intent                                                                                                                   | First useful response                                                                                                  | Next action and honest boundary                                                                                                                                                               |
| ------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Karim   | North Coast summer residence **and** Dubai investment; ready by calendar year 2028; separately stated spending/display currencies | Two objective groups, a short account of what is known, project cards with Brief-linked reasons and one trade-off each | Compare 2–4 projects across markets, native prices, completion and evidence. Unknown completion stays unknown. “By 2028” must not become “ready now.”                                         |
| Elena   | Dubai relocation, family with two children, British-school requirement                                                            | A neighbourhood explanation with a map action and a small set of lifestyle/context cards                               | Select a place, inspect school evidence and adjust priorities. Fictional Demo POIs cannot establish curriculum, admissions or a verified commute. Ask one useful clarification when required. |
| Sheikha | Beachfront villa, Saadiyat **or** Palm; expressed privacy requirements                                                            | Arabic-first explanation preserving both alternatives, two place groups and qualified project cards                    | Compare alternatives, read evidence and prepare an optional advisor draft. Do not invent privacy attributes or imply off-market access.                                                       |

Each journey must work in EN and AR with MockProvider and no API key. Deterministic demo answers must still use the same validated component/action contracts as real-provider answers. Script variants and follow-up edits must work; the experience must not be three hardcoded screenshot paths.

## Desktop and mobile composition

At 1440px, use a readable conversation lane beside one persistent LivingMap. The Brief is a labelled collapsible section within the reading lane, not a third permanently narrow column. At 1024px, preserve useful reading width and let Brief details fold. At 390/375px, reuse Atlas's nonmodal draggable sheet: collapsed map, expanded conversation/evidence, and a Brief mode within that same sheet. Do not nest a modal sheet over the primary map journey.

Retain the current compact composer when reading evidence and its larger multiline editing state. Source notes remain reachable on 500px-high viewports. A user can move between conversation, Brief and map without losing input, selected project, comparison or scroll position. No reply forces the reader back to the newest message while they inspect earlier evidence; offer a labelled new-response action instead.

## Brief and response behavior

Brief fields have stable IDs and controlled values. Represent multiple objectives, location alternatives, budget/currency, deadline, must-haves and deal-breakers; preserve original user words and distinguish unspecified from explicitly removed. Do not remount the form on server patches. While a field is being edited, incoming changes must not overwrite it. Commit a validated revision on blur/Enter or an explicit Apply action; re-rank from that revision with a short status message and keep focus stable.

A reply starts with a concise explanation, then one dominant component and optional supporting evidence/actions. Recommendations carry 2–3 specific reasons tied to Brief fields and one trade-off. Components are grounded data, not model-authored HTML. Editing the Brief updates the current recommendations while history retains the basis of earlier replies.

## Entry, ownership and first slice

Arrival, Explore and contextual project actions should pass draft text and authorized project context into the same controller. Keep `/consultant` and existing callers working until each is deliberately migrated. Sign-in continuation must preserve the draft and never submit it automatically. Explore's local preview parser must not race the committed Concierge map-action owner.

Proposed frontend ownership, after authorization: `src/components/concierge/{concierge-client,conversation,brief-editor,response-renderer,concierge-map}.tsx`, `src/components/concierge/concierge.css`, `messages/concierge.ts`, and focused UI tests. Noir owns `src/lib/concierge.ts` and `CONTRACT.md`; parent owns SDK/API transport and authorizes route wiring. Existing Atlas renderer, shared primitives, layouts and legacy Consultant are coordinated changes, not implicit ownership.

First bounded slice: Karim in both languages, typed draft → validated Brief → two grounded project groups → comparison/map action → one Brief edit and re-ranking → cancel/retry → history reload without replayed camera actions. Use existing geographic fallback and authorized demo data. This proves the shared contracts before adding Elena's teaching components, Sheikha's alternative-location refinements, voice and the remaining component types. It is a slice, not Stage 3 completion.

## Implementation audit — before production review

The public Concierge now supports the three authored journeys through one controller, a stable editable Brief and a single main geographic map. Arrival and Explore expose explicit continuation links; they preserve draft/theme/authorized project context without sending a request. The legacy Consultant remains available. Signed-in clear → send and sign-in continuation have focused development-browser coverage. History snapshots render without replaying map actions.

Visible Brief fields include objectives, alternative locations, budgets/currencies, deadlines, household/school needs, constraints, privacy and taste consent. Conditions now expose objective scope and whether evidence is required. The server owner has repaired the earlier stale-ID interpretation: edited text supplies meaning, while an unsupported required condition stays unknown. Re-ranking occurs on explicit Apply. Unsaved stale revisions remain editable but require discard before applying; there is no automatic merge. Validation feedback is currently general, and editing more than the contract's 24 patch operations at once can require smaller batches.

The implementation audit exposed two feedback defects, now repaired: confirmation leaves a receipt derived from the returned CONFIRMED/REJECTED status, and the footer reflects disabled conversation saving. Viewing receipts explicitly retain the need to confirm an appointment. Taste memory can be inspected and revoked as a whole; individual remembered entries are not editable here. Full production captures, mutation journeys and the seven-person review are pending. This audit is not a stage score or release approval.
