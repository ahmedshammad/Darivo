# Elena Rossi · selected C v4 re-review

This is a **simulated persona review of Stage 0 concept merit**, not a client interview, independent market research, native-language certification or production acceptance. The reviewing agent authored rejected Concept B but did not edit selected C. Scores below come from the revised C evidence and direct interaction, not from a requirement to reach the gate. Later-stage financial comparison, licensed schools, authenticated private inventory and production AI are not claimed complete.

## Evidence inspected

- Fresh `../media/v4/` captures: dark desktop Home 1440, Arabic light Home 1024, English dark Map 1024, Arabic light Map 390, plus the earlier v3 visual comparison. The complete v4 matrix contains Home/Map in both themes and languages at all three requested widths.
- Independently submitted the three client prompts in **EN and AR at 390×844**, expanded/collapsed the mobile sheet, and opened the location-specific source dialog. Results are in [`client-interactions-v4.json`](client-interactions-v4.json); six screenshots are `../media/v4/client-{persona}-{lang}-390.png`.
- In all six flows, selected points remain visible above the collapsed and expanded sheet. Collapsed target y ≈ 397.5–417.5; sheet top y490–508. Expanded target y ≈ 340.5–351.5; sheet top y390. Every viewport scrollWidth is 390. These are projected map-target coordinates measured against actual overlay rectangles, not merely map-center longitude/latitude.
- [`client-keyboard-v4.json`](client-keyboard-v4.json) records first focus on the skip link, Enter submission, keyboard sheet expansion, keyboard source-dialog opening, Escape close, and no camera movement after 100 ms in a reduced-motion Arabic mobile context.
- `../media/v4/quality.json`: 12 configurations, zero reported axe violations on Home/Map, no horizontal overflow, school priority matched throughout. The isolated local frame sample reports106 frames, median 16.6 ms, p95 17.5 ms, maximum 18.3 ms, zero frames above 50 ms. Local text LCP 52–152 ms and map-ready 1.28–3.58 s describe this desktop run; they do **not** prove throttled 4G LCP, physical-phone 60 fps or full WCAG conformance. The earlier v3 measurement overlap is not used for this score.
- Orla, SouthMED and Sei Saadiyat dialog data were compared with the supplied JSON. Price/currency, date, basis, coordinates and source URLs match. This proves faithful reference rendering, not independent verification of present market truth.

“I can orient myself immediately, and my school question no longer disappears. The next step is to turn that promising teaching state into a richer explanation.”

## Scorecard

| Criterion            |     C v4 |
| -------------------- | -------: |
| First-5-seconds wow  |      9.5 |
| Originality          |        9 |
| AI-first             |      8.5 |
| Map experience       |        9 |
| Visual craft         |      9.5 |
| Motion quality       |        9 |
| Arabic & RTL         |        9 |
| Trust & evidence     |      9.5 |
| Discretion & privacy |        9 |
| Developer appeal     |        9 |
| Speed                |      8.5 |
| Accessibility        |      8.5 |
| **Mean**             | **9.00** |

No criterion is below 8. Ratings are subjective concept judgments informed by the evidence above, not automated measurements or a certification. No 10s are assigned.

## Resolved from earlier iterations

The globe’s distracting country-label layer is gone during arrival. Mobile Map has meaningful visible geography and a keyboard-operable sheet. The EN/AR school prompt retains family and Dubai, sets the priority to “Schools to verify” / «التحقق من المدارس», and explicitly says real schools and travel times need verified evidence. It no longer substitutes waterfront preference. The exact original sentence, including British-school detail and two children, is retained even though the compact summary is broader.

## Three delights

1. “The globe makes the two markets understandable, then the map brings me into a recognizable coastline. It feels like a single spatial experience.” (`c-home-en-dark-1440.png`, `c-map-en-dark-1024.png`)
2. “The map remains visible on my phone while I read. Expanding and collapsing the reply does not hide the selected location.” Six mobile measurements and direct keyboard operation support this.
3. “The school response is honest: it heard the question and does not fabricate a nearby British school or a commute.” The original words and a clearly simulated interpretation make the concept’s limits inspectable.

## Three remaining problems

1. “The teaching state still offers more orientation than explanation. It recognizes my school question, but does not yet teach the differences between neighborhoods.” This keeps AI-first at8.5. The next design iteration should show a short, explicitly illustrative spatial lesson rather than only a careful disclaimer.
2. “The compact priority says ‘Schools to verify’; I must open my retained words to see ‘British’ and ‘two kids’.” Nothing is lost, but the brief could expose the meaningful qualifiers more directly.
3. “The small support type and the initial geographic load are less effortless than the main headline.” The observed 1.28–3.58 s map-readiness range is why speed is8.5, and visible mobile comfort plus limited assistive-technology testing keep accessibility at8.5.

## Verdict and gate

“This is a strong concept foundation: I know where I am and what you heard. Now make the city lesson as thoughtful as the arrival.”

**This persona’s Stage 0 concept score passes** the stated ≥ 9.0 mean / no criterion below 8 gate. This is a recommendation to develop the selected direction; it does not certify the other six persona reviews, the overall stage gate, native Gulf language quality, current external facts, or any production-stage requirement. Preserve the remaining issues in the next-stage design backlog.
