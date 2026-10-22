# Client re-review observations · C v3

**Iteration evidence, not a scored gate result.** Final persona scoring is held for v4 because fixes to brief retention, reference context and attribution are in progress. No UI files were edited by this reviewer.

## Evidence

- Inspected v3 Home/Map screenshots at 1440, 1024 and 390, including EN dark desktop Home, AR dark mobile Home, EN light mobile Home, AR light tablet Home, AR dark tablet Map, EN light desktop Map and AR light mobile Map.
- Exercised all three client prompts in EN and AR at 390×844 in Chrome. Actual outputs and rectangle measurements are saved in [`client-interactions-v3.json`](client-interactions-v3.json).
- Saved six result screenshots under `../media/v3/client-{sheikha,karim,elena}-{en,ar}-390.png`. These interaction captures include temporary focus/toast state where present; use the official matrix for settled composition.
- Compared Orla/SouthMED dialog values and links against `data/reference/darivo_reference_dataset.json`. Prices, currencies, as-of dates, basis and coordinates match the supplied records. This proves faithful rendering of supplied references; it does not independently verify current market truth.
- `../media/v3/quality.json` reports zero axe violations and no overflow across 12 language/theme/width configurations, with Home and Map assessed. It reports local LCP values of 48–72 ms and a 128-frame sample with median 16.6 ms and p95 18.3 ms. Some browser review work overlapped this measurement run; performance should be rerun without contention. These numbers are not a throttled-4G or physical-phone certification.

## Resolved visibly

1. Globe label clutter has been removed from the headline field. The globe remains geographic while both language headlines read clearly.
2. Amiri gives Arabic display text a deliberate editorial voice; synthetic slant is no longer the organizing device.
3. Mobile Map has a genuinely useful collapsed sheet and the chosen target is visible between the brief and sheet.
4. All six persona flows place the target at x≈195, y≈378–387 with a collapsed sheet beginning at y≈490–508. Expanded sheet begins at y390 and target moves to y≈321. The measured target is above the sheet in both states. Each recorded viewport has scrollWidth390.
5. Elena’s school request now creates “Schools to verify” / «التحقق من المدارس» in the brief, and the response explicitly avoids unsupported school proximity or travel-time claims.
6. Reference dialog gives original currency, price basis, as-of date, source links, approximate coordinates and a clear distinction between real project reference and unrelated fictional concepts.

## Remaining before v4

### Sheikha

The EN/AR request includes Saadiyat **or Palm**, family and privacy. The brief shows only Saadiyat, family and “Close to the water”; the alternative and privacy priority are absent. The full input remains in the composer, but that is not equivalent to a brief retaining the decision. Minimal concept fix: display the retained locations and privacy need, and clearly identify which one the map is currently showing.

The source button in the Saadiyat state opens **Orla on Palm Jumeirah in Dubai**. The data is sourced, but the context is confusing, especially with Arabic «المشروع ومصادره». Select a location-appropriate reference or explicitly label the unrelated spotlight before opening it.

### Karim

Both EN/AR prompts include North Coast, Dubai investment and ready-before-2028. The current brief reduces this to North Coast / family / waterfront. It does not visibly retain Dubai, investment intent or the year. Minimal concept fix: show both purposes and locations plus the timeline; a clearly pending comparison is sufficient at Stage 0. Full financial comparison implementation is not required.

### Elena

The school priority is now recognized, which resolves the most serious mismatch. The phrase “British school” becomes the broader “Schools to verify”; preserving the qualifier would better demonstrate careful listening. The teaching state still explains its evidence limits rather than showing much spatial contrast between neighborhoods. Add one clearly illustrative geographic teaching sequence or a short differentiated explanation when refining this direction; do not invent real schools or travel times.

## Review position

The visual and mobile interaction improvement is substantial. The remaining issues concern what the concept visibly claims to remember and how its reference belongs to the selected place. Those are fair Stage 0 design checks, not demands to finish later production features. Keep this record intact and judge the next revision from fresh evidence rather than assuming these fixes succeeded.
