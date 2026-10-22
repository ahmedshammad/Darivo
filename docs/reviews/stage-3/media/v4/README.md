# Interrupted recovery capture

Production source: `210f413` (the already-built recovery change). Four desktop English dark states were captured with no page errors, axe violations or horizontal overflow.

The capture stopped while opening the requirements editor. Its helper read the disclosure state before the UI's animation-frame focus effect, then clicked the summary after the effect had opened it, closing it again. This was an automation race; all eight production reading/recovery regressions had passed. The helper now awaits the visible evidence checkbox without clicking the summary. The complete repeated matrix is recorded separately in `../v5/`.

This interrupted run is not a complete review matrix or a passing stage review. Original log: `/tmp/darivo-stage3-production-capture-v4.log`.
