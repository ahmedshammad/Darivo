# v6 manual disclosure and software-renderer validation

Production v12, localhost:3001. EN/AR at 375×812 and 390×844, dark theme, reduced motion. Eight Explore disclosure cases: four forced fallback and four actual SwiftShader fallback. Four additional Home captures record the real software-renderer explanation. Browser sessions were closed and released. No application changes or new scores.

## Result: targeted visual repair passes

1. **Expand source disclosure — pass.** Keyboard Enter opens the panel. View comparison, stories and toolbar yield their space. All eight saved `*-02-disclosure-top.png` images were opened and visually inspected: the lower distance/route qualifications are readable, repairing the v5 overlap.
2. **Read full panel — pass.** A 5×5 grid of `elementFromPoint` samples at the panel's top and attempted bottom scroll positions finds no covering element in any case. The complete tested text fits without scrolling (clientHeight equals scrollHeight, 158–212px). The `*-02-disclosure-bottom.png` frames and measurements are retained; this does not establish behavior with arbitrarily longer future content.
3. **Return to comparison — pass.** Enter closes the panel and restores View comparison in every case. No page errors or horizontal overflow occurred.
4. **Actual software fallback — pass.** Chrome launched with ANGLE SwiftShader. An unmocked WebGL2 context reported `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (LLVM 10.0.0) (0x0000C0DE)), SwiftShader driver)`. Without a forced-fallback query or mocked canvas API, Home and Explore report `data-fallback-reason="software-renderer"`. All four Home `*-00-arrival.png` files were opened: “Smoother 2D map for this device” and the Arabic equivalent are readable, with street/3D limitations. The same explanation appears in Explore's source disclosure.

[checks.json](checks.json) contains raw renderer strings, source text, panel bounds, coverage samples, visibility restoration, page errors and overflow. `*-01-comparison.png` and `*-03-return.png` preserve the surrounding state. English uses June/Orla; Arabic uses the same local Palm Jumeirah/Emirates Hills demo pair that previously failed.

## Evidence limits

This probe closes the observed source-disclosure stacking defect and verifies the device-specific explanation. It does not repeat the owner's separate actual offset-WebGL-click suite, certify native Arabic or screen-reader quality, or measure performance. No score is inferred from it. Lighthouse and hosted CI results remain separate evidence; the explicit two-second LCP target is not declared satisfied. Earlier v5 failures remain unchanged.
