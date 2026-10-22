# Creative Director synthesis — Stage 2 second scored review

**Failed: 8.911/10 across 84 scores; minimum 7.5.** The reviewers are simulated personas, including implementer self-audits, not external endorsements. This round uses the repaired `media/v3` matrix and recordings, plus Karim's additional cross-market probe. The intermediate `media/v2` capture remains preserved separately.

The former mobile overlay collisions, hidden comparison, evidence scroll position, Arabic qualifiers and lost handoff context are repaired. All 26 local browser regressions pass, as do 50 unit cases and 36 mock evals. Automated checks did not expose the remaining geographic failure: a mobile North Coast–Dubai comparison retains the North Coast camera after the sheet collapses. Desktop frames both endpoints, and both layouts correctly suppress a driving-time estimate for this cross-border pair.

## Required fixes

1. Correct mobile comparison framing across sheet sizes. The installed MapLibre version adds fit padding to existing camera padding unless explicitly told to replace it. Use its supported absolute-padding option and bound the geometry to a positive usable viewport. Verify the actual projected positions of both distant endpoints after collapse in both WebGL and geographic fallback.
2. Reduce first content load time. Lighthouse Home97/Explore90 meets the current score threshold, but LCP2.34/2.93 seconds misses the stated two-second target. Evaluate the CSS request waterfall with retained before/after reports. Do not hide the map, change audit settings or call score improvements a timing pass.
3. Investigate the hosted browser failure at run39801016055 once its retained logs are available. Local success does not establish hosted success.

The remaining overview-label and long-brief scanning observations are refinements, not reasons to obscure source qualifications or add more permanent phone controls. Physical M1/phone performance, field INP, native Gulf-language review and comprehensive assistive-technology validation remain explicit unverified requirements.

The next scored round must cite repaired cross-market interaction evidence and new performance results. No score is raised because a fix has been planned. Stage 3 remains unopened.

## Follow-up evidence before the next review

The absolute-padding repair passes projected endpoint checks in both map modes. A separate six-state visual probe in `media/cross-market-v4` confirms the camera correction, but finds that the mobile English fallback notice covers June's marker. This distinguishes being inside the viewport from actually being unobstructed. Make the Explore notice compact and explicitly expandable, then verify the endpoint's pointer access as well as its coordinates.

The inline-CSS measurement improves Home to99/LCP1.807 seconds and Explore to96/LCP2.329 seconds. Home's timing passes in that run; Explore remains open. A further measured payload reduction is being prepared. The hosted failure trace confirms an actual Explore navigation request pending during first development compilation; the scoped functional assertion now allows15 seconds, while production performance budgets stay unchanged.
