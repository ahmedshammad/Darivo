# Draft Explore reading-surface polish

Development preview on port3000. Eight EN/AR × dark/light ×375/390 configurations, with reduced motion. Each has a collapsed conversation and expanded Orla evidence screenshot; [checks.json](checks.json) records the measurements. This is draft visual validation, not a new scored review, production capture or performance benchmark.

The conversation rail/sheet now uses the same RGB colours with a solid background: dark `rgb(15,29,33)` and light `rgb(248,246,239)`. Other floating map surfaces retain their existing styling. The expanded mobile evidence state supplies `hideSelectedPopup` to the renderer, removing only its redundant native popup while the full project name is present in the sheet. The selected map state remains active.

All eight evidence screenshots were opened and inspected, plus representative collapsed conversation frames. Underlying map lettering no longer competes with the reading surface in either theme. Geography remains visible outside the panel. The project name, original amount and source qualification remain visible; the native popup count is zero in all eight expanded mobile evidence states. All computed surface backgrounds are opaque, component opacity is1, and all checks report no page errors or horizontal overflow.

Scoped ESLint, full TypeScript and formatting checks pass. Browser was closed/released after capture. Desktop popup preservation and comparison-label improvements belong to the renderer owner's separate checks. No production build, restart, commit or change to historical v4 scores was performed for this capture.
