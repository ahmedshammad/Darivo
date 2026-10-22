# Focused map label repair — development evidence

22 October 2026. Chrome hardware WebGL, local development server on port 3000, 390×844, EN/AR dark. These are focused repair captures, not a new production matrix or scored review. Both journeys select June and ORLA, collapse the comparison sheet, and wait for camera/deck/tiles readiness. `checks.json` records both WebGL modes and zero page errors.

The previous fixed midpoint annotation appeared over the Saudi Arabia label. `atlas-overlay-text` now tries bottom/top/left/right anchors around the midpoint, with a radial offset and collision padding; overlap remains disabled and no country-label layer is hidden. In both inspected captures the numeric distance is above the line and the Saudi Arabia name remains separately legible below. This uses MapLibre's [documented variable-anchor placement](https://maplibre.org/maplibre-style-spec/layers/#text-variable-anchor).

The independent eight-case evidence-panel checks are in `../v7-polish/checks.json`. The renderer now accepts `hideSelectedPopup`; Explore supplies it only when the mobile expanded panel displays the selected project. The existing popup is removed while the point/highlight remains, then restored when that condition clears. This avoids MapLibre's full-canvas auto-anchor placing redundant project text behind the toolbar. Desktop behavior is preserved by the consumer's mobile condition.

Scoped ESLint and TypeScript passed. No production rebuild, restart, commit, or rescoring was performed by this agent. Prior v6 evidence and v4 review files are unchanged.
