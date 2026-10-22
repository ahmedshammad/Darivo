# Karim Hassan · selected C v4 re-review

This is a **simulated persona review of Stage 0 concept merit**, not a client interview, independent market research, native-language certification or production acceptance. The reviewing agent authored rejected Concept B but did not edit selected C. Scores below come from the revised C evidence and direct interaction, not from a requirement to reach the gate. Later-stage financial comparison, licensed schools, authenticated private inventory and production AI are not claimed complete.

## Evidence inspected

- Fresh `../media/v4/` captures: dark desktop Home 1440, Arabic light Home 1024, English dark Map 1024, Arabic light Map 390, plus the earlier v3 visual comparison. The complete v4 matrix contains Home/Map in both themes and languages at all three requested widths.
- Independently submitted the three client prompts in **EN and AR at 390×844**, expanded/collapsed the mobile sheet, and opened the location-specific source dialog. Results are in [`client-interactions-v4.json`](client-interactions-v4.json); six screenshots are `../media/v4/client-{persona}-{lang}-390.png`.
- In all six flows, selected points remain visible above the collapsed and expanded sheet. Collapsed target y ≈ 397.5–417.5; sheet top y490–508. Expanded target y ≈ 340.5–351.5; sheet top y390. Every viewport scrollWidth is 390. These are projected map-target coordinates measured against actual overlay rectangles, not merely map-center longitude/latitude.
- [`client-keyboard-v4.json`](client-keyboard-v4.json) records first focus on the skip link, Enter submission, keyboard sheet expansion, keyboard source-dialog opening, Escape close, and no camera movement after 100 ms in a reduced-motion Arabic mobile context.
- `../media/v4/quality.json`: 12 configurations, zero reported axe violations on Home/Map, no horizontal overflow, school priority matched throughout. The isolated local frame sample reports106 frames, median 16.6 ms, p95 17.5 ms, maximum 18.3 ms, zero frames above 50 ms. Local text LCP 52–152 ms and map-ready 1.28–3.58 s describe this desktop run; they do **not** prove throttled 4G LCP, physical-phone 60 fps or full WCAG conformance. The earlier v3 measurement overlap is not used for this score.
- Orla, SouthMED and Sei Saadiyat dialog data were compared with the supplied JSON. Price/currency, date, basis, coordinates and source URLs match. This proves faithful reference rendering, not independent verification of present market truth.

“This now feels like one office for my two decisions. It remembers the summer home, the investment and the year without pretending it has already compared real offers.”

## Scorecard

| Criterion            |     C v4 |
| -------------------- | -------: |
| First-5-seconds wow  |      9.5 |
| Originality          |        9 |
| AI-first             |        9 |
| Map experience       |        9 |
| Visual craft         |      9.5 |
| Motion quality       |        9 |
| Arabic & RTL         |        9 |
| Trust & evidence     |      9.5 |
| Discretion & privacy |        9 |
| Developer appeal     |        9 |
| Speed                |      8.5 |
| Accessibility        |      8.5 |
| **Mean**             | **9.04** |

No criterion is below 8. Ratings are subjective concept judgments informed by the evidence above, not automated measurements or a certification. No 10s are assigned.

## Resolved from earlier iterations

The EN/AR request now creates both purposes (“Summer home · Investment”), both places (“North Coast · Dubai”) and requested 2028, including normalization of Arabic-Indic ٢٠٢٨. The response explicitly retains both places while beginning with Egypt and says the concept has not compared real listings. That resolves the earlier silent narrowing. SouthMED’s geographic reference uses EGP 91.2M, press-report basis and as-of 2026, faithfully reflecting the supplied record; no fake conversion is presented.

## Three delights

1. “Both shores are equal in the opening composition. I do not have to abandon one market to start talking about the other.” (`c-home-en-dark-1440.png`)
2. “My timeline and two purposes survive the move to the map in English and Arabic.” The actual 390 px results retain them, and the original sentence remains available for inspection.
3. “The reference panel tells me the original currency, date, source and price basis together.” The SouthMED dialog marks the press-report figure indicative and separates it from the fictional concept homes.

## Three remaining problems

1. “The expanded brief abbreviates my deadline to ‘Requested by 2028’ rather than preserving the exact before/ready wording in the summary.” The full sentence is retained, so the requirement is recoverable. Future brief controls should express that distinction directly before any match is presented as eligible.
2. “Changing the current market is clear, but the concept still has only one spatial focus at a time.” This is acceptable for the Home/Map concept sprint and explicitly disclosed; the eventual comparison should preserve these two locations visibly together. This is not a claim that the production comparison is complete.
3. “My source panel is good, but small support labels and a variable first map load still reduce comfort on mobile.” The measured map-ready range, rather than the extremely fast text LCP alone, informs the 8.5 speed rating.

## Verdict and gate

“Keep this direction. It finally remembers the whole decision and is clear about the comparison it has not yet made.”

**This persona’s Stage 0 concept score passes** the stated ≥ 9.0 mean / no criterion below 8 gate. This is a recommendation to develop the selected direction; it does not certify the other six persona reviews, the overall stage gate, native Gulf language quality, current external facts, or any production-stage requirement. Preserve the remaining issues in the next-stage design backlog.
