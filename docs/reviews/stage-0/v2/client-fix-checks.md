# Client persona fix checks · selected Concept C

**Status: criteria defined; revised v3 evidence pending.** These checks are derived from the first simulated Sheikha/Karim/Elena reviews. They define what the next review will inspect; they are not a pass result or provisional score.

The selected concept is C’s two-shore globe and map workspace. Judge Stage 0 design and demonstrated prototype interactions. Do not require completed later-stage payments, live inventory, school data, authentication or production AI. Conversely, a concept must represent its own behavior truthfully and preserve the intent it claims to understand.

## Evidence set required

- Fresh v3 Home and Map captures at 1440, 1024 and 390 px, EN/AR, light/dark. Keep old captures intact.
- Fresh signature-flow recording and `quality.json` with its tested scope and source revision.
- Actual browser interactions in EN and AR, including at least one 390 px sequence. A screenshot of a canned brief does not demonstrate intent preservation.
- Inspect the selected geographic point projected into the viewport against actual panel/composer rectangles. Avoid treating map-center coordinates as proof the place is visible.
- Record what is measured, visually observed, inferred or unverified. Desktop timings are not proof of target-phone performance. Native-quality Gulf Arabic and WCAG conformance cannot be certified by these simulated persona reviews.

## Shared visual and spatial checks

| ID  | Original issue                                                 | Required visible result                                                                                                                                      | Evidence / method                                                                                           |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| S1  | Globe country labels collide with headline and subtitle        | Hero copy sits on a quiet, clearly separated field; geography still provides orientation                                                                     | Inspect dark/light, EN/AR, 1440/1024/390 screenshots                                                        |
| S2  | Mobile map covered by brief and recommendation panels          | A recognizable geographic target is visible in the initial Map state; controls offer an explicit way to expand/collapse details                              | Inspect 390 screenshots, then toggle sheet with pointer and keyboard                                        |
| S3  | Camera targets a location behind the sheet                     | After each intent or place change, the selected point remains within unobscured map space, including RTL                                                     | Project target with MapLibre and compare against visible overlays; confirm by screenshot                    |
| S4  | Mobile first impression becomes a stack of panels              | Globe or map remains meaningfully visible within the first viewport; no essential map discovery depends on scrolling past oversized text                     | Inspect Home at scrollY=0 and 390×844; use the signature flow into Map                                      |
| S5  | Layout differs between EN and AR or clips at narrow widths     | No horizontal overflow; no accidental English primary place labels in Arabic; line breaks and numbers remain readable                                        | DOM width assertion plus visual inspection of the full matrix                                               |
| S6  | Same generic brief appears after materially different requests | The demonstrated parser retains known intent and labels unresolved needs; it does not replace a school or multi-market requirement with a waterfront default | Submit the three persona prompts below and inspect the actual brief text                                    |
| S7  | Trust detail might be decorative                               | Demo basis and approximate-location language stay attached to fictional examples; source/date claims, if introduced, have traceable provenance               | Inspect source links and cited local dataset fields; avoid treating a current date as external verification |
| S8  | Appearance improved but interaction remains inaccessible       | Composer, location chips, sheet, brief editing, language and theme remain operable with visible focus; reduced motion does not animate long camera flights   | Keyboard sequence, accessibility results, reduced-motion browser context                                    |

## Sheikha — Arabic, discretion, control

**Prompt:** «أبغى فيلا على البحر للعائلة في السعديات أو النخلة، وتهمني الخصوصية».

1. The brief retains family, waterfront and privacy priorities. Saadiyat and Palm are both acknowledged, or the interface explicitly says which place it is showing first while retaining the alternative.
2. Arabic editorial text does not use an unconsidered synthetic italic; hierarchy and line-height are deliberately tuned. Mixed-script labels and numerals do not interrupt reading order.
3. The 390 px Arabic map shows the selected coast or island above the collapsed sheet. Expanding details is reversible without losing the selected place.
4. Any privacy wording describes actual prototype behavior. Voice, persistence and transmission are distinguished if they work differently. No unimplemented secure account is implied.
5. Primary visible place captions and control labels are Arabic. Map-provider fallback names may remain mixed only where source data lacks a translation, and should not become the main editorial title.

**Review voice:** “I can understand what you heard, see the place, and decide when to reveal more.”

## Karim — two shores, coherent evidence

**EN prompt:** “North Coast summer home ready by 2028, compare with a Dubai investment.”

**AR prompt:** «بيت صيفي في الساحل الشمالي يتسلم قبل ٢٠٢٨، وقارنه باستثمار في دبي».

1. Both North Coast and Dubai remain in the brief, and 2028 remains the requested timeline. A concept can show comparison as unresolved; it cannot silently drop half the sentence.
2. The camera may begin in one market, but headings, coordinates, recommendation context and trade-off text correspond to that market.
3. Any fictional prices retain an explicit currency and Demo basis. Do not imply converted equivalence without a dated rate. Absence of production conversion is not itself a Stage 0 failure.
4. The globe clearly differentiates Egypt and UAE without a wall of irrelevant labels.
5. Source/date chips, if present, lead to the evidence for the displayed fact rather than generic homepages. Fictional data uses a demo creation/as-of label, not a fabricated publisher.

**Review voice:** “The interface remembers both sides of my decision and is exact about what it does and does not know.”

## Elena — learning rather than relabeling

**EN prompt:** “Explain Dubai neighbourhoods for a family with two kids near a British school.”

**AR counterpart:** «عرّفني على أحياء دبي لعائلة عندها طفلين وتبي تكون قريبة من مدرسة بريطانية».

1. The resulting brief keeps the school requirement and family context. It must not substitute “Close to the water” unless the user asked for it.
2. The teaching state demonstrates a spatial explanation: named perspectives, an illustrative neighborhood distinction, or a deliberate map sequence. A heading change alone is insufficient.
3. No real school proximity, drive time or educational quality is invented. A hypothetical example is clearly marked as such; a missing licensed layer is acknowledged without obstructing the concept flow.
4. The selected place remains visible at 390 px after typing, submission, panel expansion and collapse.
5. A first-time visitor can return from the explanation to the map without guessing an icon or hunting below the fold.

**Review voice:** “I leave the first minute with a clearer mental map, and my actual question remains in view.”

## Scoring protocol for the next review

Re-score all 12 Part H criteria from new evidence, with three remaining delights and three remaining problems per persona. Describe resolved v1 findings explicitly. Do not carry old scores forward automatically, reward unchanged screenshots, penalize unfinished later-stage features, or force the mean to 9.0. Any still-visible design defect affects the applicable concept criterion. Missing evidence is reported as unverified. The gate remains average ≥9.0 with no criterion below 8, and only a fresh completed review can establish that result.
