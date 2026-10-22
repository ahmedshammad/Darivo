# Elena Rossi · simulated review

These are **simulated persona perspectives**, not interviews or external endorsements. The reviewing agent also authored Concept B; this is disclosed design analysis, not an independent panel. Arabic observations identify visible layout/copy issues and do not certify native Gulf quality. Scores assess **Stage 0 concept merit and demonstrated interaction**, not delivery of later production features. Target-device LCP/INP/frame rate, actual privacy enforcement and screen-reader conformance remain unverified. Missing later-stage payment, verification or sourcing systems are recorded as questions for the design, not automatic implementation-failure penalties.

Evidence inspected: `media/v1/a-home-en-dark-1440.png`, `a-map-en-light-1440.png`, `a-home-ar-dark-1024.png`, `a-map-ar-light-390.png`, `a-home-en-dark-390.png`, `b-home-ar-light-1440.png`, `b-map-en-dark-1024.png`, `b-home-en-dark-390.png`, and `b-map-ar-light-390.png`. Paths are relative to `docs/reviews/stage-0`. A/B were also exercised in Chrome with Karim’s mixed-market prompt: both moved toward the North Coast; neither demonstrated the comparison. B’s local save flow was tested.

“I know architecture; I do not know Dubai. Help me build a mental map before asking me to choose a home.”

## Scorecard — v1

| Criterion            | A · Noir Cinematic | B · Sand Editorial | C · Glass Atlas v2 |
| -------------------- | -----------------: | -----------------: | -----------------: |
| First-5-seconds wow  |                  9 |                8.5 |                9.5 |
| Originality          |                8.5 |                8.5 |                  9 |
| AI-first             |                  7 |                  8 |                7.5 |
| Map experience       |                7.5 |                7.5 |                  8 |
| Visual craft         |                8.5 |                  8 |                7.5 |
| Motion quality       |                  8 |                7.5 |                  8 |
| Arabic & RTL         |                  7 |                7.5 |                  7 |
| Trust & evidence     |                  8 |                8.5 |                8.5 |
| Discretion & privacy |                  8 |                8.5 |                8.5 |
| Developer appeal     |                8.5 |                8.5 |                8.5 |
| Speed                |                  8 |                  8 |                  8 |
| Accessibility        |                  7 |                  8 |                7.5 |
| **Mean**             |           **7.92** |           **8.08** |           **8.12** |

Motion and speed scores reflect the concept’s observed responsiveness and camera behavior on this reviewer’s desktop. They are not 60 fps, LCP or phone-performance measurements. Accessibility combines visible control clarity with available concept checks, not a WCAG conformance certification.

## Concept A — Noir Cinematic

### Three delights

1. “The full canvas says that geography matters. The Palm is recognizable before I understand any neighborhood name.” (`a-home-en-dark-1440`)
2. “The arrival and map views share the same surface. It feels like a conversation opening up, rather than being sent to a search page.” Both captured states and the exercised transition support this.
3. “The first card gives a reason and a compromise. I can start asking better questions.” (`a-map-en-light-1440`)

### Three problems

1. “Many labels compete under the hero, but I am not told what differentiates the neighborhoods.” The map is atmospheric; it is not yet a strong teaching composition. Stage 0 can demonstrate that hierarchy with a small number of annotated places.
2. “The mobile dossier covers the place I am trying to learn about.” (`a-map-ar-light-390`) The design needs a real collapsed spatial state, not just a smaller desktop card.
3. “The beautiful headline partially crosses the Palm marker and labels. I look at the words first, then struggle to separate the geography.” (`a-home-en-dark-1440`) This is an art-direction trade-off that should be refined.

**Verdict:** “This is the strongest immediate arrival, but the next moment must teach me something specific about the city.”

## Concept B — Sand Editorial

### Three delights

1. “The light version feels like an architecture publication, not a property marketplace.” The desktop cover gives type and geography distinct, deliberate roles.
2. “I understand the interaction: describe a life, arrive at a place, inspect two possibilities, keep one.” Chrome exercised the sequence.
3. “The quiet recommendation text and small Demo badges make the concept’s limits visible.” (`b-map-en-dark-1024`)

### Three problems

1. “The mobile Home postpones the map until below the first screen. I came to understand a place; the title is taking too much space.” (`b-home-en-dark-390`)
2. “On mobile Explore, a large empty sea sits above the sheet while the selected coast hides behind it.” (`b-map-ar-light-390`) This is a camera-layout issue, not a reason to remove the sheet.
3. “The atlas tells me names but does not yet explain the differences between them. Give the concept one short, spatial neighborhood lesson.” This is a direction for the next concept iteration; production school or lifestyle datasets are not required to demonstrate the teaching pattern.

**Verdict:** “This is the most legible product idea, but I would borrow A’s immediate immersion and make the atlas more educational.”

## Concept C — Glass Atlas, revised globe arrival v2

This first comparison uses A/B capture set v1 and C capture set v2. The C redesign was supplied during the review; no claim is made that these are the same source revision. Additional evidence inspected: `media/v2/c-home-en-dark-1440.png`, `c-home-ar-dark-390.png`, `c-home-ar-light-1024.png`, `c-map-en-light-1440.png`, and `c-map-ar-light-390.png`. Elena’s teaching prompt was exercised in Chrome. The country label overlap and mobile panel coverage are visible, not speculative.

### Three delights

1. “The globe immediately tells me where the two markets sit. That is useful orientation, not just decoration.” (`media/v2/c-home-en-dark-1440.png`)
2. “My ‘Explain Dubai neighbourhoods’ request changes the heading to ‘Let’s read the city together’ and flies into Dubai.” Chrome observed the new teaching state and center near `[55.16, 25.10]`.
3. “On desktop the selected place and short brief sit apart, leaving a large navigable area between them.” (`media/v2/c-map-en-light-1440.png`)

### Three problems

1. “The teaching heading is promising, but the content still gives three generic waterfront-family choices. My British-school question has become ‘Close to the water’ in the brief.” Chrome verified this mismatch. Even a static design study can retain the actual question and demonstrate one spatial explanation.
2. “The globe is cluttered exactly where the opening headline sits. It feels less considered than the restrained rest of the interface.” (`media/v2/c-home-en-dark-1440.png`)
3. “On mobile, panels dominate and the useful geography is hidden. The desktop mental map does not survive the move to my phone.” (`media/v2/c-map-ar-light-390.png`)

**Verdict:** “This globe earns my attention fastest, but the next screen should explain the city rather than merely rename the recommendation panel.”

## Gate result

**Not passed.** The concept scores contain criteria below 8 and no concept reaches a 9.0 average for this persona. Do not proceed on a claim that this review passed. Select a direction, repair the visible composition and interaction mismatches, then capture and re-review the new version. This is useful concept evidence, not an independent user-research result.
