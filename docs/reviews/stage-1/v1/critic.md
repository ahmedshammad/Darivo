# The Critic — simulated Stage 1 review, v1

Reviewed the living Design Atlas and component foundation using the **v2 capture matrix**, current implementation and independent EN/AR keyboard probes. This is an AI-authored persona review, not an independent human endorsement. Stage 1 is a design-system/data/auth foundation; unbuilt feature screens are not scored as omissions here.

## Scorecard

| Criterion            |         Score |
| -------------------- | ------------: |
| First-5-seconds wow  |             9 |
| Originality          |             9 |
| AI-first             |             9 |
| Map experience       |             9 |
| Visual craft         |             9 |
| Motion quality       |             9 |
| Arabic & RTL         |             8 |
| Trust & evidence     |             9 |
| Discretion & privacy |             9 |
| Developer appeal     |             9 |
| Speed                |             9 |
| Accessibility        |             8 |
| **Average**          | **8.83 / 10** |

**Gate: below nine; repair the demonstrated command and numeral inconsistencies, then re-review.** The strong map score evaluates the spatial component contracts and sheet ergonomics appropriate to this stage, not an unbuilt terrain or routing implementation. Speed reflects immediate local component interactions, not a 4G production claim.

## Three delights

1. **A system with an editorial point of view.** [English dark arrival](../media/v2/design-en-dark-1440-arrival.png) establishes scale, spacing and the Noir/Sand palette without becoming a conventional component catalogue. [Arabic light mobile arrival](../media/v2/design-ar-light-390-arrival.png) has a separate, comfortable Amiri composition. The typography is the architecture of the page.
2. **The numbers behave like numbers.** Changing display currency to EGP produced 54M/162M/54M milestones and a 270M total from the explicit 20M AED demo assumption. [Evidence specimen](../media/v2/signature-en-evidence.png) keeps the fixed fictional FX date and qualifications beside the projection. This is useful data presentation, not a price label pretending to be a financial tool.
3. **Reduced motion and keyboard alternatives are implemented.** My [Arabic probe](../media/v2/critic-interactions.json) preserved the submitted words with an explicit simulated-response disclosure, let the comparison region scroll via the keyboard, and reported no loading animation under reduced motion. Escape from the bottom sheet returned focus to its trigger. The [Arabic sheet](../media/v2/signature-ar-sheet.png) is legible and has a labelled expand action.

## Three problems

1. **The command palette does not begin where the user expects.** Opening it focuses **Close**, so typing “Numbers” leaves the query empty. After explicitly focusing search, ArrowUp selects the fourth of five commands instead of the last. These are actual interaction defects in the system's principal navigation shortcut. Focus search on open and correct the initial ArrowUp index; verify using keyboard events rather than locator-based `fill` alone.
2. **The numeral preference is internally inconsistent.** Enabling Arabic-Indic digits changes prices and percentages, but comparison areas remain `520 / 460` and years remain `2026–2029`. [Independent evidence](../media/v2/critic-interactions.json) records the mismatch. Route authored numeric specimen values through one explicit numbering preference; keep identifiers and exact source dates separately isolated where preservation matters.
3. **The narrow comparison asks the reader to discover its movement.** In [mobile evidence](../media/v2/signature-en-evidence.png), the second residence is clipped at the edge. Keyboard scrolling works, which is good, but a subtle visible “more columns” or overflow treatment would improve discovery without sacrificing the table. This is a refinement; the first two findings are the re-review blockers.

## Evidence and limits

The [matrix manifest](../media/v2/manifest.json) reports zero axe violations, horizontal overflow and page errors across the 12 width/language/theme combinations. Those checks did not catch the initial-focus and arrow-navigation problems; the independent probe explains why automated cleanliness is insufficient.

The [native PostgreSQL fixture](../native-db.json) records 250 units, 16 fictional projects, 13 reference projects, nine real reference organisations plus one aggregate, 241 sourced facts and 52 demo POIs. It records zero invalid unit attachments and no invented retrieval dates across two seed runs. This supports foundation integrity; it is not a claim of legal compliance or live source re-verification.

**Verdict:** “The visual language is ready to become a product. First make its keyboard invitation and numeral promise behave as carefully as its typography.”
