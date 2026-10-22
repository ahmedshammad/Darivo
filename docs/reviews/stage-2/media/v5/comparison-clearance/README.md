# Fresh v5 comparison clearance probe

Production preview v10 on port 3001. Chrome headless, dark theme, reduced motion. The eight cases cover Arabic local Palm Jumeirah/Emirates Hills and English cross-market June/Orla, at 375×812 and 390×844, in WebGL and forced fallback. No app code edits. Browser closed and released after capture. This is a focused behavioral/visual probe, not a new scored review or performance measurement.

## Result: endpoint repair passes; expanded disclosure remains obstructed

[checks.json](checks.json) records eight successful automated geometry/interaction cases. The `pass` fields represent those scripted assertions only. Subsequent inspection of the saved screenshots found a separate visual disclosure failure, so this report does **not** give the complete comparison flow an unconditional pass.

1. **Comparison framing — pass.** Each projected endpoint's full 44×44 target rectangle clears the viewport edges and actual visible story, tool, zoom, source, conversation, sheet and comparison-control rectangles. Both modes pass at both widths. This is stronger than the earlier viewport-center-only assertion.
2. **Fallback evidence — pass.** Eight actual unforced pointer clicks (two projects in each of four fallback cases) open the correct evidence heading and focus it. Escape and Show connections return to the framed comparison; clearance still passes. No page errors or horizontal overflow.
3. **Redundant notice removal — pass.** The fallback notice is absent during comparison. Source disclosure is keyboard reachable with Enter and retains the complete limitations text in the DOM. The offline street/3D detail warning remains visually readable.
4. **Full limitations presentation — fail.** The View comparison button paints over the lower lines of the expanded source panel in both languages. It obscures distance assumptions/route qualifications even though text-presence assertions succeed. See the exact `*-02-limitations.png` frames. Raise the source panel above that control or hide the comparison peek while the panel is open, then recapture both languages and widths.

## Representative saved images inspected

- [Arabic 375 WebGL map](ar-375-webgl-01-map.png): both local endpoints clear the previous story/peek hitboxes.
- [Arabic 390 fallback map](ar-390-fallback-01-map.png): both endpoints and the simplified geography are visible; detailed streets/3D remain unavailable by design.
- [English 375 fallback map](en-375-fallback-01-map.png): June–Orla connection and endpoints clear controls.
- [English 390 WebGL map](en-390-webgl-01-map.png): both markets framed; country labels and count symbols remain visible.
- [Arabic expanded limitations](ar-375-fallback-02-limitations.png) and [English expanded limitations](en-390-fallback-02-limitations.png): confirmed comparison-button overlap, not a missing DOM string.
- [Arabic focused Palm evidence](ar-375-fallback-03-demo-project-palm-jumeirah.png): correct demo project opens with source/original currency visible.

Source values remain supplied reference/demo material, not independently verified current market truth. Automated clearance and pointer checks do not certify physical-phone or screen-reader behavior. Hosted CI performance failure is a separate unresolved investigation; no speed conclusion is inferred from this local probe. Earlier failed review rounds and captures remain unchanged.
