# Office capture preflight — failed harness

This first local development matrix is preserved. It captured 36 portfolio, comparison and viewing-confirmation states across EN/AR, light/dark and 390/1024/1440 widths. Those completed states had zero page errors, all-rules axe findings or document overflow.

All 12 configurations then stopped at an incorrect capture assertion: an empty advisor-message list was expected to have visible height. The page correctly displayed the authored Demo advisor, no-messages state and a usable message composer. No fictional conversation was inserted to make the assertion pass. The corrected capture waits for the list to be attached and the Send control to be visible.

These images also informed a narrow phone comparison adjustment: the first table heading previously forced a wide row-label column. The later round uses a 110px phone heading and explicitly explains horizontal scrolling. This preflight is not the final Office matrix or review acceptance.

Run: `scripts/capture-office.ts`; log: `/tmp/darivo-office-capture-v1.log`. Fixture portfolio was deleted, fixture viewing request cancelled, and original privacy flags restored by the script. Cancelled requests remain as designed. Later evidence is stored separately in `../office-v2/`.
