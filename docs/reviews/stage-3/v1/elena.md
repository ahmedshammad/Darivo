# Elena Rossi — Stage 3 first review

**Simulated implementation self-audit, not a real client endorsement.** I contributed the Concierge UI, Brief editor, mini-map and earlier Atlas work. This review uses the current production `media/v2` captures, including sixteen inspected matrix images across EN/AR, Noir/Sand and 1440/1024/390 widths, plus sampled frames from all six signature recordings. I did not run another browser or continuously play the recordings. My contribution makes this an internal critique, not independent validation.

> “The map helps me locate the Palm. I still have to work too hard to find the explanation of Dubai that I asked for.”

## Journey inspected

1. **Enter — inviting:** [Sand desktop](../media/v2/arrival-en-light-1440.png) offers three understandable starting requests without requiring an account.
2. **Ask — weak response hierarchy:** [Elena desktop](../media/v2/elena-en-dark-1440.png) leads with generic records copy and repeated notices. [Phone](../media/v2/elena-en-light-390.png) exposes no neighbourhood teaching in the initial completed-response window.
3. **Inspect and act — useful after scrolling:** [06s Brief](../media/v2/review-frames/elena-en-06s.png) preserves my words; [08s preview](../media/v2/review-frames/elena-en-08s.png) names three places; [09s](../media/v2/review-frames/elena-en-09s.png) shows the main map at Palm Jumeirah.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                                                                                          |
| -------------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |   8.5 | The Sand desktop invitation and geographic setting feel considered; mobile reveals only the first suggested journey initially.                                                                                                    |
| Originality          |     9 | The editorial reading surface and active geography form a distinctive alternative to a listing grid.                                                                                                                              |
| AI-first             |   7.5 | The map responds, but the explanation request receives “available records” copy; repeated notices precede the actual teaching preview.                                                                                            |
| Map experience       |     8 | The 08–09s Elena frames connect named anchors to real geography. Fictional school points cannot teach actual school suitability.                                                                                                  |
| Visual craft         |   7.5 | [Arabic phone](../media/v2/elena-ar-dark-390.png) devotes most reading space to introductory material; the English empty prompt wraps awkwardly inside its compact height.                                                        |
| Motion quality       |   8.5 | Signature states demonstrate purposeful camera changes and a collapsed reading sheet. Sampled frames do not certify continuous cadence.                                                                                           |
| Arabic & RTL         |     8 | [Arabic tablet](../media/v2/elena-ar-light-1024.png) is deliberately composed, but it repeats the same generic response pattern. Native editorial and acoustic review remain absent.                                              |
| Trust & evidence     |     9 | The school disclaimer explicitly distinguishes fictional points, unknown curriculum/admissions and unverified family suitability. The preview discloses coarse regional geography.                                                |
| Discretion & privacy |     9 | Public exploration, editable privacy and consent boundaries are supported by focused checks; no forced enquiry appears in the inspected journey.                                                                                  |
| Developer appeal     |     8 | Restrained presentation and preserved source qualifications are credible, but buried useful content weakens the first response. Later-stage showcase features are outside this review.                                            |
| Speed                |     7 | [Fresh Concierge Lighthouse](/tmp/darivo-stage3-concierge-lighthouse-v1.json): performance 74, LCP 3252.7 ms, TBT 775.5 ms and CLS 0. This fails the strict loading target; field INP and physical-device evidence remain absent. |
| Accessibility        |   7.5 | The [matrix](../media/v2/manifest.json) reports serious target-size failures in all sixteen phone states: the sheet partly obscures zoom-out. Keyboard regressions do not erase that pointer defect.                              |

**Mean 8.1250; minimum 7.** The board aggregate is the overall mean gate; these sub-8 findings also require repair.

## Three delights

1. My words survive in an editable Brief rather than becoming hidden filter assumptions.
2. Named mini-map buttons lead to the same main map; the [Arabic 08s frame](../media/v2/review-frames/elena-ar-08s.png) leaves the chosen place visible after collapsing the sheet.
3. The system refuses to turn demonstration schools into a family recommendation. That honesty matters more than a confident invented answer.

## Three problems

1. **Teach before repeating caveats.** Consolidate the school limitation once and lead with the three-place orientation; retain the full evidence in readable supporting detail.
2. **Recover phone reading space.** Retire the large introductory block after the first request and make the substantive response discoverable without scrolling past my own prompt and a generic paragraph.
3. **Keep map controls reachable.** Reserve space for the full zoom group or move it into the usable map aperture; test the actual exposed target, not merely its CSS dimensions.

The [validation checkpoint](../validation/README.md) records 251 native tests, 388 authorized execution cases/548 turns with thirteen zero counters, and 66/67 full development browser cases followed by two focused legacy passes. The real provider is untested. Production matrix errors/overflow are zero, but axe is not clean. The fresh Lighthouse accessibility score of 100 does not override the sixteen state-specific target failures. Current-source CI also failed its Production Lighthouse step; no green CI is claimed. Native Arabic speech, language autodetection, full AT and physical-device checks remain open.

**Verdict: Revise before passing—the teaching exists, but the initial response hides it and mobile map controls are partly blocked.**
