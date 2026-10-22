# Fresh v4 fallback and local comparison probes

Production preview port 3001, 390×844, reduced motion. No app code edits. Browser closed after both probes. These files are newer than `media/cross-market-v4`; that older folder retains the notice-occlusion failure.

## Compact fallback repair: passed

`checks.json` and the EN/AR numbered screenshots record the complete June–Orla fallback comparison after manual zoom/pan. In both languages:

- Initial manual zoom/pan changes the fallback camera; comparison subsequently refits both endpoints.
- The default closed notice is46px high and no longer covers June.
- Keyboard Enter opens the notice and exposes the fallback limitations; Enter closes it again.
- Actual unforced pointer clicks on **both**44×44 project buttons open the correct evidence heading with focus. June and Orla both work; this is stronger than a bounding-box-only assertion.
- Returning to the map restores the comparison view. Distance-only wording has no cross-border minute estimate.
- No page errors or horizontal overflow occurred.

The compact map screenshots were opened and visually inspected. Source data/market truth remains supplied reference material, not independently current verification.

## Arabic local comparison: unresolved

A separate fresh WebGL probe reproduces the exact signature prompt: «فيلا على البحر في السعديات أو النخلة». The first two cards select `demo-project-palm-jumeirah` and `demo-project-emirates-hills`.

After “Show connections on the map”, both points lie within viewport/sheet bounds, but **both are covered by controls**:

| Endpoint            | Actual projected center | Covering element         | Overlay bounds          |
| ------------------- | ----------------------- | ------------------------ | ----------------------- |
| Palm Jumeirah demo  | (115.65,175)            | `.atlas-stories`         | x20–370,y147–187        |
| Emirates Hills demo | (274.35,432)            | `.atlas-comparison-peek` | x100–370,y413.05–457.05 |

`document.elementsFromPoint` confirms the story element and comparison button are the actual hit targets at the respective centers. Evidence: `ar-local-compare.json` and `ar-local-compare-map.png`.

The comparison safe area must reserve the top story-control band **and** the bottom comparison/source band. This cannot be considered repaired solely because both centers are inside the viewport. Scores are held pending the owner's repair and fresh evidence; earlier failed reviews remain unchanged.
