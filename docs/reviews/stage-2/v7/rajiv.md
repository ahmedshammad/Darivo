# Rajiv Mehta — Stage 2 seventh review

**Simulated persona self-audit by an implementing agent, not independent investment research.** I contributed the renderer, design system and performance/provider work and audited orientation labels. This review covers spatial discovery and qualified reference context, not available inventory, underwriting or a completed advisor service. Previous reviews remain unchanged.

I inspected twelve fresh production/focused stills and eight orientation captures. The [English](../media/v9/signature-en.webm) and [Arabic](../media/v9/signature-ar.webm) recordings are retained, but my inspection used their checkpoint stills rather than full playback. No new browser session or app edit was performed.

The [production matrix](../media/v9/manifest.json) contains 24 layouts; [fallback evidence](../media/v9/fallback-manifest.json) adds eight states. Recorded errors, axe findings and overflow are zero. The parent reports six production reading/orientation tests, 67 native unit tests and 36 mock evaluations passing. The complete local browser run was **55/56**, failing a cold authentication wait; fifteen focused cases and the staff case subsequently passed. I do not describe that as a fully clean rerun. Hosted CI `39824920382`/`39824917165` for source `c5033b8` is pending.

> “The phone now lets me read an amount and its qualification together while retaining the question I asked. That is a practical improvement when I am moving between two markets.”

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                               |
| -------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |   9.5 | [Desktop Arrival](../media/v9/arrival-en-dark-1440-viewport.png) remains a composed, memorable invitation with a clear next action.                                    |
| Originality          |   9.5 | [Arabic tablet Arrival](../media/v9/arrival-ar-light-1024-viewport.png) retains a distinctive spatial/editorial identity.                                              |
| AI-first             |   8.5 | [Cross-market checkpoint](../media/v9/signature-en-comparison-map.png) preserves both markets and moves geography; complete suitability reasoning is not demonstrated. |
| Map experience       |     9 | Added area labels improve initial orientation; cross-market endpoints remain visible. Duplicates and mobile omissions keep the improvement qualified.                  |
| Visual craft         |   9.5 | [EN evidence](../media/v9/signature-en-evidence.png) now shows amount, currency basis, Demo status and completion/date rows beneath a compact retained brief.          |
| Motion quality       |     9 | [Current M3 probes](../media/performance-v9/performance.json) show consistent active-motion cadence within four short measurement windows.                             |
| Arabic & RTL         |   8.5 | [Arabic evidence](../media/v9/signature-ar-evidence.png) handles the native amount and mirrored reading order clearly; native Gulf validation is still absent.         |
| Trust & evidence     |     9 | [Reference card](../media/v9/explore-en-light-1024.png) retains source, date and listing basis; demo evidence explicitly disclaims an offer or inventory.              |
| Discretion & privacy |   9.5 | The inspected flow adds no urgency or automatic enquiry. Existing handoff evidence is supporting history, not a new privacy/legal audit.                               |
| Developer appeal     |     9 | ORLA receives prominent presentation without implying current availability or an affiliation.                                                                          |
| Speed                |   8.5 | Pre-label hosted Home/Explore scores 98/98 are strong, but LCP 2233.1/2219.2ms remains above 2s; current hosted results are pending.                                   |
| Accessibility        |     9 | Clean current capture checks and focused interaction passes support usability; full native AT and physical-device validation remain open.                              |

**Mean 9.0417; minimum 8.5.** Visual craft rises from 9 to 9.5 because the financial reading task materially improves on a phone. Other scores remain unchanged. This individual score does not calculate the board aggregate or waive the separate strict performance target.

## Three delights

1. **Qualification stays beside the amount.** [English mobile evidence](../media/evidence-reading-v4/en-light-375-rest.png) shows 35,300,000 AED, original-currency wording, fictional-project qualification and “Date not provided.” I can see why the number is not decision-ready.
2. **Two markets remain two markets.** The [comparison map](../media/v9/signature-en-comparison-map.png) retains Egypt and UAE endpoints and a separated 2,746.7km annotation without removing Saudi Arabia’s geographic context.
3. **Editing does not discard the reading task.** [Arabic mixed-script editing](../media/evidence-reading-v4/ar-dark-390-editing.png) enlarges the same brief while retaining the selected evidence below.

## Three problems / limits

1. **The strict speed gap remains.** Fresh M3 moving medians are 16.4–16.7ms and p95 17.3–19.8ms, with no moving intervals over 33.34ms. One desktop-Arrival full RAF window has an outlier. Bounded cadence does not establish LCP compliance, field INP, M1 or physical-phone performance.
2. **Very short screens require nested reading.** [Open sources at 500px](../media/evidence-reading-v4/ar-light-390-short-sources.png) leaves 96px of evidence space. Reachability improves, but source notes and project facts cannot be read simultaneously without scrolling.
3. **Orientation and confidence are incomplete.** [Orientation evidence](../media/orientation-v1/README.md) records 38 rendered instances from 42 planned placements; mobile Saadiyat has no added label and Palm can repeat a native name. Native Gulf readers and full assistive-technology users have not independently validated the result.

**Verdict:** The improved mobile evidence deserves a higher craft score; strict speed, current CI and independent-device validation remain unresolved.
