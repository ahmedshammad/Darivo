# Stage 2 v1 — Darivo Private Advisor

Simulated role review, 22 October 2026. This is a design and interaction review, not an actual advisor interview. Scope is the Stage 2 Arrival/Living Map and its visible onward link. It does not certify the later advisor dashboard, CRM, regulated advice or production service. Evidence comes from the completed 24-state matrix and a direct local browser journey, with code frozen.

> The client can show me what they mean, and I can distinguish a published reference from a Demo. But when they ask to talk to the private office, the context disappears. I must start the conversation again.

## Flow inspected

1. **Describe the requirement: useful and honest.** Entered “North Coast summer home ready by 2028, compare with a Dubai investment.” The map moved to Egypt, the original request remained visible, and the screen explicitly said other requirements were not verified filters. [Exact submitted state](../media/v1/review-advisor-mixed-brief.png).
2. **Select ORLA and read evidence: useful.** Original AED price, source basis, completion context, approximate coordinates and confirmation language make an advisor discussion easier. [Selected reference](../media/v1/review-rajiv-source-panel.png). The live accessibility tree additionally showed duplicate source URLs with inconsistent basis labels.
3. **Talk to the private office: context discontinuity.** Clicking the selected project's CTA opened `/en/consultant` with a generic greeting and blank/Any brief fields. No ORLA selection or original request was carried visibly. [Destination immediately after CTA](../media/v1/review-advisor-handoff.png). Nothing was sent automatically, which is correct. Full production handoff is later scope; the current link still needs honest continuity expectations.
4. **Compare on mobile: recovery blocked.** The parent signature run failed when the comparison panel intercepted the sheet handle. [Signature comparison](../media/v1/signature-en-comparison.png); exact failure is recorded in `/tmp/darivo-stage2-capture-v1-flows.log`. Raw videos must not be described as completed journeys.

## Part H scorecard

| Criterion            | Score | Evidence                                                                                                                                                                                                  |
| -------------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | `arrival-en-dark-1440-viewport.png`: a calm, memorable welcome with geography central to the proposition.                                                                                                 |
| Originality          |     9 | `explore-en-light-1440.png`: editorial shortlist and actual map feel unlike a mass-market portal.                                                                                                         |
| AI-first             |   7.5 | `review-advisor-mixed-brief.png` retains mixed purpose/year/location language honestly, but the private-office destination loses context in `review-advisor-handoff.png`.                                 |
| Map experience       |     8 | Camera responds to the North Coast request; selection reaches the Palm. Comparison and map-source overlays conflict in `review-rajiv-comparison-conflict.png`.                                            |
| Visual craft         |     8 | Lovely desktop type; mobile RTL remains composed in `explore-ar-light-390.png`. Overlapping panels compromise an otherwise careful layout.                                                                |
| Motion quality       |     8 | Live camera transitions had clear destinations; no heavy profiling performed during review. Reduced-motion/native-device assurance is outside this evidence.                                              |
| Arabic & RTL         |     8 | `explore-ar-dark-1024.png` uses deliberate right-side structure and Arabic display typography. Reference basis still includes English; native-reader review remains pending.                              |
| Trust & evidence     |   7.5 | Demo/reference and indicative/on-request distinctions help an advisor. Conflicting 23/35-minute comparison estimates create an avoidable explanation burden.                                              |
| Discretion & privacy |     9 | No automatic enquiry or contact demand in the evidence path. This does not establish storage, security or legal compliance.                                                                               |
| Developer appeal     |   8.5 | Project-level evidence and the editorial home sections give references dignity without claiming availability; `arrival-en-light-1440.png`, `review-rajiv-source-panel.png`.                               |
| Speed                |     7 | Provisional: manifest has substantial development map waits and a Sand tablet fallback at 14,948 ms. Production LCP/INP and actual map-frame budget remain pending.                                       |
| Accessibility        |   7.5 | Zero recorded axe violations/overflow across 24 captures; selected evidence focus is useful. Comparison blocks the mobile handle, so recovery is not reliable yet. Physical phone/native reader untested. |

Mean **8.083/10**, minimum **7**. This review does not pass the Part H gate.

## Top three delights

1. “Your words” preserves the original client request and avoids pretending that a year or investment purpose has been fully validated.
2. Reference evidence admits approximate location, indicative prices and availability on request. I can explain what is known and what still needs checking.
3. Private-office navigation does not silently send an enquiry. The client controls the next step.

## Top three problems and repairs

1. **P1 — Preserve or explicitly qualify onward context.** The current selected-project CTA lands in a fresh generic conversation. Carry a safe project/reference identifier and the brief into an explicit preview, or label the link as starting a new conversation until later-stage handoff exists. Do not silently send a message. Evidence: `review-advisor-handoff.png` after the ORLA CTA.
2. **P1 — Restore mobile recovery and source access.** Comparison must not cover the bottom-sheet handle or map-source disclosure. Keep a visible close/clear route; verify both keyboard and touch. Evidence: failed signature comparison and `review-rajiv-comparison-conflict.png`.
3. **P1 — Give the advisor one consistent comparison.** The same pair's 23.5 km is presented with ~23 and ~35 minutes. Use one shared estimate rule, suppress long/cross-border pseudo-drive times, and clean duplicate source records. Evidence: comparison screenshot and supplemental live source inspection.

**Verdict:** Strong preparation for a private conversation, but the comparison and context transition need another pass before I would use the whole journey with a client. This verdict concerns the visible Stage 2 path, not completion of the later advisor product.
