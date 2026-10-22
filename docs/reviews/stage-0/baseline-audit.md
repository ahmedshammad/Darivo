# Current-experience audit — 22 October 2026

Captured with Playwright at 1440 × 1000 in this run; both saved images opened and inspected. This is a design audit of two public screens, not an accessibility or security certification.

1. **Arrival — functional but misaligned.** [Captured Home](media/01-v1-home.png) has generous space, readable typography and coherent colours. The dominant action is “Find your place”; the consultant is a secondary link. A single repeated illustration supplies atmosphere without spatial understanding. It does not reveal the AI-first or living-map proposition within five seconds.
2. **Discovery — a conventional listing portal.** [Captured Search](media/02-v1-search.png) opens with a filter grid and a long repeating card sequence. The map is behind a toggle, and the consultant is a floating side button. “160 considered matches” and identical reasons do not communicate actual curation. Repeated art visually collapses different places into the same property. The filter-first order asks Elena to understand locations before the product helps her understand them.

## Highest-impact changes

Make the composer the first action; let intent change a visible geographic canvas; maintain place selection across the conversation and story; show a few recommendations with brief-specific reasoning and one trade-off. Treat source/date rows as a visual component. Keep the existing server visibility boundary and workflow substrate during the visual rebuild.

## Accessibility risks to resolve in prototypes

Full-map surfaces need legible overlays in both themes, keyboard alternatives to spatial selection, explicit non-WebGL fallback and reduced-motion camera behavior. Mobile composition must retain the composer without covering map attribution or obscuring results. Arabic must preserve punctuation and bidirectional prices, not only document direction.
