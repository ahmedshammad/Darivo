# Sheikha Al-Mansoori · Stage 3 first review

This is a **simulated self-audit**, not a client interview, native Gulf reader's approval or independent endorsement. I contributed the bilingual parser, privacy extraction and evaluation runners, as well as earlier Arrival work. I am judging the visible Concierge and its required journey, not unfinished Stage 4–6 services. Implementation involvement limits independence; passing my own tests does not establish a satisfying experience.

## Evidence and journey

The completed production [v2 manifest](../media/v2/manifest.json) contains 48 states across English/Arabic, light/dark and 390/1024/1440 widths. It records zero page errors and overflow, but **16 mobile states have serious target-size findings** for the partly obscured zoom-out control. The failed preflight folder v1 is excluded. I inspected representative screenshots covering every language, theme and width, plus sampled frames from both Sheikha recordings; I did not operate a browser or inspect every video frame.

1. **Enter the conversation — visually strong.** [Arabic desktop arrival](../media/v2/arrival-ar-dark-1440.png) gives the prompt a composed typographic setting and a visible map.
2. **Request a beachfront villa — materially unreliable.** [Arabic desktop response](../media/v2/sheikha-ar-dark-1440.png) leads with Palm Jebel Ali while the request names Saadiyat or the Palm and the camera shows Saadiyat.
3. **Read and locate the answer — reachable, with friction.** [Arabic mobile response](../media/v2/sheikha-ar-dark-390.png) has no property facts above the fold. At approximately 8 seconds of [the Arabic recording](../media/v2/sheikha-ar.webm), scrolling reveals the card; the [10-second frame](../media/v2/review-frames/sheikha-ar-10s.png) then locates Jebel Ali correctly. That later accuracy does not repair the initial interpretation.

The [validation checkpoint](../validation/README.md) reports 251 native tests, 91 parser cases and 388 authorized execution cases/548 turns with all 13 counters zero. The full browser run had one legacy failure, then a focused repaired rerun. Current-source hosted CI, real-provider evaluation, native Gulf speech/editorial review, physical-phone/M1 performance and full assistive-technology validation are not established here. The production Lighthouse supplement below supersedes the initially unverified LCP assessment; field INP and current 60fps evidence remain unproven.

_Simulated perspective: I would welcome the calm Arabic front door, but I should not have to discover that “the Palm” has become a different island. Discretion also means respecting the precision of my request._

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                               |
| -------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| First-5-seconds wow  |   8.5 | Arabic arrival has strong type and restraint; the mobile response quickly loses that clarity.                                                          |
| Originality          |     9 | The conversation beside geographical evidence remains distinct from a conventional listing portal.                                                     |
| AI-first             |     7 | The required request produces a geographically questionable leading recommendation rather than an explicit clarification.                              |
| Map experience       |   7.5 | Initial Saadiyat camera and Jebel Ali card disagree; the later explicit map action works.                                                              |
| Visual craft         |   8.5 | Balanced desktop composition; mobile introduction consumes the answer area and English placeholder text clips.                                         |
| Motion quality       |     8 | Sampled recording checkpoints show purposeful map changes; cadence and continuous smoothness are unverified.                                           |
| Arabic & RTL         |     8 | Arabic heading and controls read coherently; the long English collection description dominates the Arabic result. No native-reader claim.              |
| Trust & evidence     |     8 | Original AED amount, source link, date and availability caveat are visible; sourced facts alone do not prove a requested-location match.               |
| Discretion & privacy |     9 | Guest-storage disclosure and tested no-sharing/processing restrictions are credible, bounded safeguards; no sales pressure is visible.                 |
| Developer appeal     |   8.5 | Generous project presentation and published attribution help, but recommending the wrong geography weakens qualified discovery.                        |
| Speed                |     7 | Current production mobile Lighthouse: performance 74, LCP 3252.7ms and TBT 775.5ms. LCP materially exceeds the strict 2s budget; TBT is not field INP. |
| Accessibility        |     7 | All 16 mobile matrix states expose a serious obscured-target finding; screenshots cannot certify keyboard/screen-reader completeness.                  |

**Mean 8.0000; minimum 7. This review does not pass the stage gate.**

## Three delights

1. Arabic gets a deliberate reading direction and expressive headline, rather than a mirrored English form.
2. Original prices and “current terms require confirmation” remain visible without invented availability.
3. The explicit map action reaches the selected project and keeps the composer available in the collapsed mobile sheet.

## Three problems

1. **Location fidelity:** distinguish Palm Jumeirah from Jebel Ali before ranking. Clarify ambiguity or disclose an out-of-area alternative before presenting it as the leading answer.
2. **Answer hierarchy:** after a response, reduce repeated introductory material and surface the first useful fact without hiding or remounting the composer. The 390px response currently shows only setup copy.
3. **Obscured controls:** hide or relocate map controls when the expanded sheet covers them. A 44px control with only 5.5px exposed is not an accessible target.

**Verdict:** Keep the private-office language and visual direction; repair geographical fidelity and mobile answer/control visibility before approval.

## Production performance supplement

The current [mobile production Lighthouse report](/tmp/darivo-stage3-concierge-lighthouse-v1.json) for `/en/concierge` records **performance 74, LCP 3252.7ms, TBT 775.5ms and CLS 0**; accessibility is 100, best practices 96 and SEO 100. Speed therefore falls from 8 to **7** for the measured LCP miss and substantial lab main-thread blocking, not to influence the board average. The original unmeasured-speed basis is superseded.

Lighthouse's accessibility score covers its audited state and does not erase the 16 expanded-mobile target-size failures in the matrix; Accessibility remains 7. This is a local production lab result, not physical-phone/M1, field-INP or native-Arabic certification. No other score changes.
