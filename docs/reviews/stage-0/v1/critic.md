# The Critic — simulated Stage 0 review, v1

This is an AI-authored persona review, not testimony from an Apple/Airbnb employee or an independent human reviewer. I judge the visible concept and demonstrated static interactions. Production performance, native-language authenticity and WCAG conformance cannot be inferred from attractive screenshots. All three concepts are now reviewed. C is the replacement globe direction in the `media/v2` captures; the rejected first C is excluded.

## Scorecard

| Criterion            | A: Noir Cinematic | B: Sand Editorial | C: Glass Atlas v2 |
| -------------------- | ----------------: | ----------------: | ----------------: |
| First-5-seconds wow  |                 9 |                 8 |                 9 |
| Originality          |                 8 |                 8 |                 9 |
| AI-first             |                 7 |                 8 |                 9 |
| Map experience       |                 7 |                 8 |                 7 |
| Visual craft         |                 8 |                 9 |                 8 |
| Motion quality       |                 7 |                 7 |                 8 |
| Arabic & RTL         |                 6 |                 8 |                 8 |
| Trust & evidence     |                 8 |                 8 |                 8 |
| Discretion & privacy |                 7 |                 8 |                 8 |
| Developer appeal     |                 8 |                 8 |                 8 |
| Speed                |                 7 |                 7 |                 7 |
| Accessibility        |                 6 |                 8 |                 7 |
| **Average**          |          **7.33** |          **7.92** |          **8.00** |

Motion and speed scores reflect an unfinished evidence package, not a diagnosis of poor frame rate. No claimed LCP or frame-rate measurement is supplied by the still images. A score below eight is a real unresolved review gate.

## A — Noir Cinematic

“At last, someone has stopped arranging property cards into rows. The first image has a point of view. But restraint is not permission to make the interface microscopic.”

### Three delights

1. [Desktop Home](../media/v1/a-home-en-dark-1440.png): the large serif line and uninterrupted coastline are a convincing arrival. Geography supplies the imagery; the typography supplies the emotion.
2. [Desktop Map](../media/v1/a-map-en-dark-1440.png): a conversation, one place, one dossier. The composition refuses to become a portal even after the first question.
3. [Light mobile Home](../media/v1/a-home-en-light-390.png): the sand palette is a real alternative, and the three-line English headline has an intentional editorial rhythm.

### Three problems

1. [Arabic mobile Home](../media/v1/a-home-ar-dark-390.png): “Palm Jumeirah” remains English in the selected-location caption despite surrounding Arabic. This is an authored UI field, not a missing external tile translation. Arabic cannot pass while this survives.
2. [Desktop Map](../media/v1/a-map-en-dark-1440.png): coordinates, the glowing column and several tile labels collide over the Palm. The object the client should understand first is the hardest part to read. On mobile the legal attribution also overlaps the decorative footer line.
3. [Arabic tablet Map](../media/v1/a-map-ar-light-1024.png): the heading becomes a very tall stack, while small metadata, controls and evidence notes remain tiny. The microphone and closer-look action are explanatory placeholders; the beautiful shell still stops before a useful product decision.

**Verdict:** “The strongest opening, but it needs to grow from a mood into an accessible instrument.”

## B — Sand Editorial

“This one knows how to edit. A journal is a more useful reference than a luxury brochure, because it assumes I am here to learn something.”

### Three delights

1. [Desktop Home](../media/concept-b-v1-home-1440.png): the distinct paper column and framed atlas give the design a different structure from A. The composer sits naturally in the editorial argument.
2. [Desktop Map](../media/v1/b-map-en-light-1440.png): two explicitly fictional selections, visible demo price badges, a reason and a trade-off are a clear decision aid. The map retains most of the screen.
3. [Arabic tablet Home](../media/v1/b-home-ar-light-1024.png): the independent Arabic title, right-hand reading column and left-hand atlas feel composed rather than mechanically mirrored.

### Three problems

1. [Desktop Map](../media/v1/b-map-en-light-1440.png): the lower “A different point of view” cover story persists in the working atlas and competes with the actual selection. Editorial introduction should yield to task information once the user starts working.
2. [Desktop Home](../media/concept-b-v1-home-1440.png): the huge unoccupied space between introduction and composer weakens the conversational priority. The question could feel like an invitation rather than the caption to a finished magazine spread.
3. [Arabic tablet Home](../media/v1/b-home-ar-light-1024.png): some map names remain English, and the small uppercase field-note treatment does not translate into an equally strong Arabic evidence hierarchy. Native editorial-font and language review still matter; a passed axe check would not resolve those issues.

**Verdict:** “The most coherent working direction so far; give its map less marketing and its conversation more presence.”

Mobile evidence addendum: [390px Home](../media/v1/b-home-en-light-390.png) places the geography almost entirely below the first viewport and shows an “Open your selection” sheet handle above the editorial title. This is a concrete weakness against the map-led arrival principle, even though the type itself wraps cleanly. [Arabic mobile Map](../media/v1/b-map-ar-dark-390.png) provides a more useful compact sheet, but the selected geographic subject is partly covered. These observations reinforce the eight for map direction rather than justify a higher score.

## C — Glass Atlas, replacement v2

“This is the first direction that explains the two-market proposition before I read it. The globe is an idea, not just a background. Now edit it as ruthlessly as you edited the prose.”

### Three delights

1. [Arabic tablet Home](../media/v2/c-home-ar-dark-1024.png): the actual globe with two market plates makes UAE and Egypt feel like one private office. It is structurally distinct from both the noir coastline and the framed journal.
2. [Desktop Map](../media/v2/c-map-en-dark-1440.png): the question, simulated response and editable Brief occupy three clearly related zones. The UI expresses how conversation changes selection instead of merely placing an input beside a map.
3. [Light mobile Home](../media/v2/c-home-en-light-390.png): both regions and the composer fit into the first screen. The same narrative survives the smaller format without introducing a property grid.

### Three problems

1. [Arabic tablet Home](../media/v2/c-home-ar-dark-1024.png) and [light mobile Home](../media/v2/c-home-en-light-390.png): country labels run directly behind the headline and its supporting sentence. The globe currently supplies more text noise than geographic understanding. Suppress nonessential country labels at arrival and keep the two market anchors.
2. [Arabic mobile Map](../media/v2/c-map-ar-light-390.png): the Brief and response sheet consume most of the view, leaving the actual Palm nearly hidden. Only Dubai and Saadiyat controls are visible; the cross-market North Coast action disappears at the breakpoint. This damages the very proposition the globe establishes.
3. [Desktop Map](../media/v2/c-map-en-dark-1440.png): “Waterfront setting · family focus” repeats across all three residences. The recommendations have no distinct reason or trade-off, so the conversational intelligence is visually stronger than the selection intelligence. The lower attribution also needs a more legible treatment than grey on dark glass.

**Verdict:** “The most promising product idea; quiet the globe and give the mobile map its territory back.”

## Direction recommendation after all three

Choose **C's globe arrival** as the organising idea, with **A's single selected-place dossier** as the map selection treatment. Keep C's editable Brief, but collapse it on mobile and reveal it explicitly. Borrow B's plain-language reason/trade-off hierarchy rather than its entire journal layout. This is a specific synthesis, not permission to stack three concepts on one screen.

The next iteration must fix label density, preserve all three destinations on mobile, give each fictional option a distinct reason and limitation, and show the selected place without burying it under panels. A's initial Arabic caption and footer collision remain v1 defects in the record, even if that composition is not selected. No v1 concept meets the required stage gate.
