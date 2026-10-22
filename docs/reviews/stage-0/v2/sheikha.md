# Sheikha Al-Mansoori · selected C v4 re-review

This is a **simulated persona review of Stage 0 concept merit**, not a client interview, independent market research, native-language certification or production acceptance. The reviewing agent authored rejected Concept B but did not edit selected C. Scores below come from the revised C evidence and direct interaction, not from a requirement to reach the gate. Later-stage financial comparison, licensed schools, authenticated private inventory and production AI are not claimed complete.

## Evidence inspected

- Fresh `../media/v4/` captures: dark desktop Home 1440, Arabic light Home 1024, English dark Map 1024, Arabic light Map 390, plus the earlier v3 visual comparison. The complete v4 matrix contains Home/Map in both themes and languages at all three requested widths.
- Independently submitted the three client prompts in **EN and AR at 390×844**, expanded/collapsed the mobile sheet, and opened the location-specific source dialog. Results are in [`client-interactions-v4.json`](client-interactions-v4.json); six screenshots are `../media/v4/client-{persona}-{lang}-390.png`.
- In all six flows, selected points remain visible above the collapsed and expanded sheet. Collapsed target y ≈ 397.5–417.5; sheet top y490–508. Expanded target y ≈ 340.5–351.5; sheet top y390. Every viewport scrollWidth is 390. These are projected map-target coordinates measured against actual overlay rectangles, not merely map-center longitude/latitude.
- [`client-keyboard-v4.json`](client-keyboard-v4.json) records first focus on the skip link, Enter submission, keyboard sheet expansion, keyboard source-dialog opening, Escape close, and no camera movement after 100 ms in a reduced-motion Arabic mobile context.
- `../media/v4/quality.json`: 12 configurations, zero reported axe violations on Home/Map, no horizontal overflow, school priority matched throughout. The isolated local frame sample reports106 frames, median 16.6 ms, p95 17.5 ms, maximum 18.3 ms, zero frames above 50 ms. Local text LCP 52–152 ms and map-ready 1.28–3.58 s describe this desktop run; they do **not** prove throttled 4G LCP, physical-phone 60 fps or full WCAG conformance. The earlier v3 measurement overlap is not used for this score.
- Orla, SouthMED and Sei Saadiyat dialog data were compared with the supplied JSON. Price/currency, date, basis, coordinates and source URLs match. This proves faithful reference rendering, not independent verification of present market truth.

“Now I see both places I mentioned, and I can see that privacy was heard. The office feels quieter because it is being more precise.”

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
| Discretion & privacy |      9.5 |
| Developer appeal     |        9 |
| Speed                |      8.5 |
| Accessibility        |      8.5 |
| **Mean**             | **9.08** |

No criterion is below 8. Ratings are subjective concept judgments informed by the evidence above, not automated measurements or a certification. No 10s are assigned.

## Resolved from earlier iterations

The v1 globe text collision is resolved: the headline has a quiet field. Amiri now gives Arabic a deliberate display treatment. The mobile map is visible above a reversible sheet. The v3 missing Palm alternative and privacy priority are now retained in both languages: “Saadiyat · The Palm” / «السعديات · النخلة» and “Discretion requested” / «الخصوصية مطلوبة». The response explicitly says both places remain and no real listings have been compared. Selecting the Saadiyat context now opens **Sei Saadiyat**, not Dubai’s Orla.

## Three delights

1. “The Arabic headline feels composed, not tilted into an English serif idea. The quiet globe gives it breathing room.” (`c-home-ar-light-1024.png`)
2. “My family, both places and privacy are visible in the brief. My original words are retained too, so I can check what was understood.” The EN/AR browser results show this directly.
3. “I can expand the selection without burying my place, and the reference is now for Saadiyat with its source, date and basis.” The target remains above the sheet; Sei’s broker-page basis is disclosed.

## Three remaining problems

1. “The brief is still compact enough that some Arabic support text feels small on a phone.” Axe finds no violation, but visual comfort remains below the standard of the generous headline; this limits accessibility to 8.5 rather than a blanket 10.
2. “My Saadiyat request is for a villa; the geographic reference spotlight is an apartment project.” The dialog states its actual type and does not call it a matched unit, so this is no longer misleading. A clearer “area reference” label would prevent even a moment of uncertainty.
3. “The globe can take longer than the text to appear.” Observed map readiness varies up to3.58s. A refined map-loading state and target-device checks remain necessary; the speed score reflects this limitation.

## Verdict and gate

“I would continue this conversation. The chosen concept now earns its discretion through visible, careful listening.”

**This persona’s Stage 0 concept score passes** the stated ≥ 9.0 mean / no criterion below 8 gate. This is a recommendation to develop the selected direction; it does not certify the other six persona reviews, the overall stage gate, native Gulf language quality, current external facts, or any production-stage requirement. Preserve the remaining issues in the next-stage design backlog.
