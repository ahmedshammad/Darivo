# Elena Rossi — Stage 2 seventh review

**Simulated implementation self-audit, not an independent client interview.** This reviewer contributed the map renderer, design system and performance/provider repairs, and audited the latest orientation labels. Scope is Stage 2 discovery, not verified school advice or a completed concierge service. Earlier reviews remain intact.

I inspected twelve current production/focused stills, including the linked checkpoints below, plus eight orientation-v1 images. The [EN](../media/v9/signature-en.webm) and [AR](../media/v9/signature-ar.webm) recordings are retained; I reviewed checkpoint stills, not full playback. No browser was run for this review.

The [24-layout matrix](../media/v9/manifest.json) and [eight fallback states](../media/v9/fallback-manifest.json) report zero errors, axe violations and overflow. The parent reports six production reading/orientation tests, 67 native unit tests and 36 mock evaluations passing. The full local browser run was **55/56**, with a cold authentication wait failure; a focused fifteen-case run plus the staff case subsequently passed. That is not a clean rerun of the entire suite. CI runs `39824920382` and `39824917165` for pushed source `c5033b8` remain pending and receive no credit.

> “I can now connect a project column to a neighbourhood name, then read the facts without losing my family brief. The school layer still needs to be understood as an illustration.”

## Scorecard

| Criterion            | Score | Evidence                                                                                                                                                    |
| -------------------- | ----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-5-seconds wow  |     9 | [Desktop Arrival](../media/v9/arrival-en-dark-1440-viewport.png) offers a calm globe and an immediately identifiable conversational action.                 |
| Originality          |     9 | [Arabic tablet Arrival](../media/v9/arrival-ar-light-1024-viewport.png) preserves an editorial geographic identity rather than a listing grid.              |
| AI-first             |     9 | [Layers checkpoint](../media/v9/signature-en-layers.png) retains the brief while offering relevant spatial controls; guidance is explicitly Demo.           |
| Map experience       |     9 | [Sand tablet Explore](../media/v9/explore-en-light-1024.png) now names Palm, Jumeirah Bay and Dubai Hills near the columns, improving newcomer orientation. |
| Visual craft         |     9 | [Mobile evidence](../media/v9/signature-en-evidence.png) gives price and qualification room while keeping the composer available.                           |
| Motion quality       |     9 | [Fresh M3 measurements](../media/performance-v9/performance.json) support controlled camera motion in four bounded probes, not universal smoothness.        |
| Arabic & RTL         |     9 | [Arabic evidence](../media/v9/signature-ar-evidence.png) and mixed-script editing are deliberately arranged; native Gulf review remains absent.             |
| Trust & evidence     |   9.5 | The layers checkpoint explicitly calls school points fictional and the reach circle approximate, excluding road routing, traffic and accessibility data.    |
| Discretion & privacy |     9 | The inspected journey permits exploration without a forced enquiry; these screenshots are not a storage/privacy audit.                                      |
| Developer appeal     |     9 | The tablet reference card balances prominent presentation with listing basis, date and current-terms qualification.                                         |
| Speed                |     8 | Prior hosted Home/Explore scores are 98/98, but LCP 2233.1/2219.2 ms misses the strict target and predates the labels.                                      |
| Accessibility        |     9 | Current clean automated captures and focused interaction passes support access; physical-phone and full native AT journeys remain unproven.                 |

**Mean 8.9583; minimum 8.** Map experience rises from 8.5 to 9 for visible geographic teaching, not additional test counts. Other scores stay unchanged. The gate uses the board aggregate, not an individual mean.

## Three delights

1. **Recognisable geography.** Added names make the coast easier to interpret. The [orientation evidence](../media/orientation-v1/README.md) records actual rendered features rather than relying only on planned rectangles.
2. **The brief remains mine.** [Arabic editing](../media/evidence-reading-v4/ar-dark-390-editing.png) preserves multiline mixed-script input while enlarging the same composer.
3. **Facts get reading space.** Resting mobile evidence has about 492–493px of reading height; the compact composer leaves the amount, Demo qualification and missing-date disclosure visible.

## Three problems / limits

1. **Orientation is uneven.** Mobile Saadiyat omits the added label and relies on native geography. Palm can show duplicate native/added names. Regional fallback lacks the detailed neighbourhood teaching of WebGL.
2. **Short-screen reading still requires effort.** [500px Arabic sources](../media/evidence-reading-v4/ar-light-390-short-sources.png) preserves reachability, but leaves only 96px for evidence while source notes scroll separately. A resized desktop viewport is not a real keyboard test.
3. **Ordinary-device confidence remains open.** Fresh M3 moving medians are 16.4–16.7ms, p95 17.3–19.8ms, with no moving intervals over 33.34ms; one desktop-Arrival RAF window has an outlier. These three-second probes establish neither physical-phone/M1 performance nor field INP. Native Gulf and full AT validation are also missing.

**Verdict:** The map now teaches places more clearly and the evidence is easier to read, while strict speed and real-device validation remain open.
