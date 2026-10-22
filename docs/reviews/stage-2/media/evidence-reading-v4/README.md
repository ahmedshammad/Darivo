# Mobile evidence reading — final production inspection

Production source `c5033b8`, reported by the parent. This is a simulated implementation self-audit: the reviewer contributed the composer and short-height repairs. The parent produced these captures; this review opened eight representative images and read [checks.json](checks.json) and [capture.mjs](capture.mjs). No new browser session, source edit, build or server run was performed for this inspection. This is evidence documentation, not a scored Stage 2 approval.

## Capture coverage and measured geometry

Eight cases cover EN/AR × dark/light × 375/390px widths. Each has four screenshots: rest, editing, 500px-high viewport, and 500px-high viewport with source notes open (32 screenshots total). Normal viewport height is 844px. The capture deliberately selects the regional fallback using `fallback=1`; it does not establish real software-GPU detection or local WebGL geography.

All eight cases report zero page errors and no horizontal document overflow in all four states. Both short states end the reading pane at **y=500**, fixing the earlier y=550 root-height spill.

| State                                 | Viewport height | Composer height | EN reading height | AR reading height | Reading bottom |
| ------------------------------------- | --------------: | --------------: | ----------------: | ----------------: | -------------: |
| Selected evidence, resting            |           844px |            52px |          493.25px |          491.75px |          844px |
| Editing the same brief                |           844px |            96px |          449.25px |          447.75px |          844px |
| Editing, short viewport               |           500px |            96px |           177.5px |             176px |          500px |
| Editing, short viewport, sources open |           500px |            96px |            97.5px |              96px |          500px |

These values are identical across the two captured widths and themes within each language. The source-notes region is capped at 80px at this height and remains scrollable; the full disclosure is **not** simultaneously visible. With notes open, the project title begins around y=489.5 (EN) or y=494 (AR), so reading the facts requires scrolling the evidence pane. The improvement is preserved reachability and stable controls, not a claim that all facts fit above the fold.

## Images inspected

| Image                                                             | Observation                                                                                                                                             |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Arabic dark 390, rest](ar-dark-390-rest.png)                     | Compact brief remains directly editable; price, Demo disclaimer, developer, completion and missing-date qualification fit in the visible evidence pane. |
| [Arabic light 375, editing](ar-light-375-editing.png)             | Multiline Arabic/mixed-currency brief expands within the same composer; Back and evidence remain separate and legible.                                  |
| [Arabic dark 375, short](ar-dark-375-short-viewport.png)          | Sheet handle is clear; the map toolbar yields, and the evidence pane ends at the viewport edge.                                                         |
| [Arabic light 390, short sources](ar-light-390-short-sources.png) | Disclosure is visibly open while the 96px composer remains expanded. Source notes and evidence each have constrained reading space.                     |
| [English light 375, rest](en-light-375-rest.png)                  | Original 35,300,000 AED, fictional-project qualification and fact rows remain visible. The repeated introduction no longer consumes the reading area.   |
| [English dark 390, editing](en-dark-390-editing.png)              | The longer brief uses multiline editing; original amount and disclaimer remain readable below it.                                                       |
| [English light 390, short](en-light-390-short-viewport.png)       | Handle and composer are unobstructed; the short reading area shows Back and the project title without an outer-page height spill.                       |
| [English dark 375, short sources](en-dark-375-short-sources.png)  | The minus indicator and visible notes confirm an open disclosure; text extends beyond its small scroll window, as expected.                             |

## Interaction evidence and preserved failures

The retained capture script pointer-clicks the source summary after editing, asserts the native details element is open, and records the expanded composer and remaining reading area. It also performs a sheet-handle pointer trial and asserts the map toolbar is hidden at short height. All eight result objects are present.

The parent reports **six production reading/orientation tests passed**, including the stable-pointer regression and short-height handle trial. The focused [reading test](../../../../../e2e/atlas-evidence-reading.spec.ts) checks actual summary coordinates while the textarea is focused, brief/textarea preservation, keyboard scrolling and Tab escape from notes, final evidence-action visibility/focus, Back restoration, and compact reset on submit/reselection. These tests were not rerun by this reviewer. The capture JSON itself does not contain every keyboard assertion or establish orientation-layer correctness.

Earlier [v1](../evidence-reading-v1/), [v2](../evidence-reading-v2/) and [v3](../evidence-reading-v3/) evidence is preserved. Their failures included the short root-height spill, a lost source click when blur shrank the composer during the pointer sequence, and the map toolbar obstructing the short-height sheet handle. Final captures show open notes and clear handles; no earlier failure was replaced with these files.

## Remaining limits

- A 500px browser viewport is not a physical on-screen keyboard. Actual mobile browser/keyboard resizing, safe areas and touch behavior still need device validation.
- The 96–97.5px evidence window with notes open is usable through scrolling but remains constrained. It should not be described as a spacious simultaneous reading layout.
- These screenshots do not certify full screen-reader behavior, text enlargement, native Gulf register, physical phones/M1, field INP or the two-second LCP target. They are not a new performance run or a fresh axe audit.
- Full media/v9 review, current cadence and hosted CI must be evaluated separately when their evidence is complete; no pending result is credited here.
