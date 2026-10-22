# Sheikha Al-Mansoori · Stage 3 second review

This is a **simulated contributor self-audit**, not a client interview, native Gulf reader's approval or independent endorsement. I contributed the bilingual parser, privacy extraction and evaluation runners, plus earlier Arrival work. Familiarity with that implementation can bias judgment. This review covers Stage 3; unfinished Stage 4–6 services are not scored as delivered.

## Evidence and journey

Production source **210f413** is represented by the completed [v5 matrix](../media/v5/manifest.json): 60 states across EN/AR, both themes and 390/1024/1440 widths, with zero recorded page errors, overflow or axe violations. Six recordings, 18 supplemental checkpoints, eight settled-map probes and four requirements diagnostics are available. I inspected representative stills and signature checkpoints across those configurations; I did not operate a browser or watch every recording frame. Earlier failed reviews remain intact.

_Simulated perspective: “I prefer an honest evidence gap to a confident recommendation for the wrong island. Let me decide whether an unverified preference is acceptable, and keep the place itself readable.”_

The [Arabic mobile original response](../media/v5/sheikha-ar-light-390.png) now explains the missing beachfront evidence, retains my areas and offers a visible requirements action. It returns **no verified match**. In the [requirements checkpoint](../media/v5/sheikha-ar-requirements.png), the client explicitly changes the evidence requirement. Only afterward does [the refined response](../media/v5/sheikha-refined-ar-light-390.png) present Marsa Al Saadiyat. The [tablet evidence](../media/v5/sheikha-refined-en-light-1024.png) states that beachfront remains unverified. This is a useful recovery, **not a match to the original strict request**.

The map remains a material weakness. The [settled Arabic mobile map](../media/v5/settled/sheikha-ar-390.png) shows columns on a flat dark field, without useful coastline. Its [diagnostic manifest](../media/v5/settled/manifest.json) reports tiles ready at zoom 12. The requirements diagnostic also retains cropped framing and a large black lower region; recorded outer scroll is zero, so the underlying cause is not established here.

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                |
| -------------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |   8.5 | Restrained Arabic entry and compact response hierarchy are attractive; the flat map weakens the cinematic promise.                      |
| Originality          |     9 | Conversation, editable requirements and geographic evidence retain a distinctive private-office identity.                               |
| AI-first             |   8.5 | Honest no-match leads to an explicit client-controlled refinement; the app no longer substitutes Jebel Ali for the requested geography. |
| Map experience       |   6.5 | Settled local probe lacks readable land/water geometry despite ready signals; a beachfront decision needs this context.                 |
| Visual craft         |     8 | Mobile reading hierarchy improves, but flat geography and cropped requirements checkpoints interrupt the otherwise composed layout.     |
| Motion quality       |     8 | Signature checkpoints show purposeful camera/sheet states; current continuous cadence and physical-device smoothness are unverified.    |
| Arabic & RTL         |   8.5 | Recovery copy and requirements read coherently in RTL; long English source wording remains prominent. No native-reader certification.   |
| Trust & evidence     |     9 | No-match, explicit relaxation and unverified-beachfront qualification remain distinct; source date and unknown price are visible.       |
| Discretion & privacy |     9 | Guest persistence disclosure and restrictive processing/confirmation boundaries remain credible within tested scope.                    |
| Developer appeal     |   8.5 | Sourced project identity and reasons improve qualified discovery; missing map context undermines the premium presentation.              |
| Speed                |   8.5 | Current Lighthouse 99, LCP 2181.8ms, TBT 51ms, CLS 0: substantially faster, still above the strict 2s budget.                           |
| Accessibility        |   8.5 | The prior obscured-control axe failures are absent from 60 states; complete AT and recovery framing still need validation.              |

**Mean 8.3750; minimum 6.5. This review does not pass the stage gate.**

## Three delights

1. The original request receives an honest, conditional evidence-gap explanation rather than an out-of-area recommendation.
2. Relaxation belongs to the client; the refined card continues to disclose unverified beachfront evidence.
3. The shorter response hierarchy makes the next action and first project facts readable on mobile while preserving the composer.

## Three problems

1. **Local geography:** repair the settled flat-map state and verify visible coastline, not just renderer readiness flags.
2. **Recovery framing:** the [390px requirements diagnostic](../media/v5/settled/requirements-ar-390.png) loses surrounding navigation and leaves substantial unused black space. Establish the cause and preserve a stable visible editor/composer frame.
3. **Editorial Arabic:** retain exact source evidence, but reduce the visual dominance of long untranslated source descriptions and test the recovery language with a native Gulf reader.

The [validation record](../validation/README.md) reports 275 native tests, 412 execution cases/576 turns with all 13 counters zero, plus eight reading/recovery and nine public production regressions. These establish bounded implementation checks, not client acceptance or current market truth. [Current Lighthouse](/tmp/darivo-stage3-lighthouse-v5/concierge.json) scores 99/100/96/100. Prior source 496a3f7 hosted CI passed; **210f413 CI remains pending at review time**. Real-provider evaluation, native Arabic, physical phone/M1, field INP and full AT remain unproven.

**Verdict:** Keep the honest recovery and improved Arabic reading flow; repair local map visibility and editor framing before approval.
