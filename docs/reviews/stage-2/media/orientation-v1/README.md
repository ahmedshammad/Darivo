# Orientation label evidence — v1

This is an unscored, simulated visual audit of the saved captures and `checks.json`. No browser, application source, build or server was changed for this audit.

The record covers 32 WebGL states: EN/AR × dark/light × 390/1440px widths × initial/Palm/Downtown/Saadiyat views. Every record reports no browser errors and no horizontal overflow. These checks do not establish accessibility conformance or device performance.

## Actual rendered features

The `rendered` arrays were read from MapLibre's `queryRenderedFeatures` for the added orientation layer through a read-only, test-scoped private React ref. No production map global was exposed. The private-ref discovery is framework-dependent. Counts below exclude native basemap labels and project markers.

| Width / locale | Initial | Palm | Downtown | Saadiyat |
| -------------- | ------: | ---: | -------: | -------: |
| 390 / EN       |       1 |    1 |        1 |        0 |
| 390 / AR       |       1 |    1 |        1 |        0 |
| 1440 / EN      |       4 |    1 |        1 |        1 |
| 1440 / AR      |       3 |    1 |        1 |        1 |

Counts are identical between dark and light themes. Across all states, 42 placements were planned and 38 orientation-feature instances were returned as rendered; these are repeated observations, not 38 distinct places. Twenty-eight states have at least one added rendered feature.

At desktop initial framing, EN renders Palm Jumeirah, Jumeirah Bay, Downtown Dubai and Dubai Hills; AR renders نخلة جميرا, وسط دبي and دبي هيلز. At desktop Downtown framing, all four locale/theme combinations plan both Downtown and Jumeirah Bay but return only Downtown from the added layer. Native symbol placement omits the additional Jumeirah Bay label; a similarly named native label can remain visible. Planned rectangles are conservative placement envelopes, **not measured glyph bounds**. This evidence does not establish pixel-level clearance for every rendered label.

## Inspected images and findings

Eight representative PNGs were opened and visually inspected:

- `en-dark-1440-initial.png`: four added area names give the coastal project columns useful geographic context while retaining the city label and road network.
- `en-light-1440-downtown.png`: Downtown remains identifiable among detailed native neighbourhood labels. The omitted added Jumeirah Bay feature does not mean the place is unnamed: the native label is visible.
- `ar-dark-1440-saadiyat.png`: the added Arabic Saadiyat label is visible alongside native island names and project columns. An equivalent native Saadiyat name also remains, producing repetition.
- `ar-light-1440-initial.png`: Arabic orientation names remain visible within the open map area beside the mirrored reading rail.
- `en-dark-390-palm.png`: the added Palm Jumeirah label sits clear of the visible toolbar, source disclosure and sheet. Native “Nakhlat Jumeira” remains below it; the naming is useful but duplicated.
- `en-light-390-saadiyat.png`: no added orientation label is planned or rendered. Native “Al Saadiyat Island” still supplies geographic context. This is a deliberate omission by the screen-space guard, not evidence that all mobile destinations receive an added label.
- `ar-dark-390-downtown.png`: وسط دبي is visible above the project column with native Burj Khalifa and Business Bay context. No obvious added-label/control collision is visible in this still.
- `ar-light-390-palm.png`: the added نخلة جميرا is readable in the clear central area; a native equivalent repeats beneath it near a column.

Mobile Saadiyat has empty planned and rendered arrays in all four locale/theme cases. The guard prefers omission to forcing a label into the available space. The result improves orientation in the sampled initial, Palm and Downtown views without guaranteeing complete supplementary coverage.

Arabic labels visually show connected text in the inspected stills. This is a limited visual observation, not native-language certification, a complete bidirectional-text test, or proof of every glyph's shaping. Static captures also do not prove collision-free animation, all zoom levels, expanded overlays, keyboard navigation or physical-phone readability. No stage score or gate verdict is assigned here.
