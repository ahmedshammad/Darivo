# Sheikha Al-Mansoori · Stage 2 seventh review

This is a **simulated self-audit**, not a client interview or independent approval. I contributed Arrival, preferences, CSS scoping and the evidence-sheet repairs. Scores cover Stage 2; later transaction/concierge features are outside scope. Previous failures remain intact.

## Evidence and limits

**M:** Fresh [24-layout matrix](../media/v9/manifest.json), [eight fallback states](../media/v9/fallback-manifest.json), and EN/AR signature checkpoints report zero errors, axe findings or overflow. I inspected Arrival, evidence, comparison and orientation images; videos were not watched frame by frame. **E:** I inspected eight [reading-repair images and geometry](../media/evidence-reading-v4/README.md). **O:** [Orientation evidence](../media/orientation-v1/README.md) distinguishes rendered labels from planned placements. No browser run.

**R:** Fresh [performance-v9](../media/performance-v9/performance.json) contains four three-second M3 Metal samples: moving medians 16.4–16.7 ms, p95 17.3–19.8 ms, zero moving intervals above 33ms/errors; the full desktop Home RAF window has one slower interval. **P:** [Earlier hosted scope audits](../performance/hosted-scope/README.md) scored Home 98/Explore 98, LCP 2233.1/2219.2 ms. They precede these reading/label changes; the strict 2s budget remains open.

Source `c5033b8` is pushed. Parent-reported checks: six production reading/orientation cases, 67 native-DB unit tests and 36 mock evaluations pass; the full local run was 55/56 after a cold authentication wait failure, followed by 15 focused passes and a staff-case pass. The full suite remains unconfirmed. CI [39824920382](https://github.com/ahmedshammad/Darivo/actions/runs/39824920382) and [39824917165](https://github.com/ahmedshammad/Darivo/actions/runs/39824917165) remain pending at review time. Physical phones/M1, field INP, native Gulf editorial and full AT validation are unproven. References are supplied evidence, not independently verified current market truth.

“The Arabic evidence now gives me the facts before asking me to scroll. The private-office tone remains calm; I still want honest limits around speed and language validation.”

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                  |
| -------------------- | ----: | ----------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |   9.5 | M: Arabic light tablet Arrival preserves its composed headline, generous globe and clear invitation.                                      |
| Originality          |     9 | M: Two-shore geography and conversational entry retain a distinctive private-office identity.                                             |
| AI-first             |     9 | M: The Saadiyat/Palm request stays editable above selected evidence; Demo guidance remains explicit.                                      |
| Map experience       |     9 | O: Added Arabic Palm naming helps orientation, but native repetition and omitted mobile supplementary Saadiyat naming limit completeness. |
| Visual craft         |   9.5 | M/E: Compact evidence now exposes amount, qualification and three fact rows while preserving the real composer.                           |
| Motion quality       |     9 | R: Current sampled movement is controlled; the desktop Home outlier and device limits remain disclosed.                                   |
| Arabic & RTL         |     9 | M/E/O: Arabic layout, connected labels and mixed-currency editing are visibly coherent; this is not native-Gulf approval.                 |
| Trust & evidence     |   9.5 | M: Original 35,300,000 AED, fictional-project status and missing-date qualification remain plainly visible.                               |
| Discretion & privacy |     9 | M: Exploration remains discreet; screenshots do not imply an enquiry was sent or establish backend privacy alone.                         |
| Developer appeal     |     9 | O: Named neighbourhoods give source-backed projects more context without creating an endorsement or partnership.                          |
| Speed                |     8 | P: Latest available hosted Home/Explore evidence exceeds 2s and predates the current visual changes.                                      |
| Accessibility        |     9 | E: Stable source clicks, reachable short-height controls and keyboard restoration have focused evidence; full AT remains open.            |

**Mean 9.0417; minimum 8.** Visual craft rises from 9 to 9.5 for actual reading-space gain and stable interaction, not technical cleanliness. Other scores remain unchanged. The aggregate board owns the gate; Stage 2 completion is not implied.

## Three delights

1. **Facts are visible sooner.** [Arabic evidence checkpoint](../media/v9/signature-ar-evidence.png) now includes developer, completion and missing date beneath the original amount.

2. **Editing no longer moves the target.** E preserves the 96px composer while source notes open; the lost-click failure is retained, then specifically repaired.

3. **Names support the geography.** [Arabic Palm](../media/orientation-v1/ar-light-390-palm.png) gives the island an immediately readable local name.

## Three problems

1. **Speed:** P still misses the 2s budget. Pending current-source CI cannot supply a pass.

2. **Small reading window:** at 500px height with notes open, Arabic evidence has 96px of scrollable space. It is reachable, not spacious; a real phone keyboard remains untested.

3. **Language/orientation finish:** the Palm label repeats a native equivalent. Native Gulf review and real assistive-technology use remain necessary.

## Verdict

“The reading repair earns a visual-craft improvement; keep speed, small-screen tradeoffs and human validation explicit.”
