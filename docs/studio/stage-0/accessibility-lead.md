# Accessibility Lead · Stage 0

## Non-negotiable experience

A client must be able to describe a brief, find a place, inspect a recommendation and return to the map without dragging, hovering, seeing colour or hearing speech. Luxury is clarity and control.

## Prototype contract

- Native buttons, links and forms; visible focus rings; a skip link; meaningful headings; translated labels.
- At least 44 px targets for primary mobile controls. Do not make small editorial labels the sole hit area.
- A keyboard-operable expanded/collapsed mobile sheet. Dragging may supplement its button, never replace it.
- The map supplements a textual list of places and recommendations. It must not be the only source of information.
- Theme and language controls communicate their action. Selected map chips expose `aria-pressed`.
- Conversation updates use a polite status region. Do not announce camera animation frames.
- Demo and approximate-location disclosures are visible and available to assistive technology.
- Voice permission occurs only after explicit activation. If unsupported, typing remains available with a clear explanation.
- Avoid motion on reduced-motion preference: camera changes become instantaneous, CSS transitions and decorative movement stop.

## Theme strategy

Bronze is used as an accent and not assumed to meet text contrast. Sand light theme uses dark ink body text; dark theme uses ivory on near-black. Muted labels must remain legible. Do not rely on green/bronze alone to signal trust or selection.

## Required evidence

Run axe for Home and Explore in both themes and languages. Manually traverse focus order, use Enter to submit the composer, activate map/location controls, expand the mobile sheet, save and return home. Inspect at 200% zoom and 390 px for overflow. Test reduced motion separately. A zero-axe result cannot by itself establish WCAG 2.2 AA conformance; production needs screen-reader and real-device evaluation.

## Disagreement and decision

A completely invisible navigation system feels cinematic but makes the product difficult to learn and use. Sand Editorial keeps thin, visible controls and a numbered spatial sequence. Likewise a purely draggable sheet is rejected; an explicit expand button is retained.

## Stage 0 gate

No scores before screenshots and interaction evidence. Record any failures, fix and recapture. Never label untested target-device performance or unreviewed screen-reader behavior “passed”.
