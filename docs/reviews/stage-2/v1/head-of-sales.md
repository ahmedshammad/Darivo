# Stage 2 v1 — Head of Sales

**Simulated Tier-1 developer sales persona; not an actual developer endorsement.** Stage scope is Arrival, geographic discovery and reference presentation. I am not penalising the absence of the later Developer Showcase, Launch Room or partner console. This is an explicit simulated self-audit by an agent that contributed to Explore, not independent human research.

I can see why a buyer would open this. The brand has restraint, the market context has sources, and my project is not dressed up with somebody else’s renders. The reference presentation is considerably more careful than a conventional portal. I would still hold a launch demonstration: on a phone, comparing two places puts another panel over the conversation, and the current private-office link does not carry the selected project into the existing consultant.

## Reviewed journey

1. **Arrival and market context — strong.** [EN light full page](../media/v1/arrival-en-light-1440.png) shows sourced Market Pulse, five collections and a respectful text-only developer wall with an explicit no-partnership implication.
2. **Project discovery — honest, somewhat generic.** [EN desktop Explore](../media/v1/explore-en-dark-1440.png) gives Orla its proper name, AED 57.3M amount, “4-bedroom residences from,” agent-listing basis, 2026-06 date and publisher link. It does not claim a verified unit is for sale.
3. **Arabic presentation — composed shell, unfinished explanation.** [AR tablet Explore](../media/v1/explore-ar-dark-1024.png) reads intentionally in RTL, but the project’s location and amount qualifier are English. Keep source wording, and add a short accurate Arabic explanation rather than making the client translate the commercial qualification.
4. **Reference evidence — strong contents, weak source grouping.** [Orla sources](../media/v1/review-rajiv-source-panel.png) keeps the separate Sky Palace qualifier and explains that column height uses static demo FX, while the card remains in original currency. The fresh [Palm Central interaction log](../media/v1/critic/interaction.json) exposes the same publisher twice, once as “Basis not supplied” and once as “Press report”; distinguish fact context or consolidate the citation display.
5. **Comparison and next step — not presentation-ready.** [Phone comparison](../media/v1/critic/04-mobile-comparison.png) discloses the estimate method but obscures the composer. [Current handoff](../media/v1/review-advisor-handoff.png) lands in a generic consultant without the project and client context visible. Passing a project/request summary is link continuity work; it does not require the Stage 3 agent to be completed.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                                                                                    |
| -------------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | Globe, editorial headline and two-market positioning make an appropriate first impression. `arrival-en-dark-1440-viewport.png`.                                                                                             |
| Originality          |     9 | Map columns and narrative collections give developers a recognisable setting beyond a listing grid.                                                                                                                         |
| AI-first             |     8 | Stage 2 demo guidance visibly drives the map and retains the request. Repetitive fit statements and the covered phone composer weaken the conversation-led sales journey.                                                   |
| Map experience       |     8 | Islands and deliberate school/office points help a buyer explore; repeated story captions and sparse area naming give less context than the visual promise.                                                                 |
| Visual craft         |     7 | Phone evidence/source controls and comparison overlap other controls or content. `critic/03-mobile-evidence.png`, `critic/04-mobile-comparison.png`.                                                                        |
| Motion quality       |     8 | Camera changes and reduced-motion alternatives are demonstrated. No production device-motion certification yet.                                                                                                             |
| Arabic & RTL         |     8 | Arabic hierarchy feels deliberate; commercial qualifiers and many reference locations still need a faithful Arabic companion. AR1024 frame.                                                                                 |
| Trust & evidence     |     9 | Orla’s precise price qualifier, original currency, reported date and on-request distinction survive. Palm Central’s unknown completion is not invented. Source duplication is a refinement, not a fabricated fact.          |
| Discretion & privacy |     9 | No false urgency, invented buyer demand or automatic enquiry submission. Selected personal places are deliberately chosen.                                                                                                  |
| Developer appeal     |     8 | Strong brand respect and reference fidelity; the existing next-step link loses the visible project context, reducing qualification value.                                                                                   |
| Speed                |     7 | Manifest shows highly variable Home/tiles readiness, including 14.948 s map-ready and 15.519 s tiles-ready. Not a production LCP measurement, but not enough evidence for a high-confidence presentation-ready speed score. |
| Accessibility        |     7 | Base captures pass axe and keyboard checks, but the signature harness confirms the comparison heading intercepts clicks on the mobile collapse handle. See failed-signature.log.                                            |

**Average: 8.08/10. Minimum: 7. Gate: FAIL.**

## Three delights

1. **Commercial accuracy survives design.** Orla’s 4-bedroom-from qualification and separate Sky Palace note remain attached to the amounts; nothing quietly changes into a universal starting price. `review-rajiv-source-panel.png`.
2. **A real project remains a real-project reference.** Palm Central shows its report date, unknown completion and residences-on-request wording, rather than a made-up stock unit. `critic/interaction.json`.
3. **Developer identity is respected.** The developer wall uses sourced names and explicitly avoids implying partnership; there are no invented logos or borrowed renders. `arrival-en-light-1440.png`.

## Three problems and required fixes

1. **Repair the mobile buyer meeting.** Comparison and source access must not cover the conversation or tools. Place comparison inside the expanded sheet with its own heading and clear return to map. Fresh frames 03/04.
2. **Carry context to the next step.** The selected project, original amount/basis and client’s request should be visible on arrival at the existing consultant, or the action must explicitly offer a copyable brief until that continuity works. Do not imply an enquiry was sent. `review-advisor-handoff.png`.
3. **Make the reference easier to use in Arabic and in a live demonstration.** Add a short faithful Arabic rendering beside original source qualifiers, consolidate repeated source URLs by their fact purpose, and establish production loading evidence. AR tablet frame, Palm Central log and capture manifest.

**Verdict:** “I would show the direction internally. I would not yet put a buyer through this phone comparison and handoff in a launch meeting.”

Evidence limits: this is not a real sales-team interview or developer approval. The matrix has 24 base configurations with zero axe/overflow/page errors, but does not certify every combined state. Production performance remained pending; no physical-device or native-Arabic-reader certification is claimed. Later-stage commercial workflows are outside this score.

## Signature failure retained

The full mobile signature did **not** complete. At `scripts/capture-atlas.mjs:120`, after two comparison selections, the “Between these places” heading repeatedly intercepted clicks on `.atlas-sheet-handle`. The control was visible and enabled but unreachable by pointer. This lowers Accessibility to 7; it is a confirmed task blocker rather than a visual-only risk.

The [failure log](../media/v1/critic/failed-signature.log) is preserved alongside the raw incomplete recordings [first attempt](../media/v1/page@bd2c15346ad6d101d027ce108e5c07c2.webm) and [second attempt](../media/v1/page@cb5e3c21c083d7784d7329767eb2cd7a.webm). These are failed-flow evidence, not successful EN/AR signature demonstrations.
