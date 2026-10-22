# Stage 1 — initial review synthesis

The seven simulated persona reviews produce an exact board mean of **8.839/10**, with minimum criterion **8**. The gate fails. The numerical result is generated from the individual tables in [scorecard.json](scorecard.json); no review is discarded or rounded upward to pass.

The foundation has a coherent editorial language, correct illustrative currency arithmetic and strong data separation. Forty tests and 36 mock evaluations pass against native PostgreSQL16; the 12-state guide matrix has no automated accessibility findings, page errors or horizontal overflow. Those results do not compensate for the interaction defects found independently by the board.

## Required fixes before re-review

1. Focus command search on opening, make ArrowUp from search select the last result, and move focus to the destination heading after selection. Escape should still return focus to the opener.
2. Apply the numeral preference consistently to authored years, comparison areas, rates and numeric specimen copy while preserving underlying values and source URLs.
3. Allow long Brief values to wrap and remain editable, especially budget/settlement wording on 390px screens.
4. Give the bottom sheet real collapsed and expanded geometry and preserve keyboard access to all content.

## Refinements and evidence limits

The narrow comparison needs a clearer hint that more columns are available. Small supporting financial/source text needs continued attention. Both remain explicit review considerations rather than hidden exceptions. Re-run the complete screenshot matrix and signature recordings after changes, and add regression checks for keyboard behavior, numeral consistency and sheet expansion.

No production map, actual AI inference, live FX or real-project availability is implied by the component specimens. Native-reader, physical-device and full assistive-technology validation remain distinct from simulated reviews and automated tests. Hosted CI is still pending. Stage 2 must not begin while this gate is open.
